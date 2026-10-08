# FormCraft Feedback Analysis

English sentiment classification using Python, FastAPI and a locally trained scikit-learn model. No paid inference API or database is required.

## Setup

Run from the repository root with Python 3.9 or newer:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements-dev.txt
backend/.venv/bin/python backend/scripts/build_vercel.py
```

Setup installs the tested frozen release after verifying its SHA-256 checksum. Deployments do not retrain or download datasets. The committed release is `feedback-tfidf-lr-v2-release1`; raw data and experimental artifacts remain ignored by Git.

For experiments, `python -m backend.train` downloads pinned TweetEval and CRSD data and compares five review-data weights. `--baseline` reproduces the tweet-only model. These replace the local experimental artifact, not the committed release. Restore the release with `python backend/scripts/build_vercel.py` before serving. New releases require a new artifact name, testing and an explicit manifest update; the generator refuses to overwrite the existing release.

## How the ML works

1. **Supervised learning:** training messages already have negative, neutral or positive labels.
2. **TF-IDF:** converts words and two-word phrases into numbers. It gives distinctive words more weight than words occurring everywhere.
3. **Logistic Regression:** learns which numerical patterns are associated with each sentiment.
4. **Pipeline:** keeps text conversion and prediction together. The vocabulary is learned only from training data.
5. **Evaluation:** validation chooses the model; held-out sets remain outside training. Exact overlaps are removed. `artifacts/adaptation_evaluation.json` records candidate selection and classifier metrics. `artifacts/evaluation.json` preserves the original tweet-only baseline results.

For example, "The form is easy to use" becomes a vector of word/phrase weights; the classifier uses learned weights to predict sentiment. Predictions can be wrong and do not replace human review.

## Dataset And Limitations

Dataset: [TweetEval](https://github.com/cardiffnlp/tweeteval), by Francesco Barbieri, Jose Camacho-Collados, Luis Espinosa-Anke and Leonardo Neves, *TweetEval: Unified Benchmark and Comparative Evaluation for Tweet Classification* (2020).

The [dataset card](https://huggingface.co/datasets/cardiffnlp/tweet_eval) lists the sentiment subset as **CC BY 3.0** and describes source Twitter terms. Downloaded texts are not committed or displayed in FormCraft.

This is an English tweet-domain baseline. Benchmark scores are not evidence of accuracy on customer feedback. Sarcasm, mixed sentiment, unfamiliar vocabulary and other languages may produce incorrect results. Model probabilities are not calibrated confidence estimates.

The current model also uses [CRSD by Infinitode](https://huggingface.co/datasets/InfinitodeLTD/CRSD), a synthetic customer-review dataset whose card declares the MIT license. Its reviews are AI-generated, not real customer responses. See [dataset attribution](DATASETS.md).

## Improving The Model With Review Data

The review-adapted model learns from **45,587 tweets** and **4,050 deduplicated synthetic reviews**. No FormCraft submissions are used for training. Neither the original 60 authored diagnostics nor the six regression sentences are included in training.

### Concepts And Examples

- **Domain adaptation:** add examples closer to the product's language. Reviews include complaints about confusing instructions, slow experiences and failed tasks, while the original corpus is tweets. This changes learned classifier weights; the survey sentence is not handled by a hardcoded phrase rule.
- **Sample weighting:** control how much each example influences learning. We compared review weights `0`, `0.5`, `1`, `2` and `6`, while tweets always have weight `1`. A review weight of `0.5` gives an individual review half the training weight of a tweet. It is not a sentiment probability.
- **Validation:** compare candidate models on examples outside training. The score is the average of tweet and review validation macro F1. Candidates must also pass six known development regressions and keep tweet validation neutral recall within three percentage points of baseline.
- **Regression checks:** verify problems already reported, such as the survey complaint, without confusing factual statements with complaints. These checks influence selection and therefore are not an independent accuracy benchmark.
- **Generator-group split:** CRSD was created by multiple AI models. Entire generating-model groups are kept apart for training, validation and testing to reduce repeated writing-style leakage. Exact duplicate text and conflicting duplicate labels are removed. Similar templates can still cross groups.

The selected weight is **0.5**. Stronger review weights scored better on review validation but changed known neutral statements into positive or negative predictions, so they were rejected.

### Measured Results

| Check | Tweet-only reference | Review-adapted classifier |
|---|---:|---:|
| Tweet test accuracy | 59.6% | 59.7% |
| Tweet test macro F1 | 0.572 | 0.580 |
| Synthetic review test accuracy | 45.2% | 51.2% |
| Synthetic review test macro F1 | 0.408 | 0.494 |

These classifier scores exclude the separate contrast policy. The same held-out benchmarks were inspected during experimentation, so a new human-labeled form-feedback test set is still needed before making a production accuracy claim. Low performance on the held-out synthetic generator groups is a known weakness, not hidden by the stronger development-set result.

Candidate scores, rejected neutral regressions, group identities, source revisions and file hashes are recorded in [adaptation_evaluation.json](artifacts/adaptation_evaluation.json).

## Evaluate Form-Style Feedback

After training, run:

```bash
backend/.venv/bin/python -m backend.evaluate_feedback
```

This evaluates the saved model without fitting it again. The committed [diagnostic dataset](evaluation/form_feedback.json) contains **60 synthetic examples**, authored and labeled by the coding assistant before running predictions: 20 positive, 20 neutral and 20 negative. These are not real customer submissions or independently human-reviewed labels. The dataset documents how to label praise, complaints, factual requests and mixed feedback.

The script produces:

- [Readable report](artifacts/form_feedback_evaluation.md): metrics, confusion matrix, category counts and every mistake with its label reason.
- [JSON report](artifacts/form_feedback_evaluation.json): every prediction, metrics, labeling policy, dataset/model hashes and training-overlap audit.

The review-adapted service gets **53/60 correct (88.3% accuracy)** and **0.883 macro F1**, identifying **18/20 negative examples**. The previous tweet-only service with contrast rules got **47/60**. These are development-set results: reported examples and earlier mistakes informed the development process. They do not estimate real-world accuracy and are not directly comparable to the TweetEval or CRSD benchmarks. The current report still lists seven mistakes, including negated praise and some factual statements.

### Concepts In Simple Terms

- **Domain shift:** training examples are tweets, but the product receives form feedback. Familiar language changes, so a model can make different kinds of mistakes.
- **Ground truth:** the expected label attached to each example. Our labels follow the written policy; a future real benchmark needs independent human review, especially for mixed feedback.
- **Balanced evaluation:** each sentiment has 20 examples, so a large neutral class cannot hide weak complaint detection.
- **Recall:** finding the complaints that are actually negative. The adapted service finds 18/20 (90%) in this development set; two complaints are still missed.
- **Confusion matrix:** a table showing where labels get mixed up. Of 20 negative development examples, 18 are predicted negative and two neutral.
- **Error analysis:** read the mistakes to find patterns. For example, "The process was not confusing at all. Very clear instructions" is still incorrectly predicted negative.
- **Frozen classifier:** the script does not retrain or overwrite the model. The inference policy was developed after reviewing errors, so these examples now serve as development data. A new untouched test set is needed for a fair final score.

When downloaded training text is available, the evaluator rejects case-insensitive exact overlap. If it is missing, the report explicitly says the audit could not run. Exact checks cannot rule out paraphrases or independently prove unseen data for an arbitrary model.

### Use Your Own Labeled Examples

Create a JSON file following the committed dataset's structure, with `name`, `provenance`, `labeling_policy` and `examples`. Each example needs a unique ID, text, sentiment label, category and reason. Include all three sentiments, remove duplicate texts and label examples before looking at model predictions. Then run:

```bash
backend/.venv/bin/python -m backend.evaluate_feedback \
  --dataset /path/to/labeled-feedback.json \
  --output-dir backend/data/custom-evaluation
```

Use the ignored `backend/data/` directory for real feedback and its reports. The script is local and does not send examples to a remote service. The `--model` option must point to a trusted joblib artifact; `--training-text` can identify its training text for the overlap check.

## Run The API

After training, run from the repository root:

```bash
backend/.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Interactive API documentation: `http://localhost:8000/docs`. `GET /health` reports whether the model is ready. `POST /analyze` accepts up to 100 `{id, text}` objects and returns sentiment labels alongside the same identifiers and a model version. Text is limited to 5,000 characters per item. Blank text and duplicate IDs are rejected.

```json
{"items": [{"id": "response-1", "text": "The registration was easy."}]}
```

The service does not save submitted text or train on it. Inference uses the artifact loaded once at startup. If it is missing, analysis returns HTTP 503 with a training instruction.

### Mixed Feedback Policy

The service combines the trained classifier with a narrow, explicit complaint policy. When feedback includes `but` or `however`, it examines the last contrasting clause. A negative clause prediction or an explicit blocking payment/checkout/transaction complaint takes priority over introductory praise. Resolved issues are excluded from this adjustment. Common `payemnt`/`paymnt` typos are normalized for the policy check.

For example, "this is excellent but payment not done" becomes Negative because the unresolved payment is the actionable complaint. "this is excellent and payment was successful" keeps the classifier's normal prediction. This is **hybrid inference**: learned ML plus a documented product rule, not new training or general language understanding. Complex sentences and unfamiliar wording can still be misclassified.

API model versions include `+contrast-v1` to distinguish the policy from the saved classifier. Evaluation uses the same inference function as the API and records unadjusted predictions for comparison. After updating the service, click Analyze feedback again to refresh older locally saved results.

Set `FORMCRAFT_ALLOWED_ORIGINS` to a comma-separated list of frontend origins for another environment. Local ports 3000 and 3001 are allowed by default. Set `FORMCRAFT_MODEL_PATH` only to a trusted model artifact you trained.

## Hosting

Follow the [Vercel API guide](VERCEL.md) to host FastAPI separately. Runtime dependencies stay in `requirements.txt`; training and tests use `requirements-dev.txt`. The build verifies the frozen release. Hosted `/analyze` requires a server-only `FORMCRAFT_API_KEY`, supplied by the Next.js proxy, never the browser. Hosted configuration also requires explicit frontend origins. `/health` stays public and reports release version and checksum; a missing model returns 503. Corrupt release bytes stop startup before deserialization.

The [Render guide](DEPLOYMENT.md) and Blueprint remain supported as an alternative.

Verify a running service with:

```bash
backend/.venv/bin/python -m backend.check_deployment \
  --api-url http://localhost:8000 \
  --origin http://localhost:3000
```

Run tests:

```bash
backend/.venv/bin/python -m pytest backend/tests -q
```
