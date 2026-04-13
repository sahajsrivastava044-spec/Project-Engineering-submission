const express = require('express');
const router = express.Router();
const db = require('../db');

// List projects across the entire system
// Problem: No tenant isolation, no project access control
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM projects WHERE tenant_id = $1',
      [req.user.tenant_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find projects.' });
  }
});

// Specific project details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'SELECT * FROM projects WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve project info.' });
  }
});

module.exports = router;
