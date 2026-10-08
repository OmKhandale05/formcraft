import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def deployment_root(tmp_path):
    root = tmp_path / "service"
    root.mkdir()
    for name in ("app.py", "config.py", "sentiment.py", "release.py", "__init__.py"):
        shutil.copy2(ROOT / name, root / name)
    shutil.copytree(ROOT / "releases", root / "releases")
    return root


def run_deployment(root, code, origins="https://forms.example"):
    environment = dict(os.environ, VERCEL="1", FORMCRAFT_API_KEY="test-server-key-" + "x" * 32)
    environment.pop("PYTHONPATH", None)
    environment.pop("FORMCRAFT_MODEL_PATH", None)
    if origins is None:
        environment.pop("FORMCRAFT_ALLOWED_ORIGINS", None)
    else:
        environment["FORMCRAFT_ALLOWED_ORIGINS"] = origins
    return subprocess.run([sys.executable, "-c", code], cwd=root, env=environment, capture_output=True, text=True)


def test_backend_root_import_and_missing_artifact(deployment_root):
    result = run_deployment(deployment_root, "from app import app; from fastapi.testclient import TestClient\nwith TestClient(app) as client:\n assert client.get('/health').status_code == 503\n assert client.options('/analyze', headers={'Origin': 'https://forms.example', 'Access-Control-Request-Method': 'POST'}).headers['access-control-allow-origin'] == 'https://forms.example'")
    assert result.returncode == 0, result.stderr


def test_vercel_requires_explicit_origins(deployment_root):
    result = run_deployment(deployment_root, "import app", origins=None)
    assert result.returncode != 0
    assert "FORMCRAFT_ALLOWED_ORIGINS" in result.stderr


def test_build_check_without_repository_parent(deployment_root):
    model = ROOT / "artifacts" / "sentiment.joblib"
    if not model.exists():
        pytest.skip("Train the model to run deployment artifact checks")
    (deployment_root / "artifacts").mkdir()
    (deployment_root / "scripts").mkdir()
    shutil.copy2(model, deployment_root / "artifacts" / model.name)
    shutil.copy2(ROOT / "scripts" / "build_vercel.py", deployment_root / "scripts" / "build_vercel.py")
    result = subprocess.run([sys.executable, "scripts/build_vercel.py", "--check"], cwd=deployment_root, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert "Deployment artifact ready" in result.stdout
    result = run_deployment(deployment_root, "import os; from app import app; from fastapi.testclient import TestClient\nwith TestClient(app) as client:\n assert client.get('/health').status_code == 200\n assert client.post('/analyze', headers={'X-FormCraft-Key': os.environ['FORMCRAFT_API_KEY']}, json={'items': [{'id': 'survey', 'text': 'The survey is far too long and the questions are confusing.'}]}).json()['results'][0]['sentiment'] == 'negative'")
    assert result.returncode == 0, result.stderr


def test_deployment_config_enables_main_and_keeps_model_included():
    config = json.loads((ROOT / "vercel.json").read_text())
    assert config["framework"] == "fastapi"
    assert config["buildCommand"] == "python scripts/build_vercel.py"
    assert config["git"]["deploymentEnabled"] == {"main": True, "ml_feedback": True}
    excludes = config["functions"]["app.py"]["excludeFiles"]
    assert "data/**" in excludes and "tests/**" in excludes
    assert "artifacts/**" not in excludes and "*.joblib" not in excludes
    assert (ROOT / ".python-version").read_text().strip() == "3.12"


def test_runtime_dependencies_do_not_include_training_tools():
    runtime = (ROOT / "requirements.txt").read_text()
    assert "scikit-learn==1.6.1" in runtime
    assert "numpy==2.0.2" in runtime and "scipy==1.13.1" in runtime
    assert not any(package in runtime for package in ("pandas", "pytest", "httpx"))
    assert "-r requirements.txt" in (ROOT / "requirements-dev.txt").read_text()


def test_full_isolated_build(deployment_root):
    shutil.copytree(ROOT / "scripts", deployment_root / "scripts")
    result = subprocess.run([sys.executable, "scripts/build_vercel.py"], cwd=deployment_root, capture_output=True, text=True, timeout=900)
    assert result.returncode == 0, result.stdout + result.stderr
    assert "Deployment artifact ready" in result.stdout
    assert (deployment_root / "artifacts" / "sentiment.joblib").is_file()
    assert not (deployment_root / "data").exists()
