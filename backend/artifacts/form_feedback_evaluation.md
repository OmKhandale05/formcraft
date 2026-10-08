# Form Feedback Evaluation

Model: `feedback-tfidf-lr-v2+contrast-v1`

Synthetic examples authored and labeled by the coding assistant before running predictions. Not collected from users or independently reviewed by human annotators.

## Results

- Examples: 60
- Correct: 53/60
- Accuracy: 88.3%
- Macro F1: 0.883
- Always-neutral baseline macro F1: 0.167

Unadjusted classifier accuracy: 86.7%. The mixed-complaint policy is included in the results above.

Accuracy counts correct predictions. Macro F1 gives each sentiment equal importance.

## Per Sentiment

| Sentiment | Precision | Recall | F1 | Examples |
|---|---:|---:|---:|---:|
| negative | 0.900 | 0.900 | 0.900 | 20 |
| neutral | 0.850 | 0.850 | 0.850 | 20 |
| positive | 0.900 | 0.900 | 0.900 | 20 |

## Confusion Matrix

Rows are expected labels; columns are model predictions.

| Expected / Predicted | Negative | Neutral | Positive |
|---|---:|---:|---:|
| negative | 18 | 2 | 0 |
| neutral | 1 | 17 | 2 |
| positive | 1 | 1 | 18 |

## By Category

Small category counts are diagnostic, not reliable performance estimates.

| Category | Correct | Examples |
|---|---:|---:|
| accessibility | 3 | 4 |
| application | 6 | 6 |
| contact | 5 | 5 |
| event | 7 | 8 |
| mixed | 4 | 6 |
| mobile | 2 | 3 |
| negation | 6 | 7 |
| payment | 6 | 6 |
| product | 6 | 6 |
| request | 2 | 2 |
| short | 4 | 4 |
| survey | 2 | 3 |

## Mistakes To Review

### p05: survey

> The questions were relevant and the survey was enjoyable.

Expected: **positive**. Predicted: **neutral**.

Label reason: Positive assessment of questions.

### p14: negation

> The process was not confusing at all. Very clear instructions.

Expected: **positive**. Predicted: **negative**.

Label reason: Negated criticism with praise.

### n07: mobile

> The form is broken on my phone and the fields overlap.

Expected: **negative**. Predicted: **neutral**.

Label reason: Broken mobile experience.

### n09: accessibility

> The instructions are unclear and I do not know what to do next.

Expected: **negative**. Predicted: **neutral**.

Label reason: Explicit confusion.

### u01: event

> My preferred appointment date is Monday.

Expected: **neutral**. Predicted: **positive**.

Label reason: Factual preference.

### u15: mixed

> I liked the design and disliked the navigation equally. My overall opinion is neutral.

Expected: **neutral**. Predicted: **positive**.

Label reason: Explicitly balanced mixed opinion.

### u16: mixed

> Some parts were good and some were bad. I do not have an overall preference.

Expected: **neutral**. Predicted: **negative**.

Label reason: Balanced mixed opinion without dominant sentiment.

## Labeling Policy

Positive means explicit satisfaction or praise. Negative means explicit dissatisfaction or an unresolved failure. Neutral means factual information, a request without expressed dissatisfaction, or balanced mixed feedback without a dominant sentiment. Mixed feedback with an unresolved blocking failure is negative. These conventions should be reviewed by humans before a real benchmark is created.

## Limits

- Small authored development set; not real submissions or an independently human-labeled benchmark.
- Label choices for mixed feedback are subjective; review the labeling policy.
- The classifier is frozen, but mixed-feedback inference was developed after reviewing this set. These are development results; an untouched test set is needed for final evaluation.
- The contrast policy combines ML clause predictions with explicit transaction-failure rules; it does not establish general language understanding.
- Scores do not estimate production accuracy.
