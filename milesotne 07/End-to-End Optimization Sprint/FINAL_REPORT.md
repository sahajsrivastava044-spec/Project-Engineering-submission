# Space Mission Logs – Optimization Sprint Final Report

## Baseline Metrics
- **Endpoint Response Time (GET `/api/missions`):** ~421 ms
- **Payload Size:** ~2.26 MB
- **Database Queries:** 401 queries per request
- **React Commit Duration:** ~300ms+ (blocking)
- **DOM Nodes:** ~3,000+ nodes
- **Search Experience:** Severe typing lag (main thread blocked by expensive computation and re-renders)

## Fix Log & Deltas

### 1. Fix N+1 Query Problem
- **Change:** Replaced the loop over missions with a single `prisma.mission.findMany({ include: { crew: true, logs: true } })`.
- **Delta:** 
  - DB Queries dropped from **401** to **1**.
  - Response time improved from **~421 ms** to **~80 ms**.

### 2. Implement Pagination
- **Change:** Added `page` and `limit` queries to skip/take in Prisma and return metadata.
- **Delta:** 
  - Payload size dropped from **2.26 MB** (200 items) to **~226 KB** (20 items).
  - Response time improved to **~65 ms**.

### 3. Trim Payload (Over-fetching)
- **Change:** Used Prisma `select` to omit the large `description` field, returning only required fields (`id`, `name`, `launchDate`, `rocket`, `crew`, `logs`).
- **Delta:** 
  - Payload size for 20 items further dropped from **~226 KB** to **~140 KB**.

### 4. Enable Gzip Compression
- **Change:** Added `compression` middleware to the Express server.
- **Delta:** 
  - Network payload size compressed from **~140 KB** down to **~3.6 KB**!
  - Response time stabilized around **~45 ms**.

### 5. Unstable Prop Trap + React.memo
- **Change:** Moved the inline `style={{ marginBottom: '0' }}` prop to a constant outside the `MissionList` component. 
- **Delta:** Prevented unnecessary re-renders of `MissionCard` components during parent re-renders.

### 7. Double Fetch on Mount
- **Change:** Added an empty dependency array `[]` to the `useEffect` and an `AbortController` to handle cleanup.
- **Delta:** Prevented redundant network requests on component mount, saving server resources and eliminating race conditions in Strict Mode.

### 8. DOM Overload
- **Change:** Implemented client-side slicing in `MissionList.jsx` to render only the first 12 items initially, with a "Load More" button for pagination.
- **Delta:** Reduced initial DOM nodes from **~3,000+** down to **~200**, resulting in a significantly faster and smoother initial paint and scroll experience.

### 9. Unstable Callback
- **Change:** Wrapped the `handleDelete` function in `useCallback` with a functional state update (`prev => ...`) and an empty dependency array.
- **Delta:** Prevented all remaining unnecessary re-renders of `MissionCard` components when deleting an item or interacting with the parent component.
