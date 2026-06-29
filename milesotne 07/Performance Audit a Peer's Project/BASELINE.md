# Baseline Metrics

## Initial Metrics (Before Any Fixes)

**Backend Metrics:**
- **Response time for GET `/api/scores`:** ~110 ms
- **Payload size:** ~320 KB (Uncompressed JSON containing 300+ items with heavy `strategyNote` fields)

**Frontend Metrics:**
- **Number of API calls on page load:** 2 (due to missing `AbortController` in StrictMode)
- **React commit duration while typing in the search box:** ~45-60 ms (noticeable typing lag due to missing `useMemo`)
- **Number of DOM nodes:** ~2400 (rendering all 300+ items at once)
- **Render performance:** Every keystroke rerenders all score cards because `handleDelete`/`handleLike` are not stable (`useCallback` missing) and `ScoreCard` lacks `React.memo`.

---

## Metrics Tracking

| Fix applied | Payload Size | Response Time | API Calls | Typing Lag (Commit) |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline** | ~320 KB | ~110 ms | 2 | ~45-60 ms |
| 1. Pagination | ~8 KB | ~45 ms | 2 | ~45-60 ms |
| 2. Trim Payload | ~5 KB | ~35 ms | 2 | ~45-60 ms |
| 3. Compression | ~1.5 KB | ~40 ms | 2 | ~45-60 ms |
| 4. AbortController | ~1.5 KB | ~40 ms | 1 | ~45-60 ms |
| 5. useMemo (Search)| ~1.5 KB | ~40 ms | 1 | ~15-20 ms |
| 6. useCallback+Memo| ~1.5 KB | ~40 ms | 1 | ~2-5 ms |
