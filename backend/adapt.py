"""Compare and train lightweight sentiment models with review-domain data."""

import hashlib
import json
from datetime import datetime, timezone
from urllib.request import urlopen

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, recall_score
from sklearn.model_selection import GroupShuffleSplit

from backend.train import LABELS, ROOT, build_pipeline, load_split
from backend.evaluate_feedback import Dataset
from backend.sentiment import predict_feedback

REVIEW_REVISION = "6010dd8f1af5cb0bb2537e91bc05ff207497ae34"
REVIEW_URL = f"https://huggingface.co/datasets/InfinitodeLTD/CRSD/resolve/{REVIEW_REVISION}/data.csv"
MODEL_VERSION = "feedback-tfidf-lr-v2"


def normalized_text(frame):
    return frame.text.str.strip().str.casefold()


def remove_overlap(train, held_out):
    return train[~normalized_text(train).isin(normalized_text(held_out))].copy()


def review_splits():
    path = ROOT / "data" / f"customer_reviews-{REVIEW_REVISION}.csv"
    path.parent.mkdir(exist_ok=True)
    if not path.exists():
        with urlopen(REVIEW_URL, timeout=60) as response:
            path.write_bytes(response.read())
    frame = pd.read_csv(path).rename(columns={"review": "text", "sentiment": "label", "model": "generator"})
    if not {"text", "label", "generator"}.issubset(frame.columns):
        raise ValueError("Review dataset has unexpected columns")
    frame = frame.dropna(subset=["text", "label", "generator"])
    frame["text"] = frame.text.str.strip()
    frame["label"] = frame.label.str.strip().str.lower()
    if not set(frame.label).issubset(LABELS):
        raise ValueError("Review dataset contains unknown labels")
    frame = frame[frame.text.str.len() > 0].copy()
    frame["normalized"] = normalized_text(frame)
    conflicting = frame.groupby("normalized").label.nunique()
    frame = frame[~frame.normalized.isin(conflicting[conflicting > 1].index)]
    frame = frame.drop_duplicates(subset=["normalized"])
    # Entire generating-model groups are held out to reduce synthetic style leakage.
    train_validation_idx, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=2, random_state=42).split(frame, groups=frame.generator))
    train_validation, test = frame.iloc[train_validation_idx], frame.iloc[test_idx]
    train_idx, validation_idx = next(GroupShuffleSplit(n_splits=1, test_size=2, random_state=17).split(train_validation, groups=train_validation.generator))
    train, validation = train_validation.iloc[train_idx], train_validation.iloc[validation_idx]
    train = remove_overlap(train, pd.concat([validation, test]))
    validation = remove_overlap(validation, test)
    for split in (train, validation, test):
        if set(split.label) != set(LABELS):
            raise ValueError("Each review split must contain all sentiment labels")
    return train, validation, test, hashlib.sha256(path.read_bytes()).hexdigest()


def metrics(pipeline, frame):
    predicted = pipeline.predict(frame.text)
    return {
        "examples": len(frame),
        "accuracy": accuracy_score(frame.label, predicted),
        "macro_f1": f1_score(frame.label, predicted, labels=LABELS, average="macro", zero_division=0),
        "negative_recall": recall_score(frame.label, predicted, labels=["negative"], average="macro", zero_division=0),
        "neutral_recall": recall_score(frame.label, predicted, labels=["neutral"], average="macro", zero_division=0),
        "classification_report": classification_report(frame.label, predicted, labels=LABELS, output_dict=True, zero_division=0),
        "confusion_matrix": {"labels": LABELS, "rows_actual_columns_predicted": confusion_matrix(frame.label, predicted, labels=LABELS).tolist()},
    }


def select_candidate(comparisons):
    baseline_neutral_recall = comparisons[0]["tweet_validation"]["neutral_recall"]
    for candidate in comparisons:
        candidate["eligible"] = candidate["regressions_passed"] and candidate["tweet_validation"]["neutral_recall"] >= baseline_neutral_recall - 0.03
    eligible = [candidate for candidate in comparisons if candidate["eligible"]]
    if not eligible:
        raise ValueError("No candidate fixes the reported regressions while preserving neutral recall; the model was not replaced")
    return max(eligible, key=lambda candidate: candidate["validation_score"])


def main():
    tweet_train, train_hashes = load_split("train")
    tweet_validation, validation_hashes = load_split("val")
    tweet_test, test_hashes = load_split("test")
    review_train, review_validation, review_test, review_hash = review_splits()
    held_out = pd.concat([tweet_validation, tweet_test, review_validation, review_test])
    tweet_train = remove_overlap(tweet_train.drop_duplicates("text"), held_out)
    review_train = remove_overlap(review_train, held_out)
    review_validation = remove_overlap(review_validation, tweet_test)
    tweet_validation = remove_overlap(tweet_validation.drop_duplicates("text"), pd.concat([tweet_test, review_test]))
    tweet_test = tweet_test.drop_duplicates("text")
    combined_train = pd.concat([tweet_train, review_train], ignore_index=True)
    regression_path = ROOT / "evaluation" / "regression_feedback.json"
    regressions = Dataset.model_validate_json(regression_path.read_text(encoding="utf-8"))
    if normalized_text(combined_train).isin([item.text.strip().casefold() for item in regressions.examples]).any():
        raise ValueError("Regression feedback must stay out of training")
    comparisons = []
    pipelines = {}
    for weight in (0, 0.5, 1, 2, 6):
        pipeline = build_pipeline()
        train = tweet_train if weight == 0 else combined_train
        kwargs = {} if weight == 0 else {"classifier__sample_weight": [1.0] * len(tweet_train) + [float(weight)] * len(review_train)}
        pipeline.fit(train.text, train.label, **kwargs)
        tweets = metrics(pipeline, tweet_validation)
        reviews = metrics(pipeline, review_validation)
        # Selection uses validation only, never either test set or authored diagnostics.
        score = (tweets["macro_f1"] + reviews["macro_f1"]) / 2
        regression_predictions = predict_feedback(pipeline, [item.text for item in regressions.examples])
        regression_results = [{"id": item.id, "expected": item.label, "predicted": prediction} for item, prediction in zip(regressions.examples, regression_predictions)]
        summary = {"review_weight": weight, "validation_score": score, "tweet_validation": tweets, "review_validation": reviews, "regressions": regression_results, "regressions_passed": all(item["expected"] == item["predicted"] for item in regression_results)}
        comparisons.append(summary)
        pipelines[weight] = pipeline
        print(f"Review weight {weight}: tweet validation F1={tweets['macro_f1']:.3f}, review validation F1={reviews['macro_f1']:.3f}, mean={score:.3f}, regression checks pass={summary['regressions_passed']}", flush=True)
    chosen = select_candidate(comparisons)
    selected_weight = chosen["review_weight"]
    selected = pipelines[selected_weight]
    report = {
        "model_version": MODEL_VERSION if selected_weight else "tweeteval-tfidf-lr-v1",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "selection": "Highest mean tweet/review validation macro F1 among review weights 0, 0.5, 1, 2, 6, subject to passing six known development regressions and keeping tweet validation neutral recall within 3 percentage points of baseline. Neither test set nor the original 60-example diagnostic score determines selection.",
        "regression_dataset_sha256": hashlib.sha256(regression_path.read_bytes()).hexdigest(),
        "selected_review_weight": selected_weight,
        "candidates": comparisons,
        "tweet_test": metrics(selected, tweet_test),
        "review_test": metrics(selected, review_test),
        "baseline_tweet_test": metrics(pipelines[0], tweet_test),
        "baseline_review_test": metrics(pipelines[0], review_test),
        "review_groups": {name: sorted(frame.generator.unique().tolist()) for name, frame in [("train", review_train), ("validation", review_validation), ("test", review_test)]},
        "training_examples": {"tweets": len(tweet_train), "reviews": len(review_train) if selected_weight else 0},
        "datasets": [
            {"name": "TweetEval sentiment", "revision": "4fbd22cd78421f05b1ecdb4fc5725bc7a7bd8f66", "license": "CC BY 3.0 (sentiment subset); source Twitter terms apply", "sha256": {**train_hashes, **validation_hashes, **test_hashes}},
            {"name": "InfinitodeLTD/CRSD", "revision": REVIEW_REVISION, "license": "MIT according to dataset card", "synthetic": True, "source": "https://huggingface.co/datasets/InfinitodeLTD/CRSD", "sha256": review_hash},
        ],
        "limitations": ["Customer-review examples are AI-generated and do not prove accuracy on real customer feedback.", "Generator-group holdouts reduce style leakage but cannot eliminate shared templates or semantic overlap.", "The original authored form set and six regression checks are development data, not independent accuracy estimates.", "The same held-out benchmark sets have been inspected during experimentation; a fresh human-labeled form test set is still needed.", "Mixed-feedback product rules are separate from the classifier and are not included in these classifier metrics."],
    }
    artifacts = ROOT / "artifacts"
    artifacts.mkdir(exist_ok=True)
    joblib.dump({"pipeline": selected, "version": report["model_version"], "training_text_file": "adapted_train_text.txt"}, artifacts / "sentiment.joblib")
    (artifacts / "adaptation_evaluation.json").write_text(json.dumps(report, indent=2) + "\n")
    training_text = tweet_train.text.tolist() + (review_train.text.tolist() if selected_weight else [])
    (ROOT / "data" / "adapted_train_text.txt").write_text("\n".join(training_text) + "\n", encoding="utf-8")
    print(f"Selected review weight {selected_weight}. Test F1: tweets={report['tweet_test']['macro_f1']:.3f}; synthetic reviews={report['review_test']['macro_f1']:.3f}")


if __name__ == "__main__":
    main()
