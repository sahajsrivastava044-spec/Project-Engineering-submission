# Movie Quote API Load Test Report

## Test Configuration
- **Target:** `http://localhost:3001`
- **Ramp-up:** 50 virtual users over 30 seconds
- **Scenarios Tested:**
  - `GET /api/quotes/unpaginated`
  - `GET /api/quotes?page=1&limit=20`
  - `POST /api/favorites`

## Results Summary (Overall)
- **Total Requests:** 1500
- **Total Scenarios Completed:** 1500
- **Throughput:** ~41 requests/sec
- **Median Response Time:** 102.5 ms
- **p95 Response Time:** 376.2 ms
- **Error Rate:** 0% (All 1500 requests returned 200 OK)

## Comparison: Paginated vs Unpaginated
- **Unpaginated GET (`/api/quotes/unpaginated`):** Returns all 1,000 quotes in a single massive payload (approx 140 KB). This consumes significant memory and bandwidth. Under load, chunked transfer delays and large JSON serialization tasks block the event loop, causing server lag.
- **Paginated GET (`/api/quotes?page=1&limit=20`):** Returns only 20 quotes per request (approx 2.8 KB). It drastically improves median and p95 times because it requires far less network bandwidth and CPU time to serialize. It effectively increases the overall server throughput because the server can respond almost instantly without getting bogged down by massive payloads.

## Explanation of p95
The **p95 (95th percentile)** response time was 376.2 ms. This means that 95% of all requests completed in 376.2 ms or less, while the slowest 5% of requests took longer than 376.2 ms. p95 is a crucial metric because it reflects the experience of the slowest cohort of users, which helps identify worst-case performance under load (e.g., users hitting the synchronous blocking POST request or the large unpaginated GET request concurrently).

## Intentional Errors Discovered
During my manual investigation (documented in `Changes.md`) and subsequent load testing, I discovered 5 hidden intentional errors:
1. **Missing CORS:** The `app.use(cors())` middleware is commented out.
2. **Chunked Transfer / No Content-Length:** The unpaginated GET endpoint forces `Transfer-Encoding: chunked`, which can cause issues with large payloads under load.
3. **Pagination Off-By-One:** When calculating `totalPages` for the paginated endpoint, it incorrectly returns 51 instead of 50 when the total count is perfectly divisible by the limit.
4. **Synchronous Blocking:** The POST `/api/favorites` endpoint features an artificial 50ms blocking `while` loop that stalls the entire Node.js event loop, heavily impacting concurrent performance.
5. **No Input Validation:** The POST `/api/favorites` endpoint accepts payloads without validating `quoteId`, potentially storing `undefined` or `null`.
