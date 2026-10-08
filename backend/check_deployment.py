"""Check model readiness, browser CORS and predictions on a running API."""

import argparse
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def check(api_url, origin=None):
    base = api_url.rstrip("/")
    with urlopen(f"{base}/health", timeout=120) as response:
        health = json.load(response)
    if health.get("ready") is not True or not health.get("model_version"):
        raise ValueError("The service is reachable, but the model is not ready")
    if origin:
        preflight = Request(f"{base}/analyze", method="OPTIONS", headers={
            "Origin": origin.rstrip("/"), "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type",
        })
        with urlopen(preflight, timeout=120) as response:
            if response.headers.get("Access-Control-Allow-Origin") != origin.rstrip("/"):
                raise ValueError("The API does not allow the configured frontend origin")
    examples = [
        {"id": "positive", "text": "this is excellent and payment was successful"},
        {"id": "negative", "text": "this is bad"},
        {"id": "neutral", "text": "The meeting is on Monday"},
        {"id": "mixed", "text": "this is excellent but payment not done"},
    ]
    headers = {"Content-Type": "application/json"}
    if os.getenv("FORMCRAFT_API_KEY"):
        headers["X-FormCraft-Key"] = os.environ["FORMCRAFT_API_KEY"]
    request = Request(f"{base}/analyze", method="POST", data=json.dumps({"items": examples}).encode(), headers=headers)
    with urlopen(request, timeout=120) as response:
        data = json.load(response)
    results = data.get("results", [])
    expected = {"positive": "positive", "negative": "negative", "neutral": "neutral", "mixed": "negative"}
    if len(results) != len(expected) or {item["id"]: item["sentiment"] for item in results} != expected:
        raise ValueError("The running service failed the four-example prediction check")
    if data.get("model_version") != health["model_version"]:
        raise ValueError("The model version changed during verification; try again after deployment finishes")
    return health["model_version"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api-url", required=True)
    parser.add_argument("--origin", help="Frontend origin to verify through browser preflight")
    args = parser.parse_args()
    try:
        version = check(args.api_url, args.origin)
        print(f"PASS: model ready ({version}); predictions verified" + ("; frontend origin allowed" if args.origin else "; CORS check skipped (provide --origin)"))
    except (HTTPError, URLError, OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f"Deployment check failed: {error}\n")


if __name__ == "__main__":
    main()
