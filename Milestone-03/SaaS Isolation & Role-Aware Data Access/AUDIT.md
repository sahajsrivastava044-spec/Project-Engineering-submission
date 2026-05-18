# Pre-Refactor Audit

This document lists the structural problems, vulnerabilities, and missing constraints in the current CorpFlow schema.

## 1. Missing Tenant Isolation
- **Problem**: The schema entirely lacks a concept of tenants (organizations). There is no `tenants` table.
- **Location**: `schema.sql` (entire file)
- **Consequence**: The application cannot support multiple client organizations because there is no way to distinguish which data belongs to which organization.

## 2. Missing Tenant Identifiers on Tables
- **Problem**: The `users`, `projects`, and `billing_details` tables have no `tenant_id` column.
- **Location**: `schema.sql`, lines 8, 17, 25.
- **Consequence**: A query without a tenant filter (e.g., `SELECT * FROM users`) returns all users across all organizations, leading to a complete data breach of client information.

## 3. Lack of Tenant Boundaries in Relationships
- **Problem**: The foreign key `user_id` in `billing_details` only references `users(id)`.
- **Location**: `schema.sql`, line 27.
- **Consequence**: A user from Tenant A could be linked to billing details belonging to Tenant B (either accidentally or maliciously), violating data boundaries.

## 4. Exposed Sensitive Fields (Users)
- **Problem**: The `password_hash` and `salary` fields are stored but queries are not restricting access to them based on roles.
- **Location**: `schema.sql`, lines 12, 14.
- **Consequence**: `password_hash` could be leaked over the API, making it susceptible to cracking. `salary` is sensitive HR information and could be visible to regular employees.

## 5. Exposed Sensitive Fields (Billing)
- **Problem**: `card_holder_name`, `card_last4`, `expiry_date`, and `billing_address` are stored without access restrictions.
- **Location**: `schema.sql`, lines 28-31.
- **Consequence**: Financial information could be leaked to unauthorized users, violating privacy and security compliance.

## 6. No Role-Based Access Control (RBAC) in Queries
- **Problem**: API endpoints directly return all fields (e.g., `SELECT * FROM users`) without filtering the response based on the requesting user's role.
- **Location**: `routes/users.js` and `routes/projects.js`
- **Consequence**: Regular employees can see sensitive data of other employees (like salaries) or administrative details.

## 7. Missing Indexes for Multi-Tenant Queries
- **Problem**: There are no indexes on `tenant_id` (since the column does not exist yet).
- **Location**: `schema.sql`
- **Consequence**: Once tenant filtering is added, filtering large tables by `tenant_id` without an index will result in full table scans, causing severe performance degradation.

---

## Role-Based Access Rules & Sensitive Fields

### Sensitive Fields Inventory
- `password_hash` (Table: `users`): Strictly internal, **NEVER** returned in API responses.
- `salary` (Table: `users`): Sensitive HR data. Accessible only to `admin` or the user themselves.
- `card_holder_name`, `card_last4`, `expiry_date`, `billing_address` (Table: `billing_details`): Sensitive financial data. Accessible only to `admin`.

### Role Definitions & Access Rights

#### Admin
- **Users**: Sees all users within the same tenant. Can view sensitive fields like `salary`.
- **Projects**: Sees all projects within the tenant.
- **Billing**: Can view all billing details within the tenant.
- **Restrictions**: Cannot see `password_hash`. Cannot see data from other tenants.

#### Manager
- **Users**: Sees team members within the same tenant. **Cannot** see sensitive financial fields like `salary`.
- **Projects**: Sees team projects within the same tenant.
- **Billing**: **Cannot** see billing details.
- **Restrictions**: Cannot see `password_hash`. Cannot see `salary`. Cannot see data from other tenants.

#### User
- **Users**: Sees own profile. **Cannot** see other users' data. Can see their own `salary`.
- **Projects**: Sees assigned projects only.
- **Billing**: **Cannot** see billing details.
- **Restrictions**: Cannot see `password_hash`. Cannot see other users' `salary` or data. Cannot see data from other tenants.
