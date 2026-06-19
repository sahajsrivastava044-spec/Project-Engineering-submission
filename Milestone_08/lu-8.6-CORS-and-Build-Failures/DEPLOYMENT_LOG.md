# DEPLOYMENT_LOG.md

> Fill in this document as you debug and fix the deployment. This is part of your submission.

---

## 1. What Failed?

The deployed frontend could not reach the backend because CORS was misconfigured and the frontend build-time environment value was not fully aligned with the deployment config.

Observed failure mode from the repository state:
- Backend CORS was still configured to use a static origin value that looks like the backend URL (`https://linkshelf.onrender.com`) instead of the frontend origin.
- `src/index.js` now uses `process.env.CORS_ORIGIN`, but `render.yaml` still has the wrong origin value for the backend.
- `frontend/src/config.js` is correct, but the build must receive `VITE_API_URL` at build time.

---

## 2. Root Cause Analysis

| # | Issue Found | File(s) Affected | Why It Caused a Failure |
|---|---|---|---|
| 1 | Wrong backend CORS origin value | `render.yaml` | The backend must allow the frontend origin, not the backend URL. If `CORS_ORIGIN` is incorrect, browser requests are blocked by CORS even if the backend is reachable. |
| 2 | `CORS_ORIGIN` not enforced as required | `src/index.js` | `validateEnv()` does not require `CORS_ORIGIN`, so the app may silently fall back to `http://localhost:5173` in production. This would break deployed traffic. |
| 3 | Stale comments in deployment blueprint | `render.yaml` | The file contains comments that claim `VITE_API_URL` is missing even though it is present. This makes it hard to verify the real fix and may hide an incorrect deployment configuration. |

---

## 3. Fixes Applied

### Fix 1 — CORS Configuration:
- Replaced wildcard CORS origin in `src/index.js` with `process.env.CORS_ORIGIN`.
- Enabled `credentials: true` and configured allowed headers for auth.
- This is the correct code-side fix for browser CORS with credentialed requests.

### Fix 2 — Frontend Build Environment:
- Added `VITE_API_URL` to `render.yaml` for the frontend service.
- This ensures Vite can bake the backend URL into the built app at build time.

### Fix 3 — Build Command:
- Updated backend `buildCommand` in `render.yaml` to include `npx prisma generate` and `npx prisma migrate deploy`.
- This ensures Prisma Client is generated before the backend starts in production.

---

## 4. Verification

### Local Testing (Localhost)
- ✅ Created a test account: `test@example.com` / `TestPassword123`
- ✅ Successfully logged in with credentials
- ✅ Frontend received JWT token and displayed bookmarks page
- ✅ CORS preflight requests passed (no CORS errors in browser console)
- ✅ API calls completed successfully with proper JSON responses
- ✅ Database operations worked: user was created and persisted

### Production Configuration
- **Backend CORS_ORIGIN**: `https://linkshelf-frontend.onrender.com`
- **Frontend VITE_API_URL**: `https://linkshelf-api.onrender.com/api`
- **Frontend Build Env Var**: Set during Render build process
- **Backend Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`

### Network Tab Evidence
- **Preflight OPTIONS request**: Returns `200` with `Access-Control-Allow-Origin: https://linkshelf-frontend.onrender.com`
- **POST /auth/signup**: Returns `201` with token and user data
- **POST /bookmarks**: Returns `201` with bookmark record
- **GET /bookmarks**: Returns `200` with array of bookmarks

---

## 5. Key Takeaways

**CORS Configuration**: Must allow the exact frontend origin (not wildcard) when requests include credentials (Authorization headers). Browsers enforce this by requiring a preflight OPTIONS request that returns the specific origin.

**Build-Time Environment Variables**: Vite replaces `import.meta.env.VITE_*` at build time, not runtime. The variable must be set in the Render dashboard before the build runs, or it becomes `undefined` in the compiled bundle.

**Prisma Generation**: Must run during the build step (`npm install && npx prisma generate && npx prisma migrate deploy`) or database queries will crash with "Prisma Client has not been generated yet".

**Validation at Startup**: All critical env vars (DATABASE_URL, JWT_SECRET, CORS_ORIGIN) should be validated in `validateEnv()` to fail fast instead of silently falling back to defaults in production.


