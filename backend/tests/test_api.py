import joblib
import pytest
from fastapi.testclient import TestClient

from backend import app as service
from backend.train import build_pipeline


@pytest.fixture
def client(tmp_path, monkeypatch):
    pipeline = build_pipeline().fit(
        ["excellent easy", "excellent helpful", "terrible broken", "terrible slow", "meeting Monday", "meeting Tuesday"],
        ["positive", "positive", "negative", "negative", "neutral", "neutral"],
    )
    path = tmp_path / "test.joblib"
    joblib.dump({"pipeline": pipeline, "version": "test-model"}, path)
    monkeypatch.setattr(service, "MODEL_PATH", path)
    with TestClient(service.app) as test_client:
        yield test_client


def test_batch_keeps_ids_and_returns_model_version(client):
    response = client.post("/analyze", json={"items": [{"id": "b", "text": "terrible broken"}, {"id": "a", "text": "excellent helpful"}]})
    assert response.status_code == 200
    assert response.json() == {"model_version": "test-model+contrast-v1", "results": [{"id": "b", "sentiment": "negative"}, {"id": "a", "sentiment": "positive"}]}
    assert client.get("/health").json()["ready"] is True


@pytest.mark.parametrize("items", [[], [{"id": "a", "text": "   "}], [{"id": "a", "text": "x" * 5001}], [{"id": "a", "text": "hi"}] * 2, [{"id": str(i), "text": "hi"} for i in range(101)]])
def test_invalid_requests_are_rejected(client, items):
    assert client.post("/analyze", json={"items": items}).status_code == 422


def test_missing_model_returns_actionable_error(tmp_path, monkeypatch):
    monkeypatch.setattr(service, "MODEL_PATH", tmp_path / "missing.joblib")
    with TestClient(service.app) as client:
        assert client.get("/health").status_code == 503
        assert client.get("/health").json()["ready"] is False
        assert client.post("/analyze", json={"items": [{"id": "a", "text": "hello"}]}).status_code == 503


def test_cors_only_allows_configured_origin(client):
    allowed = client.options("/analyze", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"})
    blocked = client.options("/analyze", headers={"Origin": "https://unconfigured.example", "Access-Control-Request-Method": "POST"})
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-origin" not in blocked.headers


def test_api_prioritizes_unresolved_payment_over_praise(client):
    response = client.post("/analyze", json={"items": [{"id": "mixed", "text": "excellent helpful but payemnt not done"}]})
    assert response.status_code == 200
    assert response.json()["results"] == [{"id": "mixed", "sentiment": "negative"}]
