# Vercel Feedback Deployment

## Test URLs

- [Frontend preview](https://formcraft-ml-feedback.vercel.app): requires an authorized Vercel account.
- [API health](https://formcraft-feedback-api.vercel.app/health): public readiness, version and release checksum.
- Live website: `https://formcraft.omverse.in`, unchanged until deliberate production rollout.

Two projects are used: `formcraft` for Next.js and `formcraft-feedback-api` for FastAPI. No new database or Render account is needed.

## Frozen Model

`releases/manifest.json` identifies the tested `feedback-tfidf-lr-v2-release1` artifact, its SHA-256 checksum and library versions. This freezes the locally tested model (review weight 0.5), intentionally replacing the previous Linux-trained deployment that selected weight 2.

The build copies the committed release into `artifacts/sentiment.joblib`, verifies its checksum and runs prediction smoke checks. It does not retrain, install training tools or download datasets. Startup verifies bytes before loading. Joblib is executable serialization: never load user-uploaded models. A checksum verifies release integrity, not the safety of an arbitrary file or prediction accuracy.

Experiment training remains `python -m backend.train`. Restore the release with `python backend/scripts/build_vercel.py` before serving. New releases require a new name, tests and an explicit manifest update. The release generator refuses to overwrite the current release.

## Service Authentication

Browser -> same-origin `POST /api/feedback/analyze` -> Python `POST /analyze`.

Next.js validates origin, JSON, identifiers, batch size and text lengths. Bodies above 512 KiB are rejected before forwarding. It uses a server-controlled URL, prohibits redirects, times out after 50 seconds and returns validated results or sanitized errors.

Set the same random 32-byte key in `FORMCRAFT_API_KEY` on both projects. Next.js supplies `X-FormCraft-Key` to Python; missing or incorrect keys return 401. Hosted services fail closed if the key is missing or too short. Never prefix it with `NEXT_PUBLIC_`. Health stays public. CORS is not authentication.

This is **service authentication**, not user-account authentication. The current sign-in screen does not establish a verified user session. Preview access is separately restricted by Vercel deployment protection. Real account authentication is still required for individual-user permissions.

## Environment Variables

| Project | Variable | Value |
| --- | --- | --- |
| Next.js Preview, branch `ml_feedback` only | `FEEDBACK_API_URL` | `https://formcraft-feedback-api.vercel.app` |
| Next.js Preview, branch `ml_feedback` only | `FORMCRAFT_API_KEY` | Server secret shared with Python |
| Python Production/Preview | `FORMCRAFT_API_KEY` | Same server secret |
| Python Production/Preview | `FORMCRAFT_ENV` | `production` |
| Python Production/Preview | `FORMCRAFT_ALLOWED_ORIGINS` | Exact allowed origins, without paths |

The legacy `NEXT_PUBLIC_FEEDBACK_API_URL` is no longer read. Both applications need redeployment after server environment changes. An ignored local `backend/.env.api-key` holds the deployment test key with owner-only permissions. Do not commit, print or share it. Rotate an exposed key on both projects and redeploy.

## Rate Limiting

Vercel Firewall rule `formcraft-feedback-preview` allows 20 requests per 60-second fixed window per IP for `/api/feedback/analyze` on `formcraft-ml-feedback.vercel.app`. It runs at the provider edge, not in one serverless instance's memory. Excess requests receive 429; the UI asks the user to wait and retry.

This rule is deliberately scoped to the stable preview alias. Other preview URLs retain Vercel account protection but are not covered by this hostname-specific limit. Production traffic is unaffected. Extend the rule before production rollout. Shared-IP users share the quota; fixed-window limits are not complete protection against distributed abuse.

## Deploy And Verify

The API project is CLI-deployed, not Git-connected. If connecting Git, set its Root Directory to `backend` and tracked branch to `ml_feedback`. Backend config disables automatic `main` deployments during testing.

```bash
npx vercel deploy --cwd backend --prod
npx vercel deploy
```

The first command uses `backend/.vercel` to target the separate API. The second uses the root project link and creates a frontend **preview**. Do not use `--prod` on the website yet. Update the stable preview alias after deploying. Never commit project metadata or bypass tokens.

```bash
backend/.venv/bin/python backend/scripts/build_vercel.py --check
backend/.venv/bin/python -m pytest backend/tests -q
npm run test:feedback-proxy
npm run test:feedback
npm run lint
npm run build
```

For direct hosted verification, supply `FORMCRAFT_API_KEY` securely in the process environment, then run `python -m backend.check_deployment --api-url https://formcraft-feedback-api.vercel.app`. Never paste the key into shared commands or screenshots. Without a key, direct analysis should return 401. Compare health's `release_sha256` with the manifest.

The browser suite accepts `FORMCRAFT_TEST_URL` and an authorized `FORMCRAFT_TEST_VERCEL_BYPASS`. The bypass header goes only to the exact frontend host, never Python. Hosted checks remain necessary before merging; local tests cannot prove firewall enforcement.

The current release passed 72 Python tests, proxy checks, lint, the production build, hosted authorized/unauthorized checks and the deployed browser workflow. The hosted checksum matched the manifest. A burst of invalid preview requests returned HTTP 429 above the firewall quota without running inference. These checks validate deployment behavior, not general sentiment accuracy.

After acceptance, merge deliberately, configure the website's Production server variables, extend the firewall rule and enable the API project's main branch. Hosting does not improve accuracy and remains subject to account usage limits.

References: [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi), [Python runtime](https://vercel.com/docs/functions/runtimes/python), [Rate limiting](https://vercel.com/kb/guide/add-rate-limiting-vercel).
