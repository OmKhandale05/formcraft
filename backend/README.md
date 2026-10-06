# FormCraft Feedback Analysis

English sentiment classification using Python, FastAPI and a locally trained scikit-learn model. No paid inference API or database is required.

## Setup

Run from the repository root with Python 3.9 or newer:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python -m backend.train
```

Training downloads the pinned TweetEval sentiment train/test splits, fits a TF-IDF + Logistic Regression pipeline and writes `backend/artifacts/sentiment.joblib`. Data and binary models are ignored by Git. Re-run training in a fresh environment before starting the service.

## How the ML works

1. **Supervised learning:** training messages already have negative, neutral or positive labels.
2. **TF-IDF:** converts words and two-word phrases into numbers. It gives distinctive words more weight than words occurring everywhere.
3. **Logistic Regression:** learns which numerical patterns are associated with each sentiment.
4. **Pipeline:** keeps text conversion and prediction together. The vocabulary is learned only from training data.
5. **Evaluation:** the official test split stays out of training. Exact duplicate texts and train/test overlap are removed. `artifacts/evaluation.json` records accuracy, per-class precision/recall/F1, macro F1, a majority-class baseline and a confusion matrix.

For example, "The form is easy to use" becomes a vector of word/phrase weights; the classifier uses learned weights to predict sentiment. Predictions can be wrong and do not replace human review.

## Dataset And Limitations

Dataset: [TweetEval](https://github.com/cardiffnlp/tweeteval), by Francesco Barbieri, Jose Camacho-Collados, Luis Espinosa-Anke and Leonardo Neves, *TweetEval: Unified Benchmark and Comparative Evaluation for Tweet Classification* (2020).

The [dataset card](https://huggingface.co/datasets/cardiffnlp/tweet_eval) lists the sentiment subset as **CC BY 3.0** and describes source Twitter terms. Downloaded texts are not committed or displayed in FormCraft.

This is an English tweet-domain baseline. Benchmark scores are not evidence of accuracy on customer feedback. Sarcasm, mixed sentiment, unfamiliar vocabulary and other languages may produce incorrect results. Model probabilities are not calibrated confidence estimates.

## Evaluate Form-Style Feedback

After training, run:

```bash
backend/.venv/bin/python -m backend.evaluate_feedback
```

This evaluates the saved model without fitting it again. The committed [diagnostic dataset](evaluation/form_feedback.json) contains **60 synthetic examples**, authored and labeled by the coding assistant before running predictions: 20 positive, 20 neutral and 20 negative. These are not real customer submissions or independently human-reviewed labels. The dataset documents how to label praise, complaints, factual requests and mixed feedback.

The script produces:

- [Readable report](artifacts/form_feedback_evaluation.md): metrics, confusion matrix, category counts and every mistake with its label reason.
- [JSON report](artifacts/form_feedback_evaluation.json): every prediction, metrics, labeling policy, dataset/model hashes and training-overlap audit.

The initial frozen model gets **46/60 correct (76.7% accuracy)** with **0.770 macro F1**. It identifies **13/20 negative examples**, so it still misses important complaints. Only **3/6 mixed-sentiment cases** are correct. These small-set scores do not estimate real-world accuracy and are not directly comparable to the TweetEval benchmark.

### Concepts In Simple Terms

- **Domain shift:** training examples are tweets, but the product receives form feedback. Familiar language changes, so a model can make different kinds of mistakes.
- **Ground truth:** the expected label attached to each example. Our labels follow the written policy; a future real benchmark needs independent human review, especially for mixed feedback.
- **Balanced evaluation:** each sentiment has 20 examples, so a large neutral class cannot hide weak complaint detection.
- **Recall:** finding the complaints that are actually negative. Here, negative recall is 13/20, or 65%; seven complaints are missed.
- **Confusion matrix:** a table showing where labels get mixed up. Of 20 negative examples, 13 are predicted negative, six neutral and one positive.
- **Error analysis:** read the mistakes to find patterns. For example, "The design is attractive, but payment fails every time and I cannot book" is labeled negative by our policy but predicted positive.
- **Frozen evaluation:** the script only predicts; it does not retrain or overwrite the model. If these examples later guide model tuning, they become development data. A new untouched test set is then needed for a fair final score.

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

Set `FORMCRAFT_ALLOWED_ORIGINS` to a comma-separated list of frontend origins for another environment. Local ports 3000 and 3001 are allowed by default. Set `FORMCRAFT_MODEL_PATH` only to a trusted model artifact you trained.

Run tests:

```bash
backend/.venv/bin/python -m pytest backend/tests -q
```
