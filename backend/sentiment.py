"""Hybrid sentiment inference with an explicit mixed-complaint policy."""

import re

POLICY_VERSION = "contrast-v1"
CONTRAST = re.compile(r"\b(?:but|however)\b", re.IGNORECASE)
TRANSACTION = r"(?:payment|checkout|transaction|purchase|booking|refund)"
FAILURE = re.compile(
    rf"\b{TRANSACTION}\b(?:\s+\w+){{0,4}}\s+(?:"
    r"(?:is\s+|was\s+|has\s+|had\s+)?(?:not|never)\s+(?:done|completed|processed|received|working|successful)"
    r"|(?:is\s+|was\s+|keeps\s+)?(?:failing|failed|fails|broken|declined)"
    r"|(?:did\s+not|didn't|does\s+not|doesn't|won't|will\s+not)\s+(?:work|go\s+through|complete|process)"
    r")\b|\b(?:cannot|can't|couldn't|could\s+not|unable\s+to)\s+(?:pay|complete\s+(?:the\s+)?payment|book)\b",
    re.IGNORECASE,
)
NEGATED_FAILURE = re.compile(r"\b(?:not|never|no)\s+(?:failed|failing|broken|declined|failures?)\b", re.IGNORECASE)
RESOLUTION = re.compile(
    r"\b(?:now\s+(?:works|working|completed|successful)|(?:works|working|completed)\s+now|"
    r"(?:was|is|has\s+been)\s+(?:fixed|resolved)|(?:payment|transaction)\s+(?:was\s+|is\s+)?successful)\b",
    re.IGNORECASE,
)


def inference_version(model_version):
    return f"{model_version}+{POLICY_VERSION}"


def complaint_clause(text):
    normalized = text.lower().replace("\u2019", "'")
    normalized = re.sub(r"\b(?:payemnt|paymnt)\b", "payment", normalized)
    parts = CONTRAST.split(normalized)
    if len(parts) < 2:
        return None
    clause = parts[-1].strip()
    if not clause or RESOLUTION.search(clause):
        return None
    return clause


def adjust_predictions(pipeline, texts, raw_predictions):
    predictions = [str(label) for label in raw_predictions]
    candidates = [(index, complaint_clause(text)) for index, text in enumerate(texts)]
    candidates = [(index, clause) for index, clause in candidates if clause and predictions[index] != "negative"]
    if not candidates:
        return predictions
    clause_predictions = pipeline.predict([clause for _, clause in candidates])
    for (index, clause), label in zip(candidates, clause_predictions):
        # A blocking transaction complaint takes priority over introductory praise.
        blocking_failure = FAILURE.search(clause) and not NEGATED_FAILURE.search(clause)
        if blocking_failure or str(label) == "negative":
            predictions[index] = "negative"
    return predictions


def predict_feedback(pipeline, texts):
    return adjust_predictions(pipeline, texts, pipeline.predict(texts))
