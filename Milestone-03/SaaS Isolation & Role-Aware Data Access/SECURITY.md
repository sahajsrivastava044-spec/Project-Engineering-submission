# Security Decisions

## Sensitive Fields
- `password_hash`: Highly sensitive. Never returned in any API responses. Kept strictly on the backend.
- `salary`: Sensitive HR information. Visible only to `admin` or the authenticated user themselves. Filtered out from `manager` or other `user` queries.
- `budget`: Financial project details. Visible only to `admin`. Filtered out from `manager` and `user` queries.
- `billing_details` (`card_holder_name`, `card_last4`, etc.): Sensitive financial data. Would be visible only to `admin` if exposed.

## Tenant Boundaries in Queries
- **Database Level**: A `tenants` table was introduced. `tenant_id` was added to `users`, `projects`, and `billing_details` tables as a foreign key. The primary key on `users` and `projects` was changed to a composite key `(tenant_id, id)`. 
- **API Level**: All routes in `routes/users.js` and `routes/projects.js` now strictly append a `WHERE tenant_id = $1` or `AND tenant_id = $2` clause. This guarantees that users can only fetch data belonging to their own organization.

## Cross-Tenant Risks and Prevention
- **Accidental Relationship Linking**: By using composite primary keys `(tenant_id, id)` on parent tables (like `users`), child tables (like `billing_details`) must include `tenant_id` in their foreign keys. The constraint `FOREIGN KEY (tenant_id, user_id) REFERENCES users(tenant_id, id)` prevents cross-tenant record linking natively at the database layer.
- **Data Leaks via IDOR**: The mock authentication middleware guarantees that `tenantId`, `role`, and `id` are extracted. The tenant boundary is strictly enforced on every `SELECT` query, completely mitigating the risk of Insecure Direct Object Reference across tenants.
- **Performance Impact**: Composite indexes on `tenant_id` (`idx_users_tenant_id`, etc.) ensure that tenant-scoped queries remain fast and avoid full table scans.
