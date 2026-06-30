# LedgerApp Soft Deletion Trade-offs & Analysis

## 1. Storage and Performance Impact (Move 5 Analysis)

### Storage Growth
With soft deletes, deleted records remain in the database indefinitely. Assuming LedgerApp processes 10,000 transactions a month and 5% are deleted or reverted, the `transactions` table will accumulate an extra 500 "dead" rows per month. Over 5 years, this results in 30,000 soft-deleted rows. If each row is ~200 bytes, this is about 6MB of extra storage per table for deleted records—negligible in terms of disk space, but it progressively bloats table size and active memory if not indexed properly.

### The Query Performance Problem Solved by Partial Indexes
Without a partial index, every `SELECT * FROM transactions WHERE deleted_at IS NULL` forces the database engine to scan all rows (both active and deleted) to evaluate the `deleted_at IS NULL` condition (a full table scan). As the ratio of soft-deleted rows grows, read query speeds will degrade. The partial index (`CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL`) creates a smaller, highly optimized B-Tree containing *only* active records, completely bypassing soft-deleted rows during active data lookups.

### Volume Threshold for Performance Concerns
Without the partial index, performance deterioration typically becomes noticeable when a table exceeds 100,000 to 500,000 rows (depending on memory), particularly if the proportion of deleted records exceeds 15-20%. At this threshold, sequential scans on large tables start evicting active data from the database's shared buffers (RAM), resulting in expensive disk I/O for regular user queries.

## 2. Design Reasoning (Move 6)

### When Soft Delete is the Right Call
1. **Financial Immutability**: LedgerApp deals with financial transactions. If an account is closed or a transaction is disputed and rolled back, destroying the record breaks the ledger's integrity and makes account reconciliation impossible. Soft deletion preserves the history while hiding it from the active user balance.
2. **Accidental Account Deletions**: If a user accidentally deletes their checking account, a hard delete immediately destroys all associated transaction history due to `ON DELETE CASCADE`. Soft deletion provides a safety net where customer support can easily restore the account and its historical records simply by setting `deleted_at = NULL`.

### When Hard Delete is Still Appropriate
Hard deletion is still necessary for temporary, ephemeral, or highly sensitive compliance data. In LedgerApp, if we ever introduce **session tokens, password reset codes, or temporary OAuth nonces**, these should be hard-deleted upon expiration or use. Retaining them provides no analytical value and increases the attack surface for session hijacking if the database is ever compromised. Additionally, if LedgerApp is subject to GDPR "Right to Be Forgotten" requests, we may need a specific hard-delete worker to completely scrub PII from the `users` table after a legally mandated retention period.

### Compliance Scenarios
**Scenario: Anti-Money Laundering (AML) Audit**
Under financial regulations like the Bank Secrecy Act (BSA), institutions must retain transaction records for 5 years. If a user engaged in suspicious structuring (e.g., rapid deposits and immediate account deletion to hide money movement) and we used hard deletes, the audit trail would be destroyed. 
By utilizing soft deletes, when regulators request the history for a specific flagged user, an administrator can query the soft-deleted records (`SELECT * FROM transactions WHERE account_id = $1 AND deleted_at IS NOT NULL`). This ensures LedgerApp can provide cryptographic or historical proof of the funds entering and exiting the system, satisfying the compliance requirement without exposing those inactive records to normal application endpoints.
