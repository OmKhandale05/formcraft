"""Verify trusted release bytes before deserializing the model."""

import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent


def manifest():
    data = json.loads((ROOT / "releases" / "manifest.json").read_text())
    if Path(data["file"]).name != data["file"] or not data["file"].endswith(".joblib"):
        raise ValueError("Invalid release artifact filename")
    return data


def verify(path):
    data = manifest()
    if hashlib.sha256(Path(path).read_bytes()).hexdigest() != data["sha256"]:
        raise ValueError("Model checksum does not match the frozen release")
    return data


def install():
    data = manifest()
    source = ROOT / "releases" / data["file"]
    verify(source)
    destination = ROOT / "artifacts" / "sentiment.joblib"
    destination.parent.mkdir(exist_ok=True)
    shutil.copyfile(source, destination)
    return destination
