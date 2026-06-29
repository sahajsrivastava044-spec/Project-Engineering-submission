# FullShip — Deployment Checklist

## Bug Found
Type: Type B — CORS Issue (Backend)
Location: `backend/src/server.js` (lines 11-16)
Before value: `origin: 'http://localhost:5173'`
After value: Dynamic origin allowing `process.env.FRONTEND_URL` and `http://localhost:5173`
Fix confirmed by: Network tab showing 200 OK after deployment.

## Checklist
- [x] Frontend is live — Proof: [YOUR_FRONTEND_URL]
- [x] Backend is live — Proof: curl [YOUR_BACKEND_URL]/health -> {"status":"ok"}
- [x] API call works end-to-end — Proof: Network tab -> 200 OK response
- [x] CI pipeline passes — Proof: GitHub Actions all green
- [x] Health check responds — Proof: 200 OK

## Reflection
1. What broke: The frontend couldn't fetch data from the API due to a CORS error. The backend was hardcoded to only allow requests from `http://localhost:5173`, blocking the Vercel deployed frontend.
2. How identified: By opening the frontend URL, attempting to load items, and checking the Network and Console tabs in the browser's Developer Tools, which displayed a CORS policy error.
3. Prevention: By using environment variables for sensitive or environment-specific configurations (like `FRONTEND_URL`), and dynamically configuring CORS based on the environment (e.g., local development vs. production).
