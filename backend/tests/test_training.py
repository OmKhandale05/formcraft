import joblib

from backend.train import build_pipeline


def test_pipeline_can_be_saved_and_predict_unseen_text(tmp_path):
    texts = [
        "excellent helpful service", "excellent easy experience", "helpful easy product",
        "terrible broken service", "terrible slow experience", "broken slow product",
        "meeting on Monday", "meeting on Tuesday", "appointment on Monday",
    ]
    labels = ["positive"] * 3 + ["negative"] * 3 + ["neutral"] * 3
    pipeline = build_pipeline().fit(texts, labels)
    path = tmp_path / "model.joblib"
    joblib.dump(pipeline, path)
    loaded = joblib.load(path)
    assert loaded.predict(["excellent helpful", "terrible broken", "meeting on Monday"]).tolist() == ["positive", "negative", "neutral"]
    assert "unseenword" not in loaded.named_steps["tfidf"].vocabulary_
    loaded.predict(["unseenword"])
    assert "unseenword" not in loaded.named_steps["tfidf"].vocabulary_
