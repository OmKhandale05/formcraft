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

This is an English tweet-domain baseline. Benchmark scores are not evidence of accuracy on customer feedback. A future improvement is evaluating on independently labeled form feedback. Sarcasm, mixed sentiment, unfamiliar vocabulary and other languages may produce incorrect results. Model probabilities are not calibrated confidence estimates.
