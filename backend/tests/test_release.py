import shutil

import pytest

from backend import release


def test_frozen_artifact_matches_manifest():
    data = release.manifest()
    assert release.verify(release.ROOT / "releases" / data["file"])["model_version"] == "feedback-tfidf-lr-v2-release1"


def test_corrupt_artifact_is_rejected(tmp_path):
    artifact = tmp_path / "model.joblib"
    artifact.write_bytes(b"not the trusted release")
    with pytest.raises(ValueError, match="checksum"):
        release.verify(artifact)


def test_install_preserves_identical_bytes(tmp_path, monkeypatch):
    shutil.copytree(release.ROOT / "releases", tmp_path / "releases")
    monkeypatch.setattr(release, "ROOT", tmp_path)
    installed = release.install()
    assert release.verify(installed)["sha256"] == release.manifest()["sha256"]


def test_install_needs_no_training_dependencies_or_network(tmp_path, monkeypatch):
    shutil.copytree(release.ROOT / "releases", tmp_path / "releases")
    monkeypatch.setattr(release, "ROOT", tmp_path)
    assert release.install().is_file()
    assert not (tmp_path / "data").exists()
