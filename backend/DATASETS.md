# Sentiment Dataset Attribution

## TweetEval Sentiment

- Authors: Francesco Barbieri, Jose Camacho-Collados, Luis Espinosa-Anke and Leonardo Neves.
- Publication: *TweetEval: Unified Benchmark and Comparative Evaluation for Tweet Classification* (2020).
- Source: https://github.com/cardiffnlp/tweeteval
- Pinned revision: `4fbd22cd78421f05b1ecdb4fc5725bc7a7bd8f66`.
- The [dataset card](https://huggingface.co/datasets/cardiffnlp/tweet_eval) lists the sentiment subset as CC BY 3.0 and describes source Twitter terms.
- Downloaded training, validation and test texts are kept in ignored `backend/data/`, not redistributed in this repository.

## CRSD: Customer Review Sentiment Dataset

- Author/publisher: Infinitode / InfinitodeLTD.
- Source and license declaration: https://huggingface.co/datasets/InfinitodeLTD/CRSD
- Pinned revision: `6010dd8f1af5cb0bb2537e91bc05ff207497ae34`.
- The upstream card declares the dataset MIT-licensed. This pinned snapshot publishes the license declaration in its README but no separate LICENSE file. Retain attribution and consult the upstream card for its notices.
- All reviews are AI-generated. They are not real customer feedback and do not provide independent human ground truth.
- The local loader renames columns, normalizes labels, removes empty/duplicate texts and excludes conflicting labels for identical normalized text.
- Entire generating-model groups are separated before training. Validation chooses sample weighting; held-out groups provide a diagnostic comparison.
- The dataset is downloaded to ignored `backend/data/`; raw reviews are not committed. File hashes and group identities are recorded in the adaptation report.

## FormCraft Authored Examples

`evaluation/form_feedback.json` and `evaluation/regression_feedback.json` are assistant-authored, policy-labeled development examples. They are not collected submissions or independently human-annotated datasets. Neither set is included in training. The six regression checks influence model selection and must not be represented as an independent benchmark.
