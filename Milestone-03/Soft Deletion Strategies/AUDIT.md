# LedgerApp Pre-Refactor Audit

This document lists every hard delete in the codebase before implementing soft deletion.

## 1. Users Table
- **File Path**: `routes/users.js`
- **Line Number**: 44
- **Query**: `DELETE FROM users WHERE id = $1`
- **Affected Table**: `users` (cascades to `accounts` and `transactions`)
- **Data Permanently Lost**: The primary user identity (name, email, creation timestamp) is completely removed, making it impossible to know who previously existed in the system or associated historical financial records, as `ON DELETE CASCADE` will also destroy all their accounts and transactions.

## 2. Accounts Table
- **File Path**: `routes/accounts.js`
- **Line Number**: 43
- **Query**: `DELETE FROM accounts WHERE id = $1`
- **Affected Table**: `accounts` (cascades to `transactions`)
- **Data Permanently Lost**: The user's account details (account type, balance, creation date) are permanently erased, along with all associated transaction history due to `ON DELETE CASCADE`, destroying the financial trail for that account.

## 3. Transactions Table
- **File Path**: `routes/transactions.js`
- **Line Number**: 43
- **Query**: `DELETE FROM transactions WHERE id = $1`
- **Affected Table**: `transactions`
- **Data Permanently Lost**: An individual financial movement (amount, credit/debit type, description, timestamp) is permanently deleted, breaking the immutability of the financial ledger and leaving no trace of the transaction.
