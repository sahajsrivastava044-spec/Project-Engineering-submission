const express = require('express');
const router = express.Router();
const db = require('../db');

function filterProject(project, requestUser) {
  const filtered = { ...project };
  // Budget is sensitive financial data; hide from managers and users
  if (requestUser.role !== 'admin') {
    delete filtered.budget;
  }
  return filtered;
}

// List projects across the entire system
// FIXED: Now filters by tenant_id and applies role-based access control
router.get('/', async (req, res) => {
  try {
    const { tenantId } = req.user;
    // Tenant isolation: only return projects belonging to the user's tenant
    const { rows } = await db.query('SELECT * FROM projects WHERE tenant_id = $1', [tenantId]);
    
    // Secure API Responses: filter out sensitive fields based on role
    const safeRows = rows.map(p => filterProject(p, req.user));
    res.json(safeRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find projects.' });
  }
});

// Specific project details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Tenant isolation: ensure the requested project belongs to the user's tenant
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    // Secure API Responses: filter out sensitive fields based on role
    res.json(filterProject(rows[0], req.user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve project info.' });
  }
});

module.exports = router;
