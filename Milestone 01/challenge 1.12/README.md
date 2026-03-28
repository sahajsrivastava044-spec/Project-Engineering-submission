# AI Chatbot Project

## Live Deployment
https://project-engineering-1.onrender.com  (backend)

(https://resilient-souffle-ca1585.netlify.app/) (frontend)


---

## Question 1 — API and Model

This project uses the **OpenRouter API** with the model **openai/gpt-3.5-turbo** to generate AI responses.

---

## Question 2 — Why Backend Instead of Frontend

The API call is made from the backend to prevent exposing the API key in the browser. If the key is included in the frontend, anyone can view it using browser developer tools and misuse it, which could lead to unauthorized usage and exhaustion of API credits.

---

## Question 3 — Fallback Provider

If OpenRouter runs out of credits, I would switch to **Google Gemini API**.

Two changes required:

1. Replace the API endpoint URL and headers with Gemini’s API configuration.
2. Update the request/response format since Gemini uses a different structure than OpenRouter.

---
