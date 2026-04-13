const express = require('express');
const router = express.Router();
const db = require('../db');

// --------------------
// Add item to order AND decrement inventory (SAFE)
// --------------------
router.post('/', async (req, res) => {
  const { order_id, product_id, quantity, unit_price } = req.body;

  // Basic validation
  if (!order_id || !product_id || !quantity || !unit_price) {
    return res.status(400).json({
      error: 'order_id, product_id, quantity, and unit_price are required'
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      error: 'Quantity must be greater than 0'
    });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 🔍 Check current inventory first (important)
    const productResult = await client.query(
      'SELECT inventory_count FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      throw { status: 404, message: 'Product not found' };
    }

    const currentInventory = productResult.rows[0].inventory_count;

    if (currentInventory < quantity) {
      throw { status: 400, message: 'Insufficient inventory' };
    }

    // ✅ Insert order item
    const itemResult = await client.query(
      `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4)
      RETURNING id, order_id, product_id, quantity, unit_price
      `,
      [order_id, product_id, quantity, unit_price]
    );

    // ✅ Update inventory safely
    await client.query(
      `
      UPDATE products
      SET inventory_count = inventory_count - $1
      WHERE id = $2
      `,
      [quantity, product_id]
    );

    await client.query('COMMIT');

    res.status(201).json(itemResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');

    // 🔥 Handle CHECK constraint (inventory < 0)
    if (err.code === '23514') {
      return res.status(400).json({
        error: 'Inventory cannot go below zero'
      });
    }

    // 🔥 Handle FK issues
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Invalid order_id or product_id'
      });
    }

    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });

  } finally {
    client.release();
  }
});

// --------------------
// List items for an order
// --------------------
router.get('/:orderId', async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        oi.id, 
        oi.quantity, 
        oi.unit_price, 
        p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [req.params.orderId]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;