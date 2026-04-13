-- CorpFlow v1.0 Database Schema
-- Standard tables for users, projects, and billing.

DROP TABLE IF EXISTS billing_details;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

CREATE TABLE tenants (
  tenant_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('ADMIN','MANAGER','USER')) NOT NULL,
  salary NUMERIC,
  ssn TEXT,
  tenant_id INT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tenant_id INT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE billing_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_holder_name VARCHAR(100),
    card_last4 VARCHAR(4),
    expiry_date VARCHAR(5),
    billing_address TEXT
);

FOREIGN KEY (user_id, tenant_id)
REFERENCES users(id, tenant_id)

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
-- Seed Initial Data
INSERT INTO users (full_name, email, password_hash, role, salary) VALUES
('Alice Johnson', 'alice@pouch.io', 'pbkdf2:sha256:600000$hasher$81726a', 'admin', 125000.00),
('Bob Smith', 'bob@pouch.io', 'pbkdf2:sha256:600000$hasher$81726b', 'manager', 95000.00),
('Charlie Davis', 'charlie@velocity.com', 'pbkdf2:sha256:600000$hasher$81726c', 'admin', 140000.00),
('David Miller', 'david@velocity.com', 'pbkdf2:sha256:600000$hasher$81726d', 'employee', 75000.00);

INSERT INTO projects (name, description, status, budget) VALUES
('Pouch Portal', 'Customer portal for Pouch.io', 'active', 50000.00),
('Velocity Engine', 'Back-end engine for Velocity', 'active', 120000.00),
('Secret R&D', null, 'inactive', 250000.00);

INSERT INTO billing_details (user_id, card_holder_name, card_last4, expiry_date, billing_address) VALUES
(1, 'Alice Johnson', '4242', '12/28', '123 Tech Lane, SF'),
(3, 'Charlie Davis', '9182', '08/26', '789 Velocity Rd, NY');
