# DEPLOYMENT_LOG.md

> Fill in this document as you debug and fix the deployment. This is part of your submission.

---

## 1. What Failed?

<!-- Describe the error(s) you observed when deploying to Render. Paste relevant Render log lines below. -->

```
 Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'npm start'
> notevault-api@1.0.0 start
> node src/index.js
🚀 NoteVault API running on port 10000
==> Your service is live 🎉
==> 
==> ///////////////////////////////////////////////////////////
==> 
==> Available at your primary URL https://project-engineering-submission.onrender.com
==> 
==> ///////////////////////////////////////////////////////////
==> Detected service running on port 10000
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
```

---

## 2. Root Cause Analysis

<!-- For EACH issue you found, explain: What was wrong? Why did it cause the failure? -->

| # | Issue Found | File(s) Affected | Why It Caused a Failure |
|---|---|---|---|
| 1 |hardcooded URL for database |src/config/db.js | no env file|
| 2 |hardcoded JWT secret |frontend/src/config.js | no env file|
| 3 |hardcoded JWT secret |middleware/auth.js | no env file|
| 4 |no validateENV function |index.js | no env file|

---

## 3. Fixes Applied

<!-- Describe every change you made to fix the deployment. Reference filenames and line numbers. -->

### Fix 1:
created an .env file and made sure that alll the values are referenced from them instead of hardcoding.

### Fix 2:
created the DATEBASE_URL and JWT_SECRET in the render.yml file

### Fix 3:
created and implememed the validateEnv function to validate the values

### Fix 4:
created references instead of harcoding values

---

## 4. Redeploy Proof

<!-- Paste evidence that the app now deploys and runs successfully. -->

- **Render Dashboard Screenshot**: (attach or link)
- **Health Check Response**:

```json
(paste /api/health response here)
```

- **Render Logs (successful startup)**:

```
(paste clean startup logs here)
```

---

## 5. Key Takeaways

<!-- In 2–3 sentences, what did you learn from this exercise? -->


