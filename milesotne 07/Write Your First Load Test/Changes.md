# Manual Endpoint Testing & Observations

## 1. GET /api/quotes/unpaginated
- **Time:** ~0.015s
- **Response Size:** ~140,537 bytes (140 KB)
- **Observation:** Large payload without pagination. The response is huge and takes up more memory and network bandwidth.

## 2. GET /api/quotes?page=1&limit=20
- **Time:** ~0.007s
- **Response Size:** ~2,851 bytes (2.8 KB)
- **Observation:** Much faster and lightweight. However, I noticed that `totalPages` is calculated as 51 when it should be exactly 50 (since 1000 / 20 = 50).

## 3. POST /api/favorites
- **Time:** ~0.076s
- **Response Size:** ~47 bytes
- **Observation:** Noticeably slow for a simple POST request. A ~50ms artificial delay is present.

## Hidden Implementation Errors Identified in server.js
1. **Missing CORS:** The API is missing the `Access-Control-Allow-Origin` header (the `app.use(cors())` line is commented out).
2. **Chunked Transfer / No Content-Length:** The unpaginated GET endpoint forces chunked transfer (`res.setHeader('Transfer-Encoding', 'chunked')`), making it harder for clients to know the full payload size.
3. **Pagination Off-By-One Error:** The `totalPages` calculation incorrectly adds 1 when the total is perfectly divisible by the limit.
4. **Synchronous Blocking:** The POST `/api/favorites` endpoint blocks the entire Node.js event loop synchronously for 50ms per request using a `while` loop.
5. **No Input Validation:** The POST `/api/favorites` route pushes the `req.body.quoteId` directly into the in-memory array without checking if it's valid, allowing `undefined` or `null`.
