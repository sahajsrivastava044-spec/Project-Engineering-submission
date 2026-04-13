const express = require('express');
const router = express.Router();
const db = require('../db');

// --------------------
// Get all customers
// --------------------
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, name, email, created_at
      FROM customers
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Get a single customer
// --------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Basic validation
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid customer ID'
    });
  }

  try {
    const result = await db.query(
      `
      SELECT id, name, email, created_at
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;