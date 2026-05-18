const express = require('express');
const router = express.Router();
const db = require('../db');

// Utility to filter sensitive user fields based on role
function filterUser(user, requestUser) {
  const filtered = { ...user };
  delete filtered.password_hash; // NEVER expose password hash
  
  // Salary is visible only to admin or the user themselves
  if (requestUser.role !== 'admin' && requestUser.id !== user.id) {
    delete filtered.salary;
  }
  return filtered;
}

// List all users for the workforce manager
router.get('/', async (req, res) => {
  try {
    const { tenantId, role } = req.user;
    
    // Users can only see their own profile, they shouldn't list all users
    if (role === 'user') {
       return res.status(403).json({ error: 'Access denied. Users cannot list all tenant users.' });
    }

    // Tenant isolation: Only select users in the same tenant
    const { rows } = await db.query('SELECT * FROM users WHERE tenant_id = $1', [tenantId]);
    
    // Secure API Responses: filter fields based on the requesting user
    const safeRows = rows.map(u => filterUser(u, req.user));
    res.json(safeRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Single user profile view
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, role, id: requestUserId } = req.user;
    
    // Users can only view their own profile
    if (role === 'user' && parseInt(id, 10) !== requestUserId) {
        return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
    }

    // Tenant isolation: Ensure the requested user belongs to the same tenant
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Secure API Responses: filter fields based on the requesting user
    res.json(filterUser(rows[0], req.user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find user.' });
  }
});

module.exports = router;
