"""Create an explicit, immutable model release from a tested local artifact."""

import hashlib
from importlib.metadata import version
import json
from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]


def main():
    directory = ROOT / "releases"
    directory.mkdir(exist_ok=True)
    target = directory / "sentiment-v2-release1.joblib"
    if target.exists() or (directory / "manifest.json").exists():
        raise ValueError("Release already exists; create a new release name instead of overwriting it")
    model = joblib.load(ROOT / "artifacts" / "sentiment.joblib")
    model["version"] = "feedback-tfidf-lr-v2-release1"
    joblib.dump(model, target, compress=3)
    data = {"file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(), "model_version": model["version"], "source": "Locally tested feedback-adapted model; review weight 0.5", "dependencies": {name: version(name) for name in ("scikit-learn", "numpy", "scipy", "joblib")}}
    (directory / "manifest.json").write_text(json.dumps(data, indent=2) + "\n")
    print(f"Frozen release created: {target.name}")


if __name__ == "__main__":
    main()
