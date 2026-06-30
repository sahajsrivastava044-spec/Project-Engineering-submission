const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const usersRoute = require('./routes/users');
const accountsRoute = require('./routes/accounts');
const transactionsRoute = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Primary API Endpoints
app.use('/users', usersRoute);
app.use('/accounts', accountsRoute);
app.use('/transactions', transactionsRoute);

// Admin route to view soft-deleted records
app.get('/admin/deleted', async (req, res) => {
  const db = require('./db');
  try {
    const users = await db.query('SELECT * FROM users WHERE deleted_at IS NOT NULL');
    const accounts = await db.query('SELECT * FROM accounts WHERE deleted_at IS NOT NULL');
    const transactions = await db.query('SELECT * FROM transactions WHERE deleted_at IS NOT NULL');
    res.json({
      users: users.rows,
      accounts: accounts.rows,
      transactions: transactions.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Database execution error' });
  }
});

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'LedgerApp API is running' });
});

// App server startup
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
