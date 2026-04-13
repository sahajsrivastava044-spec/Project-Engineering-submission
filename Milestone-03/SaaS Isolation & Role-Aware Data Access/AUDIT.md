# AUDIT.md

## Pre-Refactor Audit

### 1. No Tenant Isolation
- Tables like users, projects, billing_details do not have tenant_id
- This means queries can return data across all organisations

Risk:
A user from one company can access another company's data

---

### 2. No Tenant Boundary in Relationships
- Foreign keys do not enforce tenant consistency
- A project can reference a user from another tenant

Risk:
Cross-tenant data leakage

---

### 3. Sensitive Data Exposure
Sensitive fields identified:
- salary (users)
- billing_card_last4 (billing_details)
- bank_account
- ssn

Problem:
All roles can access these fields

---

### 4. No Role-Based Access Control
- No distinction between Admin, Manager, User
- API returns full data without filtering

Risk:
Unauthorized data exposure

---

### 5. Unsafe API Responses
- Raw DB responses are sent directly
- No filtering of sensitive fields

---

### 6. No Indexing on Critical Queries
- tenant_id filtering not optimized (because it doesn’t exist)
- Slow queries at scale

---

### 7. High Risk of Data Breach
- Missing WHERE tenant_id
- Could expose entire database