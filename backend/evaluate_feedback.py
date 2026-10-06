"""Evaluate a frozen model on separately labeled, form-style feedback."""

import argparse
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

import joblib
from pydantic import BaseModel, Field, field_validator, model_validator
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

from backend.train import LABELS, ROOT


class Example(BaseModel):
    id: str = Field(min_length=1)
    text: str = Field(min_length=1, max_length=5000)
    label: Literal["negative", "neutral", "positive"]
    category: str = Field(min_length=1)
    note: str = Field(min_length=1)

    @field_validator("id", "text", "category", "note")
    @classmethod
    def reject_whitespace(cls, value):
        if not value.strip():
            raise ValueError("Values must not be blank")
        return value.strip()


class Dataset(BaseModel):
    name: str = Field(min_length=1)
    provenance: str = Field(min_length=1)
    labeling_policy: str = Field(min_length=1)
    examples: list[Example] = Field(min_length=3)

    @model_validator(mode="after")
    def validate_examples(self):
        if len({item.id for item in self.examples}) != len(self.examples):
            raise ValueError("Example IDs must be unique")
        if len({item.text.casefold() for item in self.examples}) != len(self.examples):
            raise ValueError("Duplicate feedback text is not allowed")
        if {item.label for item in self.examples} != set(LABELS):
            raise ValueError("Evaluation must include all three sentiment labels")
        return self


def check_overlap(dataset, training_path):
    if not training_path.is_file():
        return {"checked": False, "reason": "Training text file unavailable; independence could not be audited."}
    training_text = {text.strip().casefold() for text in training_path.read_text(encoding="utf-8").splitlines()}
    overlap = [item.id for item in dataset.examples if item.text.casefold() in training_text]
    if overlap:
        raise ValueError(f"Evaluation texts appear in training data: {', '.join(overlap)}")
    return {"checked": True, "overlap_count": 0, "training_text_sha256": hashlib.sha256(training_path.read_bytes()).hexdigest()}


def evaluate(dataset, model):
    examples = dataset.examples
    actual = [item.label for item in examples]
    predicted = model["pipeline"].predict([item.text for item in examples]).tolist()
    if len(predicted) != len(actual) or not set(predicted).issubset(LABELS):
        raise ValueError("Model predictions do not match the three-label evaluation contract")
    cases = [{**item.model_dump(), "predicted": guess, "correct": item.label == guess} for item, guess in zip(examples, predicted)]
    categories = sorted({item.category for item in examples})
    return {
        "model_version": model["version"],
        "dataset": dataset.name,
        "provenance": dataset.provenance,
        "labeling_policy": dataset.labeling_policy,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "examples": len(examples),
        "label_counts": dict(Counter(actual)),
        "accuracy": accuracy_score(actual, predicted),
        "macro_f1": f1_score(actual, predicted, labels=LABELS, average="macro", zero_division=0),
        "baseline": {"strategy": "Always neutral (fixed before evaluation)", "macro_f1": f1_score(actual, ["neutral"] * len(actual), labels=LABELS, average="macro", zero_division=0)},
        "classification_report": classification_report(actual, predicted, labels=LABELS, output_dict=True, zero_division=0),
        "confusion_matrix": {"labels": LABELS, "rows_actual_columns_predicted": confusion_matrix(actual, predicted, labels=LABELS).tolist()},
        "categories": {category: {"examples": sum(item["category"] == category for item in cases), "correct": sum(item["category"] == category and item["correct"] for item in cases)} for category in categories},
        "predictions": cases,
        "limitations": ["Small authored diagnostic set; not real submissions or an independently human-labeled benchmark.", "Label choices for mixed feedback are subjective; review the labeling policy.", "No training or tuning uses this dataset in this script. If it is used to tune a model later, obtain a new untouched test set.", "Scores do not estimate production accuracy."],
    }


def markdown_report(report):
    lines = [
        "# Form Feedback Evaluation", "", f"Model: `{report['model_version']}`", "",
        report["provenance"], "", "## Results", "",
        f"- Examples: {report['examples']}",
        f"- Correct: {sum(item['correct'] for item in report['predictions'])}/{report['examples']}",
        f"- Accuracy: {report['accuracy']:.1%}", f"- Macro F1: {report['macro_f1']:.3f}",
        f"- Always-neutral baseline macro F1: {report['baseline']['macro_f1']:.3f}", "",
        "Accuracy counts correct predictions. Macro F1 gives each sentiment equal importance.", "",
        "## Per Sentiment", "", "| Sentiment | Precision | Recall | F1 | Examples |", "|---|---:|---:|---:|---:|",
    ]
    for label in LABELS:
        metrics = report["classification_report"][label]
        lines.append(f"| {label} | {metrics['precision']:.3f} | {metrics['recall']:.3f} | {metrics['f1-score']:.3f} | {metrics['support']:.0f} |")
    lines += ["", "## Confusion Matrix", "", "Rows are expected labels; columns are model predictions.", "", "| Expected / Predicted | Negative | Neutral | Positive |", "|---|---:|---:|---:|"]
    for label, row in zip(LABELS, report["confusion_matrix"]["rows_actual_columns_predicted"]):
        lines.append(f"| {label} | {' | '.join(str(value) for value in row)} |")
    lines += ["", "## By Category", "", "Small category counts are diagnostic, not reliable performance estimates.", "", "| Category | Correct | Examples |", "|---|---:|---:|"]
    for category, values in report["categories"].items():
        lines.append(f"| {category} | {values['correct']} | {values['examples']} |")
    lines += ["", "## Mistakes To Review", ""]
    mistakes = [item for item in report["predictions"] if not item["correct"]]
    if not mistakes:
        lines.append("No mistakes in this small set. This does not imply perfect real-world accuracy.")
    for item in mistakes:
        lines += [f"### {item['id']}: {item['category']}", "", f"> {item['text']}", "", f"Expected: **{item['label']}**. Predicted: **{item['predicted']}**.", "", f"Label reason: {item['note']}", ""]
    lines += ["## Labeling Policy", "", report["labeling_policy"], "", "## Limits", ""]
    lines.extend(f"- {limit}" for limit in report["limitations"])
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=ROOT / "evaluation" / "form_feedback.json")
    parser.add_argument("--model", type=Path, default=ROOT / "artifacts" / "sentiment.joblib")
    parser.add_argument("--training-text", type=Path, default=ROOT / "data" / "train_text.txt")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "artifacts")
    args = parser.parse_args()
    try:
        dataset = Dataset.model_validate_json(args.dataset.read_text(encoding="utf-8"))
        overlap = check_overlap(dataset, args.training_text)
        if not args.model.is_file():
            parser.error("Model not found. Run python -m backend.train first.")
        report = evaluate(dataset, joblib.load(args.model))
        report["training_overlap_check"] = overlap
        report["dataset_sha256"] = hashlib.sha256(args.dataset.read_bytes()).hexdigest()
        report["model_sha256"] = hashlib.sha256(args.model.read_bytes()).hexdigest()
        args.output_dir.mkdir(parents=True, exist_ok=True)
        (args.output_dir / "form_feedback_evaluation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        (args.output_dir / "form_feedback_evaluation.md").write_text(markdown_report(report), encoding="utf-8")
        correct = sum(item["correct"] for item in report["predictions"])
        print(f"Correct: {correct}/{report['examples']} | Accuracy: {report['accuracy']:.1%} | Macro F1: {report['macro_f1']:.3f}")
        print(f"Mistakes: {report['examples'] - correct}. Review {args.output_dir / 'form_feedback_evaluation.md'}")
        if not overlap["checked"]:
            print(f"Overlap check unavailable: {overlap['reason']}")
    except (ValueError, OSError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
