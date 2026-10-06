# Form Feedback Evaluation

Model: `tweeteval-tfidf-lr-v1+contrast-v1`

Synthetic examples authored and labeled by the coding assistant before running predictions. Not collected from users or independently reviewed by human annotators.

## Results

- Examples: 60
- Correct: 47/60
- Accuracy: 78.3%
- Macro F1: 0.789
- Always-neutral baseline macro F1: 0.167

Unadjusted classifier accuracy: 76.7%. The mixed-complaint policy is included in the results above.

Accuracy counts correct predictions. Macro F1 gives each sentiment equal importance.

## Per Sentiment

| Sentiment | Precision | Recall | F1 | Examples |
|---|---:|---:|---:|---:|
| negative | 1.000 | 0.700 | 0.824 | 20 |
| neutral | 0.630 | 0.850 | 0.723 | 20 |
| positive | 0.842 | 0.800 | 0.821 | 20 |

## Confusion Matrix

Rows are expected labels; columns are model predictions.

| Expected / Predicted | Negative | Neutral | Positive |
|---|---:|---:|---:|
| negative | 14 | 6 | 0 |
| neutral | 0 | 17 | 3 |
| positive | 0 | 4 | 16 |

## By Category

Small category counts are diagnostic, not reliable performance estimates.

| Category | Correct | Examples |
|---|---:|---:|
| accessibility | 3 | 4 |
| application | 4 | 6 |
| contact | 5 | 5 |
| event | 7 | 8 |
| mixed | 4 | 6 |
| mobile | 2 | 3 |
| negation | 6 | 7 |
| payment | 5 | 6 |
| product | 6 | 6 |
| request | 2 | 2 |
| short | 3 | 4 |
| survey | 0 | 3 |

## Mistakes To Review

### p05: survey

> The questions were relevant and the survey was enjoyable.

Expected: **positive**. Predicted: **neutral**.

Label reason: Positive assessment of questions.

### p07: application

> Uploading my resume was smooth and fast.

Expected: **positive**. Predicted: **neutral**.

Label reason: Satisfied with upload.

### p14: negation

> The process was not confusing at all. Very clear instructions.

Expected: **positive**. Predicted: **neutral**.

Label reason: Negated criticism with praise.

### p20: payment

> The payment receipt was accurate and I appreciate the clear breakdown.

Expected: **positive**. Predicted: **neutral**.

Label reason: Explicit appreciation.

### n02: application

> My resume upload keeps failing. This is frustrating.

Expected: **negative**. Predicted: **neutral**.

Label reason: Failure and explicit frustration.

### n05: survey

> The survey is far too long and the questions are confusing.

Expected: **negative**. Predicted: **neutral**.

Label reason: Explicit criticism.

### n07: mobile

> The form is broken on my phone and the fields overlap.

Expected: **negative**. Predicted: **neutral**.

Label reason: Broken mobile experience.

### n09: accessibility

> The instructions are unclear and I do not know what to do next.

Expected: **negative**. Predicted: **neutral**.

Label reason: Explicit confusion.

### n16: survey

> The required questions ask for information that is irrelevant. Very annoying.

Expected: **negative**. Predicted: **neutral**.

Label reason: Explicit annoyance.

### n17: short

> Awful experience.

Expected: **negative**. Predicted: **neutral**.

Label reason: Short explicit criticism.

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

Expected: **neutral**. Predicted: **positive**.

Label reason: Balanced mixed opinion without dominant sentiment.

## Labeling Policy

Positive means explicit satisfaction or praise. Negative means explicit dissatisfaction or an unresolved failure. Neutral means factual information, a request without expressed dissatisfaction, or balanced mixed feedback without a dominant sentiment. Mixed feedback with an unresolved blocking failure is negative. These conventions should be reviewed by humans before a real benchmark is created.

## Limits

- Small authored development set; not real submissions or an independently human-labeled benchmark.
- Label choices for mixed feedback are subjective; review the labeling policy.
- The classifier is frozen, but mixed-feedback inference was developed after reviewing this set. These are development results; an untouched test set is needed for final evaluation.
- The contrast policy combines ML clause predictions with explicit transaction-failure rules; it does not establish general language understanding.
- Scores do not estimate production accuracy.
