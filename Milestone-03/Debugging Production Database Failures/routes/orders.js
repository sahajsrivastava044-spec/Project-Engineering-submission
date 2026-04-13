const express = require('express');
const router = express.Router();
const db = require('../db');

// --------------------
// List all orders with customer names
// --------------------
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id, 
        o.status, 
        o.total, 
        o.created_at, 
        c.name AS customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Create new order
// --------------------
router.post('/', async (req, res) => {
  const { customer_id, total } = req.body;

  // Basic validation
  if (!customer_id || total === undefined) {
    return res.status(400).json({
      error: 'customer_id and total are required'
    });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO orders (customer_id, total, status)
      VALUES ($1, $2, $3)
      RETURNING id, customer_id, total, status, created_at
      `,
      [customer_id, total, 'pending']
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    // 🔥 Handle FK constraint (Bug 1 fix)
    if (err.code === '23503') { // PostgreSQL foreign key violation
      return res.status(400).json({
        error: 'Invalid customer_id (customer does not exist)'
      });
    }

    res.status(500).json({ error: err.message });
  }
});

module.exports = router;