const express = require('express');
const router = express.Router();
const db = require('../db');

// --------------------
// Add payment to an order
// --------------------
router.post('/', async (req, res) => {
  const { order_id, amount, status } = req.body;

  // Basic validation
  if (!order_id || !amount) {
    return res.status(400).json({
      error: 'order_id and amount are required'
    });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO payments (order_id, amount, status)
      VALUES ($1, $2, $3)
      RETURNING id, order_id, amount, status, created_at
      `,
      [order_id, amount, status || 'pending']
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    // 🔥 Handle UNIQUE constraint (Bug 3 fix)
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        error: 'Payment already exists for this order'
      });
    }

    // 🔥 Handle FK constraint (extra safety)
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Invalid order_id (order does not exist)'
      });
    }

    res.status(500).json({ error: err.message });
  }
});

// --------------------
// View payment for an order
// --------------------
router.get('/:orderId', async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, order_id, amount, status, created_at
      FROM payments
      WHERE order_id = $1
      `,
      [req.params.orderId]
    );

    // Since UNIQUE constraint exists, only one row should exist
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No payment found for this order'
      });
    }

    // Return single object instead of array (cleaner API)
    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;