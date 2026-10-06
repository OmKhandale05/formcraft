import pandas as pd
import pytest

from backend import adapt


def test_overlap_removal_is_case_insensitive_and_ignores_outer_spaces():
    train = pd.DataFrame({"text": [" Good service ", "Unique example"], "label": ["positive", "neutral"]})
    held_out = pd.DataFrame({"text": ["good SERVICE"]})
    assert adapt.remove_overlap(train, held_out).text.tolist() == ["Unique example"]


def test_review_splits_hold_out_entire_generator_groups(tmp_path, monkeypatch):
    monkeypatch.setattr(adapt, "ROOT", tmp_path)
    rows = [{"review": f"generator {group} {label} example {index}", "sentiment": label, "model": f"generator-{group}"} for group in range(9) for label in ("negative", "neutral", "positive") for index in range(3)]
    rows += [
        {"review": "Conflicting text", "sentiment": "positive", "model": "generator-0"},
        {"review": "CONFLICTING TEXT", "sentiment": "negative", "model": "generator-1"},
        rows[0],
    ]
    directory = tmp_path / "data"
    directory.mkdir()
    pd.DataFrame(rows).to_csv(directory / f"customer_reviews-{adapt.REVIEW_REVISION}.csv", index=False)
    train, validation, test, digest = adapt.review_splits()
    for first, second in ((train, validation), (train, test), (validation, test)):
        assert set(first.generator).isdisjoint(second.generator)
        assert set(adapt.normalized_text(first)).isdisjoint(adapt.normalized_text(second))
    assert len(train) + len(validation) + len(test) == 81
    assert len(digest) == 64


def candidate(weight, score, passed=True, neutral_recall=0.8):
    return {"review_weight": weight, "validation_score": score, "regressions_passed": passed, "tweet_validation": {"neutral_recall": neutral_recall}}


def test_selection_rejects_higher_scores_with_regressions_or_neutral_recall_loss():
    comparisons = [candidate(0, 0.6, passed=False), candidate(0.5, 0.7), candidate(2, 0.9, passed=False), candidate(6, 0.95, neutral_recall=0.7)]
    assert adapt.select_candidate(comparisons)["review_weight"] == 0.5
    assert not comparisons[2]["eligible"]
    assert not comparisons[3]["eligible"]


def test_selection_fails_without_an_acceptable_model():
    with pytest.raises(ValueError, match="model was not replaced"):
        adapt.select_candidate([candidate(0, 0.6, passed=False)])
