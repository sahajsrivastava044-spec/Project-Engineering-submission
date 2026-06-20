# ShopLens — Query Performance Audit

**Investigated by:** Antigravity (Senior Developer)
**Date:** June 3, 2026
**Database row counts at time of audit:**
- Products table: 100,000
- Orders table: 50,000
- Users table: 5,000
- Activity table: 200,000

---

## Query 1 — GET /api/products?category=electronics

### The SQL (from Prisma query log)
```sql
SELECT "id", "name", "category", "price", "description", "imageUrl", "metadata", "createdAt", "updatedAt" 
FROM "public"."Product" 
WHERE "category" = 'electronics' 
ORDER BY "createdAt" DESC;
```

### EXPLAIN ANALYZE Output
```text
Gather Merge  (cost=24734.88..29419.86 rows=40226 width=1093) (actual time=270.203..305.700 rows=39825.00 loops=1)
  ->  Sort  (cost=23734.85..23776.76 rows=16761 width=1093) (actual time=218.400..226.710 rows=13275.00 loops=3)
        Sort Key: "createdAt" DESC
        ->  Parallel Seq Scan on "Product"  (cost=0.00..14536.83 rows=16761 width=1093) (actual time=0.921..181.342 rows=13275.00 loops=3)
              Filter: (category = 'electronics'::text)
              Rows Removed by Filter: 20058
Execution Time: 311.728 ms
```

### Key Metrics from the Plan
- **Node type:** Parallel Seq Scan
- **Estimated total cost:** ~14,536.83
- **Actual execution time:** 311.728 ms
- **Rows returned:** 39,825
- **Rows removed by filter:** 20,058 per worker (total ~60k)

### Bottleneck
The database is performing a Sequential Scan across all 100,000 product rows just to find the ones matching `category = 'electronics'`. The row width is also very high (1093 bytes) because Prisma is selecting `description` and `metadata` automatically, which bloats the data processed in memory.

### Proposed Fix
1. Add `@@index([category])` to the `Product` model.
2. Refactor the Prisma query to explicitly `.select()` only the fields needed for a list view (excluding `description` and `metadata`).

### Why This Fix Addresses the Bottleneck
The B-Tree index allows the database engine to perform an Index Scan, skipping over the 60,000 rows that don't match without reading them. Selecting fewer columns reduces the I/O bottleneck and memory usage in Node.js.

---

## Query 2 — GET /api/orders/recent

### The SQL (from Prisma query log)
```sql
-- Initial Query:
SELECT "id", "userId", "total", "status", "createdAt" 
FROM "public"."Order" 
ORDER BY "createdAt" DESC LIMIT 20 OFFSET 0;

-- Followed by 20 of these queries (N+1 pattern):
SELECT "id", "email", "name", "bio", "avatar", "settings", "createdAt" 
FROM "public"."User" 
WHERE "id" = $1 LIMIT 1;
```

### EXPLAIN ANALYZE Output
```text
Limit  (cost=2521.48..2521.53 rows=20 width=76) (actual time=4.875..4.878 rows=20.00 loops=1)
  ->  Sort  (cost=2521.48..2646.48 rows=50000 width=76) (actual time=4.870..4.872 rows=20.00 loops=1)
        Sort Key: "createdAt" DESC
        ->  Seq Scan on "Order"  (cost=0.00..1191.00 rows=50000 width=76) (actual time=0.015..1.497 rows=50000.00 loops=1)
Execution Time: 5.174 ms
```

### Key Metrics from the Plan
- **Node type:** Seq Scan (for the first query) + N+1 Index Scans
- **Estimated total cost:** ~1,191.00
- **Actual execution time:** ~5 ms (for the base query), but 2-4 seconds total request time.
- **Rows returned:** 20
- **Rows removed by filter:** 0

### Bottleneck
While the database query itself is fast (~5ms), the Node.js application contains a `Promise.all()` map that executes an additional `User` lookup for *each* of the 20 orders. This N+1 waterfall forces the app to make 21 separate network roundtrips to the database. Additionally, it selects the large `bio` and `settings` columns for each user.

### Proposed Fix
Refactor the Prisma call to use `include: { user: { select: { name: true, email: true } } }`.

### Why This Fix Addresses the Bottleneck
Prisma will optimize this into a single, efficient query using an `IN` clause (or a JOIN), completely eliminating the 20 extra roundtrips. 

---

## Query 3 — GET /api/users/:id/activity

### The SQL (from Prisma query log)
```sql
SELECT "id", "userId", "type", "data", "metadata", "notes", "createdAt" 
FROM "public"."Activity" 
WHERE "userId" = 'cmpwe40vp0000klyttijfa83j' 
ORDER BY "createdAt" DESC;
```

### EXPLAIN ANALYZE Output
```text
Gather Merge  (cost=49856.74..49861.40 rows=40 width=1744) (actual time=829.260..834.261 rows=51.00 loops=1)
  ->  Sort  (cost=48856.72..48856.76 rows=17 width=1744) (actual time=796.652..796.655 rows=17.00 loops=3)
        Sort Key: "createdAt" DESC
        ->  Parallel Seq Scan on "Activity"  (cost=0.00..48856.37 rows=17 width=1744) (actual time=22.324..796.254 rows=17.00 loops=3)
              Filter: ("userId" = 'cmpwe40vp0000klyttijfa83j'::text)
              Rows Removed by Filter: 66650
Execution Time: 834.289 ms
```

### Key Metrics from the Plan
- **Node type:** Parallel Seq Scan
- **Estimated total cost:** ~48,856.37
- **Actual execution time:** 834.289 ms
- **Rows returned:** 51
- **Rows removed by filter:** 66,650 per worker (total ~200,000)

### Bottleneck
A Sequential Scan over a 200,000-row table due to the missing index on `userId`. This is massively compounded by the row width (1744 bytes) because the `data`, `metadata`, and `notes` columns are huge text/JSON blobs. The engine spends almost a full second pulling useless data from the disk just to filter it out.

### Proposed Fix
1. Add `@@index([userId])` to the `Activity` model.
2. Only select required columns in Prisma (exclude `data`, `metadata`, `notes` if not explicitly needed for the overview list).

### Why This Fix Addresses the Bottleneck
The index allows PostgreSQL to jump straight to the 51 rows belonging to that specific user in under 1ms, rather than spending 834ms scanning 200,000 rows. Narrowing the `select` projection prevents Node.js from choking on multi-megabyte JSON/text payloads.
