# FormCraft

A polished no-code form builder for visually designing, previewing, validating, saving, and exporting production-style forms.

FormCraft helps teams design form workflows without writing code. The app uses a typed form schema, drag-and-drop builder interactions, local persistence, schema-driven rendering, validation, templates, submissions, version history, logic rules, and export flows.

## Product Walkthrough

### Builder

The builder is the main workspace where users compose a form visually.

- Drag fields from the left sidebar into the canvas
- Reorder fields directly inside the canvas
- Multi-select fields with Shift+click
- Duplicate or delete fields
- Edit field labels, placeholders, helper text, required state, options, validation, layout, and advanced settings
- Resize the builder panels
- Edit form title and description from the canvas details control
- Save local version snapshots
- Import and export form definitions

### Preview

The preview page renders the actual form from the current schema.

- Desktop and mobile preview modes
- React Hook Form powered submission handling
- Zod validation for required and typed fields
- Success state after submission
- Local mock submission capture
- JSON schema and embed snippet are available through focused copy dialogs

### Submissions

The submissions page works like a lightweight response operations dashboard.

- Search and filter submitted responses
- Filter by status: new, flagged, reviewed, archived
- View response details in a drawer
- Add internal notes
- Mark reviewed, flag, unflag, or archive responses
- Bulk update selected submissions
- Export CSV and JSON
- Download captured signatures when available
- Bottom-right action toasts for review, flag, unflag, and archive actions
- Analyze a selected text field with a Python sentiment model
- Positive, neutral and negative badges, sentiment filters and response counts
- Persist analysis locally and include results in CSV/JSON exports

### Templates

Templates help users start from realistic form workflows instead of a blank canvas.

- Contact form
- Job application
- Event registration
- Feedback survey
- Lead generation
- Template preview and setup flow
- Save current form as a reusable local template

### Settings

The settings area works as the control center for the form.

- Edit title, name, and description
- Tune typography, spacing, colors, borders, focus styles, and animation presets
- Configure conditional logic rules
- View form health and readiness signals
- Save and restore local version history
- Delete version snapshots with themed confirmation toasts

## Field Types

FormCraft includes common fields and advanced product-style fields:

- Text input
- Email input
- Phone input with country flag and dial code
- Textarea
- Number input
- Dropdown
- Radio group
- Checkbox group
- Date picker
- Date range
- File upload placeholder
- Rating
- Signature
- Slider
- Rich text
- Matrix / grid
- Hidden field
- Payment field with currency support
- Formula output
- Section title
- Divider

## Advanced Highlights

- **Schema-driven rendering**: one form schema powers the builder, preview, export, and submissions.
- **Version history**: users can save restore points locally, up to a 20-version limit.
- **Logic builder**: conditional rules can show, hide, require, or make fields optional.
- **Formula field**: supports simple calculation workflows between existing fields.
- **Matrix field controls**: row and column management, alternate row styling, input type selection, and grid color settings.
- **Theme system**: style presets, font choices, field radius, border width, focus styling, motion, and dark/light preview behavior.
- **Local-first persistence**: forms, submissions, templates, metadata, and versions are stored in the browser.
- **Product feedback details**: custom dialogs, copy states, action toasts, empty states, and loading states.

## Tech Stack

- **Next.js** for the app framework
- **TypeScript** for type-safe schema and component logic
- **TailwindCSS** for styling
- **dnd-kit** for drag-and-drop interactions
- **Zustand** for local app state and persistence
- **React Hook Form** for preview form submission handling
- **Zod** for validation schema logic
- **Framer Motion** for subtle UI motion
- **lucide-react** for icons
- **localStorage** for local persistence
- **Python + FastAPI + Uvicorn** for the optional feedback analysis service
- **scikit-learn** for TF-IDF text features and Logistic Regression
- **pandas + joblib** for training data preparation and saved model artifacts
- **pytest + Playwright** for API and feedback workflow checks

## Project Structure

```text
src/
  app/
    builder/        Builder workspace
    preview/        Live form preview and code dialogs
    settings/       Theme, logic, health, and version history
    submissions/    Response review dashboard
    templates/      Template gallery and setup flow
    signin/         Product-style sign-in screen
  components/
    builder/        Builder-specific panels and controls
    ui/             Reusable UI primitives
    form-renderer   Schema-driven form renderer
  lib/
    appearance      Theme presets and style helpers
    exporters       JSON, HTML, React, Zod, and TypeScript exports
    field-catalog   Field definitions
    formula         Formula evaluation helpers
    logic           Conditional logic helpers
    templates       Built-in templates
  store/
    form-store      Zustand store and local persistence
  types/
    form            Typed form schema, field, submission, and version models
backend/
  train.py          Reproducible sentiment training and evaluation
  app.py            Validated batch inference API
  artifacts/        Evaluation report and locally generated model
  tests/            Training and API tests
tests/
  feedback-analysis.mjs  Live browser integration checks
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Smart Feedback Analysis

The optional Python service classifies English feedback as positive, neutral or negative. FormCraft sends only the selected field's text and response identifiers. The service performs inference without storing responses or retraining. Results stay in this browser alongside the existing workspace.

From the repository root:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python -m backend.train
backend/.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Keep that terminal running and start `npm run dev` in another terminal. The frontend connects to `http://localhost:8000` by default. For another API address, set `NEXT_PUBLIC_FEEDBACK_API_URL` using `.env.example` and restart Next.js. The Python service has a separate runtime; deploying the frontend alone does not start it.

To try it:

1. Add a long-answer field to a form and collect a few responses through Preview.
2. Open Submissions and select that field under Feedback analysis.
3. Click Analyze feedback, then filter or open responses to review predicted sentiment.

Blank answers are skipped. New responses require another analysis run. Switching fields shows the results for that field; saved results are ignored if the answer text changes. Clearing local submissions also clears the analysis cache. The builder works without the Python service; analysis shows an actionable error when the service is unavailable.

The current TF-IDF + Logistic Regression model combines TweetEval with lightly weighted CRSD synthetic customer reviews. Validation and known regression checks choose between five weights, preserving neutral examples while improving complaint detection. On held-out tweet examples, it achieves **59.7% accuracy** and **0.580 macro F1**; on held-out synthetic review-generator groups it achieves **51.2% accuracy** and **0.494 macro F1**. These are not customer-feedback production accuracy claims. Predictions can be incorrect, especially for sarcasm, negation, mixed sentiment and non-English text.

Read the [Python service guide](backend/README.md) for the ML concepts and [dataset attribution](backend/DATASETS.md) for sources and limitations. Current comparisons are in [adaptation_evaluation.json](backend/artifacts/adaptation_evaluation.json); [evaluation.json](backend/artifacts/evaluation.json) preserves the original tweet-only baseline. Training data and binary model artifacts are excluded from Git; train locally before running the service.

### Form Feedback Evaluation

Evaluate the frozen model against 60 authored form-style examples:

```bash
backend/.venv/bin/python -m backend.evaluate_feedback
```

The [diagnostic report](backend/artifacts/form_feedback_evaluation.md) shows **53/60 correct (88.3%)** with the adapted model and mixed-complaint policy, up from 47/60 for the previous service. Negative recall is **90%** in this small set, so complaints are still missed. These synthetic examples have assistant-authored labels and were inspected during development; they are not an untouched customer benchmark. The classifier is not retrained by evaluation. See the Python guide to evaluate your own separately labeled examples.

Inference combines ML with a narrow product rule: praise followed by an explicit unresolved payment complaint, such as "excellent but payment not done", takes priority as Negative. This does not guarantee correct interpretation of all mixed feedback. Click Analyze feedback again to refresh previously saved results after a service update.

### Feedback Checks

```bash
backend/.venv/bin/python -m pytest backend/tests -q
npx playwright install chromium
# Run with both Next.js and the trained Python service already started:
npm run test:feedback
```

The browser test uses an isolated workspace, exercises live predictions, filters, persistence, failure handling and mobile layout, and writes local screenshots into ignored `test-results/`.

### Host The Python API

The [deployment guide](backend/DEPLOYMENT.md) covers the included Render Blueprint, manual deployments, exact frontend origins, readiness checks and connecting a Vercel preview before production. The build trains the model; startup loads it and listens on the hosting provider's port. Hosting configuration does not deploy the service by itself.

## Local Persistence

FormCraft is local-first. It stores workspace data in the browser so the project can work without a backend:

- current form schema
- mock submissions
- submission review metadata
- saved templates
- version history
- theme/settings changes

Clearing browser storage will reset the local workspace.

## Possible Next Improvements

- Backend persistence and authentication
- Team workspaces
- Published public form links
- Real file uploads
- Stripe integration for payment fields
- More analytics for submissions
- Shareable template marketplace
- Undo / redo stack for builder edits
