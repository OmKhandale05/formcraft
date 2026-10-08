"""Batch sentiment inference. Submitted text is never persisted by the service."""

import os
import hmac
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal, Optional

import joblib
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, StringConstraints, model_validator
if __package__:
    from .sentiment import inference_version, predict_feedback
    from .config import allowed_origins
    from .release import verify
else:
    # Vercel imports app.py directly when backend is the project root.
    from sentiment import inference_version, predict_feedback
    from config import allowed_origins
    from release import verify

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
    app.state.release = None
    if MODEL_PATH.is_file() and (MODEL_PATH == Path(__file__).parent / "artifacts" / "sentiment.joblib" or os.getenv("FORMCRAFT_ENV") == "production" or os.getenv("VERCEL") == "1"):
        app.state.release = verify(MODEL_PATH)
    app.state.model = joblib.load(MODEL_PATH) if MODEL_PATH.is_file() else None
    yield


app = FastAPI(title="FormCraft Feedback Analysis", version="1.0.0", lifespan=lifespan)
origins = allowed_origins(os.getenv("FORMCRAFT_ALLOWED_ORIGINS"), production=os.getenv("FORMCRAFT_ENV") == "production" or os.getenv("VERCEL") == "1")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["POST", "GET"], allow_headers=["Content-Type"])
API_KEY = os.getenv("FORMCRAFT_API_KEY")
if (os.getenv("FORMCRAFT_ENV") == "production" or os.getenv("VERCEL") == "1") and (not API_KEY or len(API_KEY) < 32):
    raise ValueError("Set a server-only FORMCRAFT_API_KEY of at least 32 characters in production")


def authorize(key: Optional[str] = Header(default=None, alias="X-FormCraft-Key")):
    if API_KEY and (not key or not hmac.compare_digest(key.encode(), API_KEY.encode())):
        raise HTTPException(status_code=401, detail="Authorized server access required")


@app.get("/health")
def health():
    model = app.state.model
    return JSONResponse(status_code=200 if model else 503, content={"ready": model is not None, "model_version": inference_version(model["version"]) if model else None, "release_sha256": app.state.release["sha256"] if app.state.release else None})


@app.post("/analyze", response_model=AnalyzeResponse, dependencies=[Depends(authorize)])
def analyze(request: AnalyzeRequest):
    model = app.state.model
    if model is None:
        raise HTTPException(status_code=503, detail="Train the sentiment model before starting the analysis service.")
    predictions = predict_feedback(model["pipeline"], [item.text for item in request.items])
    return AnalyzeResponse(
        model_version=inference_version(model["version"]),
        results=[Prediction(id=item.id, sentiment=str(label)) for item, label in zip(request.items, predictions)],
    )
