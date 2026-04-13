const express = require('express');
const router = express.Router();
const db = require('../db');
function filterUser(user, role, currentUserId) {
  if (role === "ADMIN") return user;

  if (role === "MANAGER") {
    const { salary, ssn, ...rest } = user;
    return rest;
  }

  if (role === "USER") {
    // user can only see themselves
    if (user.id !== currentUserId) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
}
// List all users for the workforce manager
router.get('/', async (req, res) => {
  try {
    // Deliberately selects all fields, exposing sensitive data
    const { rows } = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Single user profile view
// router.get('/', async (req, res) => {
//   try {
//     const { rows } = await db.query(
//       'SELECT * FROM users WHERE tenant_id = $1',
//       [req.user.tenant_id]
//     );

//     const safeUsers = rows
//       .map(user => filterUser(user, req.user.role, req.user.id))
//       .filter(Boolean);

//     res.json(safeUsers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to retrieve users.' });
//   }
// });

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'SELECT * FROM users WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const safeUser = filterUser(rows[0], req.user.role, req.user.id);

    if (!safeUser) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find user.' });
  }
});

module.exports = router;
