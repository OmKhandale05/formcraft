"""Batch sentiment inference. Submitted text is never persisted by the service."""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, StringConstraints, model_validator
from backend.sentiment import inference_version, predict_feedback

MODEL_PATH = Path(os.getenv("FORMCRAFT_MODEL_PATH", Path(__file__).parent / "artifacts" / "sentiment.joblib"))
Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)]
Identifier = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class Feedback(BaseModel):
    id: Identifier
    text: Text


class AnalyzeRequest(BaseModel):
    items: list[Feedback] = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def unique_ids(self):
        if len({item.id for item in self.items}) != len(self.items):
            raise ValueError("Response identifiers must be unique")
        return self


class Prediction(BaseModel):
    id: str
    sentiment: Literal["negative", "neutral", "positive"]


class AnalyzeResponse(BaseModel):
    model_version: str
    results: list[Prediction]


@asynccontextmanager
async def lifespan(app):
    # Load only our locally trained artifact, never a user-supplied model file.
    app.state.model = joblib.load(MODEL_PATH) if MODEL_PATH.is_file() else None
    yield


app = FastAPI(title="FormCraft Feedback Analysis", version="1.0.0", lifespan=lifespan)
origins = [origin.strip() for origin in os.getenv("FORMCRAFT_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["POST", "GET"], allow_headers=["Content-Type"])


@app.get("/health")
def health():
    model = app.state.model
    return {"ready": model is not None, "model_version": inference_version(model["version"]) if model else None}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    model = app.state.model
    if model is None:
        raise HTTPException(status_code=503, detail="Train the sentiment model before starting the analysis service.")
    predictions = predict_feedback(model["pipeline"], [item.text for item in request.items])
    return AnalyzeResponse(
        model_version=inference_version(model["version"]),
        results=[Prediction(id=item.id, sentiment=str(label)) for item, label in zip(request.items, predictions)],
    )
