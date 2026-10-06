# Host The Feedback API

The Next.js site stays on Vercel. The Python API runs as a separate Render web service. No database or persistent disk is required: model training happens during the build, and inference loads the saved artifact at startup.

This repository includes a [Render Blueprint](../render.yaml) targeting `ml_feedback` on the free plan with automatic deployments turned off. Pushing a Git commit does not trigger a deploy of this configured Render service. Vercel's separate preview deployment settings are unchanged.

## 1. Create The Render Service

1. Sign in at [Render](https://dashboard.render.com/) and connect your GitHub account.
2. Choose **New > Blueprint** and select `OmKhandale05/formcraft`.
3. Select branch **ml_feedback** and Blueprint path **render.yaml**.
4. Enter `FORMCRAFT_ALLOWED_ORIGINS` when prompted. Use the exact Vercel preview URL you will test, such as `https://your-preview.vercel.app`. Do not include `/builder`, wildcard domains or credentials. Multiple allowed URLs can be comma-separated.
5. Confirm the **Free** compute plan, then create the service.
6. Wait for the build to finish. The build installs Python packages and trains the model. Save the service's actual HTTPS URL shown in the dashboard; do not assume a particular subdomain is available.

Python is pinned to 3.11.11 for compatibility with the ML packages. OpenBLAS/OMP thread limits keep numerical work to one thread. The start command reads Render's `PORT` and binds to `0.0.0.0` so the service is reachable. The service's model artifact is generated during each build; it is not committed to Git or downloaded during inference.

### Manual Setup Alternative

If you create a Web Service instead of a Blueprint, use these settings:

| Setting | Value |
|---|---|
| Repository | `OmKhandale05/formcraft` |
| Branch | `ml_feedback` |
| Runtime | Python |
| Root directory | Leave empty (repository root) |
| Build command | `bash backend/scripts/build.sh` |
| Start command | `python -m backend.serve` |
| Health check | `/health` |
| Instance type | Free |
| Auto-deploy | Off |
| `PYTHON_VERSION` | `3.11.11` |
| `FORMCRAFT_ENV` | `production` |
| `FORMCRAFT_ALLOWED_ORIGINS` | Exact frontend HTTPS URL(s) |
| `OPENBLAS_NUM_THREADS` | `1` |
| `OMP_NUM_THREADS` | `1` |
| `PYTHONUNBUFFERED` | `1` |

## 2. Connect A Vercel Preview

1. In the existing Vercel project, add `NEXT_PUBLIC_FEEDBACK_API_URL` with the Render service's HTTPS URL.
2. Scope it to **Preview**, ideally the `ml_feedback` branch, while testing. Keep Production unchanged.
3. Redeploy that branch's preview: Next.js includes `NEXT_PUBLIC_` values at build time, so changing a variable does not update an already-built frontend.
4. Make sure that preview's actual browser origin is listed in Render's `FORMCRAFT_ALLOWED_ORIGINS`. A changing preview URL needs a matching allowed origin; a stable branch alias can avoid repeated updates. Environment changes require a manual Render deploy with auto-deploy off.

The API is a public demo service. CORS controls which browser origins may read responses; it is not authentication and does not prevent direct requests from other clients. The service does not save request text.

## 3. Verify The Hosted API

Run from the repository root, substituting actual URLs:

```bash
backend/.venv/bin/python -m backend.check_deployment \
  --api-url https://your-api.onrender.com \
  --origin https://your-preview.vercel.app
```

The script checks model readiness, the browser preflight response, and positive/negative/neutral/mixed-complaint predictions. `/health` returns HTTP 200 only when the model is loaded, otherwise HTTP 503. These four examples check the wiring, not general model accuracy.

Then test in the preview website: submit feedback, analyze the selected field, filter sentiments, reload saved results, view response details and export results. Clicking Analyze again refreshes older predictions.

Render free services spin down after inactivity and can take about a minute to wake. The frontend allows up to two minutes per analysis batch before showing a retry error. Large batches can be slower on limited free compute; this setup is intended for a small demo. Free-plan availability and limits can change: check [Render's current documentation](https://render.com/docs/free).

## 4. Promote After Review

After the branch preview and hosted API pass final testing, merge `ml_feedback` into `main`. Update Render's tracked branch to `main` (and update the Blueprint accordingly), add the production Vercel origin to the allowed-origin list, and manually deploy the API. Set `NEXT_PUBLIC_FEEDBACK_API_URL` for Vercel Production and deploy the merged frontend. The service can continue using manual deployments.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Build fails downloading data | Retry the build; training requires access to pinned public TweetEval files and the CRSD review CSV. |
| Missing model / unhealthy service | Confirm the build ran `python -m backend.train` and the root directory is empty. |
| Startup fails on origins | Set exact frontend URLs in `FORMCRAFT_ALLOWED_ORIGINS`; production requires this value. |
| Browser cannot reach analysis | Check HTTPS API URL, allowed frontend origin, service readiness and any host access restrictions. |
| Frontend still uses localhost | Set the Preview environment variable and redeploy the frontend. |
| First request takes a long time | Allow the free service to wake; retry if the two-minute limit is reached. |

References: [FastAPI deployment](https://render.com/docs/deploy-fastapi), [Blueprint fields](https://render.com/docs/blueprint-spec), [Python versions](https://render.com/docs/python-version), [health checks](https://render.com/docs/health-checks).
