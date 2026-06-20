# Baseline Performance Metrics

## Environment Setup
- Application seeded with 500+ orders, users, products, and order items.
- Database: SQLite (via Prisma)

## Metrics Measured (GET /api/orders)

1. **Response Time**: ~2000ms (1.99s)
2. **Payload Size**: ~5.09 MB (5,091,904 bytes)
3. **Database Queries**: 12 queries. Although Prisma bundles `include` into fewer queries (e.g., using `IN` clauses instead of 500 individual queries), it still fetches the entire table multiple times sequentially for related models.
4. **Event Loop Block**: ~500ms artificial blocking delay during the data processing loop (`while(Date.now() - start < 1)`).

## Issues Identified
- **N+1 / Sub-optimal Fetching**: The route fetches `baseOrders` entirely, and then fetches them again with nested includes (`user`, `items`, `product`), resulting in multiple sequential heavy queries.
- **No Pagination**: It fetches all 500+ orders at once, transferring large amounts of data.
- **Over-fetching**: The response includes all columns for users (e.g., `role`, `address`, `bio`, `avatarUrl`), products, and items, causing severe data bloat (5 MB payload).
- **Blocking Event Loop**: The `.map` over 500+ items has a synchronous `while` block that halts the server for 1ms per order, severely impacting concurrent users.
- **No Compression**: The payload is uncompressed text, maximizing network transfer time for 5MB of JSON.
