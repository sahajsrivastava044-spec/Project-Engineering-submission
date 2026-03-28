// routes/confessionRoutes.js
// WHY: Routes layer defines API endpoints and maps them to controller functions.
// This separation allows routes to focus on URL structure, HTTP methods, and
// middleware without knowing business logic. Routes can be easily modified
// (adding middleware, changing URLs) without affecting controllers or services.
// It also enables route versioning and organization.

// WHY: Express Router is used instead of defining routes directly on the app
// because it creates modular, reusable route modules. Each feature can have
// its own router, making the codebase more organized and testable.
const express = require('express');
const router = express.Router();

// WHY: Controller functions are imported here because routes are responsible
// for mapping URLs to handler functions, but not for implementing the handlers.
// This keeps routing logic separate from request processing logic.
const {
  handleCreateConfession,
  handleGetAllConfessions,
  handleGetOneConfession,
  handleGetConfessionsByCategory,
  handleDeleteConfession
} = require('../controllers/confessionController');

// WHY: Each route is defined with its HTTP method and path, clearly mapping
// API endpoints to their corresponding controller functions. This explicit
// mapping makes the API contract clear and easy to understand.
router.post('/', handleCreateConfession);

router.get('/', handleGetAllConfessions);

router.get('/:id', handleGetOneConfession);

// WHY: Category route includes parameter validation in the route definition
// because route-level validation can prevent unnecessary controller execution
// for obviously invalid requests, improving performance and reducing error handling load.
router.get('/category/:cat', (req, res) => {
  if (req.params.cat) {
    handleGetConfessionsByCategory(req, res);
  } else {
    res.status(400).json({ msg: 'category parameter required' });
  }
});

router.delete('/:id', handleDeleteConfession);

// WHY: Router is exported so it can be mounted by the main application.
// This allows the main app to decide where to mount these routes (/api/v1/confessions)
// without the routes module needing to know about the mounting path.
module.exports = router;