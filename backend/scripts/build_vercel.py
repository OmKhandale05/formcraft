"""Train in an isolated build environment; ship only the inference artifact."""

import argparse
import importlib.util
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import venv

ROOT = Path(__file__).resolve().parents[1]


def register_backend():
    # A backend-root deployment must not depend on files outside that root.
    spec = importlib.util.spec_from_file_location("backend", ROOT / "__init__.py", submodule_search_locations=[str(ROOT)])
    module = importlib.util.module_from_spec(spec)
    sys.modules["backend"] = module
    spec.loader.exec_module(module)


def check_model():
    import joblib
    from backend.sentiment import predict_feedback

    path = ROOT / "artifacts" / "sentiment.joblib"
    if not path.is_file():
        raise ValueError("The trained model artifact is missing")
    model = joblib.load(path)
    examples = ["The survey is far too long and the questions are confusing.", "The survey contains 20 questions.", "The survey is clear and easy to complete.", "this is excellent but payment not done"]
    if predict_feedback(model["pipeline"], examples) != ["negative", "neutral", "positive", "negative"]:
        raise ValueError("The deployment model failed its prediction smoke checks")
    print(f"Deployment artifact ready: {model['version']} ({path.stat().st_size:,} bytes)", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--train", action="store_true", help=argparse.SUPPRESS)
    parser.add_argument("--check", action="store_true", help="Validate an existing deployment artifact without retraining")
    args = parser.parse_args()
    register_backend()
    if args.train:
        from backend.adapt import main as train
        train()
        return
    if not args.check:
        environment = dict(os.environ, OPENBLAS_NUM_THREADS="1", OMP_NUM_THREADS="1", MKL_NUM_THREADS="1")
        with tempfile.TemporaryDirectory(prefix="formcraft-training-") as directory:
            venv.EnvBuilder(with_pip=True).create(directory)
            python = str(Path(directory) / "bin" / "python")
            subprocess.run([python, "-m", "pip", "install", "-r", str(ROOT / "requirements-dev.txt")], check=True, env=environment)
            subprocess.run([python, str(Path(__file__).resolve()), "--train"], check=True, env=environment)
    check_model()


if __name__ == "__main__":
    main()
