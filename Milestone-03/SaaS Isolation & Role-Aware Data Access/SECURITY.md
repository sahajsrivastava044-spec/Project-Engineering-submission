# SECURITY.md

## Tenant Isolation
All tables include tenant_id to isolate company data.

## Cross-Tenant Protection
Composite foreign keys prevent cross-tenant relationships.

## Sensitive Fields
- salary
- ssn

Only visible to Admin.

## RBAC
Admin → full access  
Manager → no sensitive data  
User → limited personal data  

## API Security
Responses filtered before sending.

## Indexing
Indexes added on tenant_id for performance.