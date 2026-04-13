const express = require('express');
const router = express.Router();
const db = require('../db');

// --------------------
// List all products
// --------------------
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, sku, inventory_count, price FROM products ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Update product inventory
// --------------------
router.patch('/:id/inventory', async (req, res) => {
  const { adjustment } = req.body;

  // Basic validation
  if (adjustment === undefined || isNaN(adjustment)) {
    return res.status(400).json({ error: 'Invalid adjustment value' });
  }

  try {
    const result = await db.query(
      `
      UPDATE products
      SET inventory_count = inventory_count + $1
      WHERE id = $2
      RETURNING id, name, sku, inventory_count, price
      `,
      [adjustment, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {

    // 🔥 Handle CHECK constraint violation (important after schema fix)
    if (err.code === '23514') { // PostgreSQL CHECK violation
      return res.status(400).json({
        error: 'Inventory cannot go below zero'
      });
    }

    res.status(500).json({ error: err.message });
  }
});

module.exports = router;