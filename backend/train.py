"""Train the feedback-adapted model, or reproduce the original tweet baseline."""

import hashlib
import json
import argparse
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

import joblib
import pandas as pd
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent
REVISION = "4fbd22cd78421f05b1ecdb4fc5725bc7a7bd8f66"
SOURCE = f"https://raw.githubusercontent.com/cardiffnlp/tweeteval/{REVISION}/datasets/sentiment"
LABELS = ["negative", "neutral", "positive"]
MODEL_VERSION = "tweeteval-tfidf-lr-v1"


def load_split(split):
    directory = ROOT / "data"
    directory.mkdir(exist_ok=True)
    paths = []
    for kind in ("text", "labels"):
        path = directory / f"{split}_{kind}.txt"
        if not path.exists():
            with urlopen(f"{SOURCE}/{path.name}", timeout=60) as response:
                path.write_bytes(response.read())
        paths.append(path)
    texts = paths[0].read_text(encoding="utf-8").splitlines()
    labels = [LABELS[int(label)] for label in paths[1].read_text().splitlines()]
    if len(texts) != len(labels):
        raise ValueError(f"Mismatched text and label counts in {split}")
    return pd.DataFrame({"text": texts, "label": labels}), {
        path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in paths
    }


def build_pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=60000, sublinear_tf=True)),
        ("classifier", LogisticRegression(C=2.0, max_iter=1000, random_state=42)),
    ])


def train_baseline():
    train, train_hashes = load_split("train")
    test, test_hashes = load_split("test")
    # Remove exact overlap so an unseen evaluation text cannot be memorized.
    train = train.drop_duplicates("text")
    train = train[~train.text.isin(test.text)]
    test = test.drop_duplicates("text")
    pipeline = build_pipeline()
    pipeline.fit(train.text, train.label)
    predicted = pipeline.predict(test.text)
    baseline = DummyClassifier(strategy="most_frequent").fit(train.text, train.label)
    report = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset": "TweetEval sentiment",
        "dataset_revision": REVISION,
        "source": "https://github.com/cardiffnlp/tweeteval",
        "license": "CC BY 3.0 (sentiment subset); see dataset card for source terms",
        "language": "English",
        "sklearn_version": sklearn.__version__,
        "train_examples": len(train),
        "test_examples": len(test),
        "split": "Official train/test; duplicate texts and train/test overlap removed",
        "accuracy": accuracy_score(test.label, predicted),
        "macro_f1": f1_score(test.label, predicted, average="macro"),
        "baseline_macro_f1": f1_score(test.label, baseline.predict(test.text), average="macro"),
        "classification_report": classification_report(test.label, predicted, labels=LABELS, output_dict=True, zero_division=0),
        "confusion_matrix": {"labels": LABELS, "rows_actual_columns_predicted": confusion_matrix(test.label, predicted, labels=LABELS).tolist()},
        "dataset_sha256": {**train_hashes, **test_hashes},
        "limitations": ["Tweet data differs from form feedback; these scores do not measure customer-feedback accuracy.", "English only; sarcasm, mixed sentiment and short messages can be misclassified.", "Model probabilities are not calibrated confidence scores."],
    }
    artifacts = ROOT / "artifacts"
    artifacts.mkdir(exist_ok=True)
    joblib.dump({"pipeline": pipeline, "version": MODEL_VERSION}, artifacts / "sentiment.joblib")
    (artifacts / "evaluation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"Trained on {len(train):,} examples; evaluated on {len(test):,} unseen examples.")
    print(f"Accuracy: {report['accuracy']:.3f}; macro F1: {report['macro_f1']:.3f}; baseline F1: {report['baseline_macro_f1']:.3f}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", action="store_true", help="Reproduce the original TweetEval-only model")
    args = parser.parse_args()
    if args.baseline:
        train_baseline()
    else:
        from backend.adapt import main as train_adapted
        train_adapted()


if __name__ == "__main__":
    main()
