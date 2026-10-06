import joblib
import numpy as np
import pytest

from backend.sentiment import complaint_clause, predict_feedback
from backend.train import ROOT


class PositiveModel:
    def predict(self, texts):
        return np.array(["positive"] * len(texts))


@pytest.mark.parametrize("text", [
    "This is excellent but payment not done",
    "This is excellent but payemnt not done",
    "Great experience, however the payment has not completed",
    "I love the design but checkout keeps failing",
    "Nice form but my transaction didn't go through",
    "The design is attractive but payment fails every time and I cannot book",
    "This is excellent BUT I can't pay",
])
def test_blocking_mixed_complaints_override_praise(text):
    assert predict_feedback(PositiveModel(), [text]) == ["negative"]


@pytest.mark.parametrize("text", [
    "This is excellent and payment was successful",
    "Payment not done yet; it is scheduled for tomorrow",
    "It was confusing but payment now works",
    "It was bad but the payment issue has been resolved",
    "Excellent service but payment has not failed",
    "Great checkout but the booking was not declined",
])
def test_factual_resolved_and_negated_failures_are_not_rule_overridden(text):
    assert predict_feedback(PositiveModel(), [text]) == ["positive"]


def test_negative_trailing_clause_uses_ml_prediction():
    class ClauseModel:
        def predict(self, texts):
            return np.array(["negative" if text.strip() == "support was terrible" else "positive" for text in texts])
    assert predict_feedback(ClauseModel(), ["The design is nice but support was terrible"]) == ["negative"]


def test_sentences_without_contrast_keep_model_predictions():
    class NeutralModel:
        def predict(self, texts):
            return np.array(["neutral"] * len(texts))
    assert predict_feedback(NeutralModel(), ["The meeting starts Monday", "Payment pending"]) == ["neutral", "neutral"]
    assert complaint_clause("I bought butterscotch yesterday") is None


def test_live_artifact_handles_reported_examples():
    path = ROOT / "artifacts" / "sentiment.joblib"
    if not path.exists():
        pytest.skip("Train the model to run this artifact integration check")
    model = joblib.load(path)
    texts = ["this is bad", "this is excellent but payment not done", "this is excellent but payemnt not done", "this is excellent and payment was successful"]
    assert predict_feedback(model["pipeline"], texts) == ["negative", "negative", "negative", "positive"]
