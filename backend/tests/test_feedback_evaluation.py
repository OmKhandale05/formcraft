import hashlib
import json
import subprocess
import sys

import joblib
import numpy as np
import pytest
from pydantic import ValidationError

from backend.evaluate_feedback import Dataset, check_overlap, evaluate, markdown_report
from backend.train import ROOT, build_pipeline


def sample_dataset():
    return {
        "name": "Test examples", "provenance": "Authored test examples", "labeling_policy": "Explicit sentiment",
        "examples": [
            {"id": "n", "text": "terrible broken service", "label": "negative", "category": "product", "note": "Criticism"},
            {"id": "u", "text": "meeting on Monday", "label": "neutral", "category": "request", "note": "Fact"},
            {"id": "p", "text": "excellent helpful service", "label": "positive", "category": "product", "note": "Praise"},
        ],
    }


class FrozenModel:
    def predict(self, texts):
        assert texts == ["terrible broken service", "meeting on Monday", "excellent helpful service"]
        return np.array(["negative", "positive", "positive"])

    def fit(self, *args):
        raise AssertionError("Evaluation must never train the model")


def test_metrics_confusion_matrix_and_mistakes():
    report = evaluate(Dataset.model_validate(sample_dataset()), {"pipeline": FrozenModel(), "version": "frozen-test"})
    assert report["accuracy"] == pytest.approx(2 / 3)
    assert report["macro_f1"] == pytest.approx(5 / 9)
    assert report["confusion_matrix"]["rows_actual_columns_predicted"] == [[1, 0, 0], [0, 0, 1], [0, 0, 1]]
    assert [item["id"] for item in report["predictions"] if not item["correct"]] == ["u"]
    assert report["categories"]["product"] == {"examples": 2, "correct": 2}
    markdown = markdown_report(report)
    assert "Expected: **neutral**. Predicted: **positive**." in markdown
    assert "Label reason: Fact" in markdown


@pytest.mark.parametrize("mutation", ["duplicate_id", "duplicate_text", "blank_text", "bad_label", "missing_class"])
def test_bad_datasets_are_rejected(mutation):
    data = sample_dataset()
    if mutation == "duplicate_id":
        data["examples"][1]["id"] = "n"
    elif mutation == "duplicate_text":
        data["examples"][1]["text"] = "TERRIBLE BROKEN SERVICE"
    elif mutation == "blank_text":
        data["examples"][1]["text"] = "   "
    elif mutation == "bad_label":
        data["examples"][1]["label"] = "happy"
    else:
        data["examples"][1]["label"] = "positive"
    with pytest.raises(ValidationError):
        Dataset.model_validate(data)


def test_training_overlap_is_rejected_and_missing_audit_is_explicit(tmp_path):
    dataset = Dataset.model_validate(sample_dataset())
    path = tmp_path / "train.txt"
    assert check_overlap(dataset, path)["checked"] is False
    path.write_text("unrelated training example\n")
    assert check_overlap(dataset, path)["overlap_count"] == 0
    path.write_text("  MEETING ON MONDAY  \n")
    with pytest.raises(ValueError, match="appear in training data: u"):
        check_overlap(dataset, path)


def test_cli_writes_reports_without_changing_model(tmp_path):
    dataset_path = tmp_path / "feedback.json"
    dataset_path.write_text(json.dumps(sample_dataset()))
    pipeline = build_pipeline().fit(
        ["terrible broken service", "terrible broken product", "meeting on Monday", "meeting on Tuesday", "excellent helpful service", "excellent helpful product"],
        ["negative", "negative", "neutral", "neutral", "positive", "positive"],
    )
    model_path = tmp_path / "model.joblib"
    joblib.dump({"pipeline": pipeline, "version": "cli-test"}, model_path)
    original = hashlib.sha256(model_path.read_bytes()).hexdigest()
    output = tmp_path / "reports"
    result = subprocess.run(
        [sys.executable, "-m", "backend.evaluate_feedback", "--dataset", str(dataset_path), "--model", str(model_path), "--training-text", str(tmp_path / "missing.txt"), "--output-dir", str(output)],
        cwd=ROOT.parent, capture_output=True, text=True,
    )
    assert result.returncode == 0, result.stderr
    assert "Overlap check unavailable" in result.stdout
    report = json.loads((output / "form_feedback_evaluation.json").read_text())
    assert report["model_version"] == "cli-test+contrast-v1"
    assert report["model_sha256"] == original
    assert hashlib.sha256(model_path.read_bytes()).hexdigest() == original
    assert (output / "form_feedback_evaluation.md").is_file()


def test_committed_diagnostic_dataset_has_balanced_classes():
    dataset = Dataset.model_validate_json((ROOT / "evaluation" / "form_feedback.json").read_text())
    assert len(dataset.examples) == 60
    assert all(sum(item.label == label for item in dataset.examples) == 20 for label in ("negative", "neutral", "positive"))
    assert "Synthetic" in dataset.provenance
