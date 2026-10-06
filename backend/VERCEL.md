# Deploy The Python API On Vercel

FormCraft uses two projects in the same Vercel account:

| Project | Root | Framework | Purpose |
| --- | --- | --- | --- |
| Existing FormCraft website | Repository root | Next.js | Builder and submissions UI |
| New `formcraft-feedback-api` | `backend` | FastAPI | Python sentiment predictions |

Keep the existing website's framework, root directory and Production environment unchanged while testing `ml_feedback`. No Render account or database is needed for this option.

## Current Test Deployment

- API: [formcraft-feedback-api.vercel.app](https://formcraft-feedback-api.vercel.app/health)
- Frontend preview: [formcraft-ml-feedback.vercel.app](https://formcraft-ml-feedback.vercel.app)
- Production website: `https://formcraft.omverse.in` (unchanged).

The API was deployed manually from the `backend` directory using the CLI. The frontend API URL is configured only for the `ml_feedback` Preview environment. The frontend preview retains the website project's existing Vercel authentication protection; sign in with an authorized Vercel account to open it. The API's production alias is reachable by the frontend without exposing a bypass token.

The API project is not connected to automatic Git deployments yet. The CLI uses the selected local directory as its upload root; before connecting Git, set the API project's dashboard Root Directory to `backend` and tracked branch to `ml_feedback`. Future manual API releases use `npx vercel deploy --cwd backend --prod`. When a frontend preview is replaced, update the stable alias and allow its new exact origin before testing.

## What Happens During Deployment

1. Vercel installs the prediction dependencies from `requirements.txt` using Python 3.12.
2. `scripts/build_vercel.py` creates a temporary training environment with `requirements-dev.txt`.
3. Training downloads the pinned datasets, compares the five candidates and generates `artifacts/sentiment.joblib`. This is build-time work, not request-time work.
4. The build checks negative, neutral, positive and mixed-payment examples with the runtime environment. A missing or failing model stops the build.
5. Temporary training packages are removed. Dataset files, tests and training scripts are excluded from the function bundle.
6. FastAPI loads the trusted artifact during startup. Requests only perform prediction; no submitted text is saved or used for training.

The build bootstraps the `backend` package from its own directory, so it does not require files outside the selected project root. There is no custom server start command on Vercel.

NumPy, SciPy and scikit-learn are pinned in both environments to reduce dependency drift. This is not a guarantee of bit-for-bit identical training across macOS/Python 3.9 and Linux/Python 3.12. The local development run selected review weight 0.5; the Linux deployment selected weight 2 after passing the same regression and neutral-recall guards. Hosted checks and the browser feedback suite passed. Local diagnostic scores are not automatically the deployed model's accuracy; freezing a single release artifact is a future improvement.

## Create The Separate API Project

1. Import `OmKhandale05/formcraft` as a **new** Vercel project named `formcraft-feedback-api`.
2. Set Root Directory to `backend` and Framework Preset to FastAPI. Configuration is read from `backend/vercel.json`.
3. Deploy the `ml_feedback` branch, not `main`. If Git import initially selects `main`, cancel that deployment, change the new project's Production Branch to `ml_feedback`, then deploy it. `main` automatic Git deployments are disabled in the backend configuration during testing.
4. Add `FORMCRAFT_ENV=production` to the API project's environments.
5. Add `FORMCRAFT_ALLOWED_ORIGINS=https://formcraft.omverse.in`. Add the **exact frontend branch-preview origin** too, separated by a comma. Origins cannot contain paths such as `/signin`, wildcards or credentials.
6. Recommended numerical-library variables: `OPENBLAS_NUM_THREADS=1`, `OMP_NUM_THREADS=1`, `MKL_NUM_THREADS=1`.
7. Deploy and open `https://YOUR-API.vercel.app/health`. It should return `ready: true` and a model version.

Setting an API origin does not enable sentiment analysis on the live website. The frontend must also be built with the API URL below.

### CLI Alternative

From the repository root, authenticate with `npx vercel login`. Then run:

```bash
npx vercel backend
```

Choose a **new** project rather than linking the existing website. Configure the API environment variables in that new project's dashboard before deploying. Do not use `--prod` against the website project. Git project settings still need the root and branch configuration described above. CLI linking creates local `.vercel` metadata, which must not be committed.

## Connect A Frontend Preview

1. In the existing **website** project's environment variables, set `NEXT_PUBLIC_FEEDBACK_API_URL=https://YOUR-API.vercel.app` for **Preview**, scoped to `ml_feedback` when available. Do not change Production yet.
2. Redeploy the frontend branch preview: Next.js embeds this variable at build time.
3. Add that preview's exact origin to the API's allowed origins and redeploy the API if needed. A stable branch alias avoids updating CORS for each deployment URL.
4. Ensure API Deployment Protection does not redirect browser API requests to a Vercel login. Use an API deployment accessible to the test frontend; do not put protection-bypass secrets in `NEXT_PUBLIC_` variables.
5. Test positive, negative, neutral and mixed feedback through the submissions UI. Re-run analysis to refresh old locally saved predictions.

## Verify The Hosted Service

```bash
backend/.venv/bin/python -m backend.check_deployment \
  --api-url https://YOUR-API.vercel.app \
  --origin https://YOUR-FRONTEND-PREVIEW.vercel.app
```

This checks readiness, CORS and predictions. A local check cannot confirm Vercel's installed packages, bundle size or account settings; the hosted check is required before merging.

The current deployment passed this hosted check and the Playwright feedback workflow (predictions, blank handling, filtering, details, persistence, field isolation, failure handling, mobile overflow and cleanup). The browser test can accept `FORMCRAFT_TEST_VERCEL_BYPASS` for an authorized protected preview. It sends that token only to the exact frontend host, never to the API, and it must not be committed or exposed in frontend environment variables.

Local packaging checks:

```bash
backend/.venv/bin/python backend/scripts/build_vercel.py --check
backend/.venv/bin/python -m pytest backend/tests -q
FORMCRAFT_TEST_VERCEL_BUILD=1 backend/.venv/bin/python -m pytest backend/tests/test_vercel.py -k full_isolated_build -q
```

The last command installs training dependencies in a temporary environment and retrains the model in an isolated test directory. It can take several minutes and requires network access. The first command only validates an already-trained artifact.

## Limits And Safety

- Vercel's standard Python function bundle limit is 500 MB. The model is small, but installed scientific packages also count; confirm the actual deployment build succeeds.
- This configuration allows up to 60 seconds per invocation. Startup can be slower than warm requests; the UI already supports loading, timeout and retry states.
- CORS controls browser access, **not authentication**. The API is unauthenticated and is suitable for controlled testing. Before public-scale use, add authenticated requests and abuse/rate-limit protection.
- Usage is subject to the account's Vercel plan limits. Hosting does not improve model accuracy.
- Training must reach the pinned dataset sources during a build. A failed download or model guard stops that deployment rather than serving an unvalidated replacement.
- A new Vercel deployment is still required when code, the model or build-time frontend variables change. Separate projects do not eliminate deployments; they isolate changes from the live website.

After hosted tests pass, merge `ml_feedback` into `main`, enable `main` API deployments and update the API project's tracked branch. Add the API URL to the website's Production environment and deploy the merged website deliberately.

References: [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi), [Python runtime and bundling](https://vercel.com/docs/functions/runtimes/python), [Vercel limits](https://vercel.com/docs/limits).
