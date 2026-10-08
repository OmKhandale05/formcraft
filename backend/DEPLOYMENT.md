# Host The Feedback API

This is the alternative Render setup; the active deployment is documented in [VERCEL.md](VERCEL.md). No database or persistent disk is required. The build installs the checksum-verified frozen release, and inference loads it at startup without retraining.

This repository includes a [Render Blueprint](../render.yaml) targeting `ml_feedback` on the free plan with automatic deployments turned off. Pushing a Git commit does not trigger a deploy of this configured Render service. Vercel's separate preview deployment settings are unchanged.

## 1. Create The Render Service

1. Sign in at [Render](https://dashboard.render.com/) and connect your GitHub account.
2. Choose **New > Blueprint** and select `OmKhandale05/formcraft`.
3. Select branch **ml_feedback** and Blueprint path **render.yaml**.
4. Enter `FORMCRAFT_ALLOWED_ORIGINS` when prompted. Use the exact Vercel preview URL you will test, such as `https://your-preview.vercel.app`. Do not include `/builder`, wildcard domains or credentials. Multiple allowed URLs can be comma-separated.
5. Confirm the **Free** compute plan, then create the service.
6. Set a random server-only `FORMCRAFT_API_KEY` of at least 32 characters, shared with the Next.js server. Wait for the build to install the frozen model and finish. Save the service's actual HTTPS URL.

Python is pinned to 3.11.11. OpenBLAS/OMP thread limits keep numerical work to one thread. The start command reads Render's `PORT` and binds to `0.0.0.0`. The tested release is committed under `backend/releases`; raw data and experimental artifacts are not. The build verifies its checksum.

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
| `FORMCRAFT_API_KEY` | Random server key shared with Next.js |
| `FORMCRAFT_ALLOWED_ORIGINS` | Exact frontend HTTPS URL(s) |
| `OPENBLAS_NUM_THREADS` | `1` |
| `OMP_NUM_THREADS` | `1` |
| `PYTHONUNBUFFERED` | `1` |

## 2. Connect A Vercel Preview

1. In the existing Vercel project, add server-only `FEEDBACK_API_URL` with the Render service's HTTPS URL and the matching server-only `FORMCRAFT_API_KEY`. Never prefix the key with `NEXT_PUBLIC_`.
2. Scope it to **Preview**, ideally the `ml_feedback` branch, while testing. Keep Production unchanged.
3. Redeploy that branch's preview to apply the server variables.
4. Make sure that preview's actual browser origin is listed in Render's `FORMCRAFT_ALLOWED_ORIGINS`. A changing preview URL needs a matching allowed origin; a stable branch alias can avoid repeated updates. Environment changes require a manual Render deploy with auto-deploy off.

The browser calls the same-origin Next.js proxy. Python rejects direct analysis requests without the server key. CORS is not authentication. The service does not save request text. Apply a provider-edge rate limit to the Next.js route before public use.

## 3. Verify The Hosted API

Run from the repository root, substituting actual URLs:

Supply `FORMCRAFT_API_KEY` securely in the process environment before running the authorized check.

```bash
backend/.venv/bin/python -m backend.check_deployment \
  --api-url https://your-api.onrender.com \
  --origin https://your-preview.vercel.app
```

The script checks model readiness, the browser preflight response, and positive/negative/neutral/mixed-complaint predictions. `/health` returns HTTP 200 only when the model is loaded, otherwise HTTP 503. These four examples check the wiring, not general model accuracy.

Then test in the preview website: submit feedback, analyze the selected field, filter sentiments, reload saved results, view response details and export results. Clicking Analyze again refreshes older predictions.

Render free services can spin down after inactivity. The Next.js proxy times out after 50 seconds, so a cold service may require a retry. Check [Render's current limits](https://render.com/docs/free).

## 4. Promote After Review

After final testing, merge deliberately, update Render's tracked branch and allowed origins, configure server-only `FEEDBACK_API_URL` and `FORMCRAFT_API_KEY` for the website's Production environment, extend rate limiting and deploy. The service can continue using manual deployments.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Frozen model check fails | Confirm the committed release matches its manifest and numerical dependencies are pinned. |
| Missing model / unhealthy service | Confirm the build ran `python backend/scripts/build_vercel.py` and the root directory is empty. |
| Startup fails on origins | Set exact frontend URLs in `FORMCRAFT_ALLOWED_ORIGINS`; production requires this value. |
| Browser cannot reach analysis | Check HTTPS API URL, allowed frontend origin, service readiness and any host access restrictions. |
| Frontend still uses localhost | Set the Preview environment variable and redeploy the frontend. |
| Unauthorized analysis | Check that both servers have the same key; never send it from browser code. |
| First request takes a long time | Allow the free service to wake; retry after the proxy timeout. |

References: [FastAPI deployment](https://render.com/docs/deploy-fastapi), [Blueprint fields](https://render.com/docs/blueprint-spec), [Python versions](https://render.com/docs/python-version), [health checks](https://render.com/docs/health-checks).
