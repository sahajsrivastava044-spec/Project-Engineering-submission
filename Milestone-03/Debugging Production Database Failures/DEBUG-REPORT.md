Production Database Bug Investigation — OrderFlow

This document records the full investigation of three production data bugs identified in the OrderFlow system. Each issue has been reproduced using SQL, traced to its schema-level root cause, fixed using constraints, and validated to ensure correctness.

🐞 Bug 1 — Orphan Orders (Invalid Customer References)
Symptom

Orders exist with customer_id values that do not correspond to any valid customer.

Reproduction Query
SELECT o.id, o.customer_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL;
Observed Result
Orders are returned where customer_id does not exist in the customers table
This indicates orphaned records

Data Flow Trace
API endpoint /orders returns order data
Order data originates from the orders table
orders.customer_id is used to associate orders with customers
Insert logic in /routes/orders.js allows any customer_id value
No schema constraint prevents invalid references
Root Cause

The orders table has no FOREIGN KEY constraint on customer_id.

This allows insertion of orders referencing non-existent customers.

Fix Applied
ALTER TABLE orders
ADD CONSTRAINT fk_orders_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE;
Explanation

This ensures:

Every order must reference a valid customer
Deleting a customer removes associated orders, preventing orphan records

Validation
Re-run Reproduction Query
SELECT o.id, o.customer_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL;
Result
No rows returned ✅

Attempt Invalid Insert
INSERT INTO orders (id, customer_id, status)
VALUES (999, 9999, 'pending');
Result
ERROR: insert or update on table "orders" violates foreign key constraint

✅ Constraint successfully blocks invalid data

🐞 Bug 2 — Duplicate Products (Non-Unique SKU)
Symptom

Multiple products share the same sku, causing ambiguity in inventory and order items.

Reproduction Query
SELECT sku, COUNT(*) 
FROM products
GROUP BY sku
HAVING COUNT(*) > 1;
Observed Result
Duplicate sku values found
Same product identifier used multiple times
Data Flow Trace
API endpoint /products fetches product data
Orders reference products via sku or product_id
Insert logic allows duplicate SKUs
Schema lacks uniqueness enforcement
Root Cause

The products.sku column has no UNIQUE constraint.

This allows duplicate product identifiers.

Fix Applied
ALTER TABLE products
ADD CONSTRAINT unique_products_sku UNIQUE (sku);
Explanation

Ensures:

Each product has a unique SKU
Prevents duplication and ambiguity
Validation
Re-run Reproduction Query
SELECT sku, COUNT(*) 
FROM products
GROUP BY sku
HAVING COUNT(*) > 1;
Result
No duplicate rows returned ✅

Attempt Invalid Insert
INSERT INTO products (name, sku, price)
VALUES ('Test Product', 'SKU123', 100);
Result
ERROR: duplicate key value violates unique constraint "unique_products_sku"

✅ Duplicate entries prevented

🐞 Bug 3 — Invalid Order Status Values
Symptom

Orders contain invalid or unexpected status values.

Reproduction Query
SELECT *
FROM orders
WHERE status NOT IN ('pending', 'completed', 'cancelled');
Observed Result
Rows found with invalid status values like:
'done'
'in-progress'
NULL values
Data Flow Trace
API endpoint /orders returns order status
Status is stored in orders.status
Insert/update routes accept any string
No validation or constraint exists in schema

Root Cause

The orders.status column has no CHECK constraint.

This allows invalid and inconsistent values.

Fix Applied
ALTER TABLE orders
ADD CONSTRAINT check_orders_status
CHECK (status IN ('pending', 'completed', 'cancelled'));
Explanation

Restricts status values to a predefined valid set.

Validation
Re-run Reproduction Query
SELECT *
FROM orders
WHERE status NOT IN ('pending', 'completed', 'cancelled');

Result
No invalid rows returned ✅
Attempt Invalid Insert
INSERT INTO orders (customer_id, status)
VALUES (1, 'in-progress');
Result
ERROR: new row violates check constraint "check_orders_status"

✅ Invalid values blocked