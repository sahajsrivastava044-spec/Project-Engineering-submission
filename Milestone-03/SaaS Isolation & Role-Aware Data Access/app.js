const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');

// JSON parsing middleware
app.use(express.json());

// Main entry route
app.get('/', (req, res) => {
  res.json({
    name: 'CorpFlow SaaS API',
    version: '1.0.0-beta',
    status: 'online',
    message: 'Welcome to the CorpFlow internal workforce management API.'
  });
});

// Mock authentication middleware
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  const userRole = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];

  if (!tenantId || !userRole || !userId) {
    return res.status(401).json({ error: 'Missing authentication headers (x-tenant-id, x-user-role, x-user-id)' });
  }

  req.user = {
    tenantId: parseInt(tenantId, 10),
    role: userRole,
    id: parseInt(userId, 10)
  };
  next();
});

// Register routers
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 CorpFlow SaaS API Running on port ${PORT}`);
  console.log('------------------------------------------');
  console.log(`Root:     http://localhost:${PORT}/`);
  console.log(`Users:    http://localhost:${PORT}/users`);
  console.log(`Projects: http://localhost:${PORT}/projects\n`);
});
