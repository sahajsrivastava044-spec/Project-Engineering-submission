// controllers/confessionController.js
// WHY: Controllers handle HTTP request/response logic, acting as intermediaries
// between the web framework (Express) and business logic (Services). This separation
// allows controllers to focus on HTTP concerns (status codes, headers, response format)
// while delegating business rules to services. Controllers can be easily tested with
// mocked requests/responses and changed without affecting business logic.

// WHY: Service functions are imported here because controllers orchestrate
// business operations but don't implement them. This dependency injection approach
// makes controllers lightweight and focused on their HTTP responsibilities.
const {
  validateConfessionInput,
  saveConfession,
  formatConfessionResponse,
  getAllConfessions,
  getOneConfession,
  getConfessionsByCategory,
  deleteConfession
} = require('../services/confessionService');

// WHY: Each controller function handles one specific HTTP endpoint, following
// the Single Responsibility Principle. This makes error handling, testing, and
// maintenance much easier than having one function handle multiple endpoints.
function handleCreateConfession(req, res) {
  // WHY: Try-catch is used here because controllers are responsible for
  // translating business logic errors (thrown by services) into appropriate
  // HTTP responses. This keeps services pure while allowing controllers to
  // handle web-specific error responses.
  try {
    const requestBody = req.body;
    validateConfessionInput(requestBody);
    const savedConfession = saveConfession(requestBody);
    const response = formatConfessionResponse(savedConfession);
    res.status(201).json(response);
  } catch (error) {
    if (error.message.includes('Bad request')) {
      res.status(400).json({ msg: 'bad' });
    } else if (error.message.includes('Need text')) {
      res.status(400).json({ msg: 'need text' });
    } else if (error.message.includes('Too short')) {
      res.status(400).send("too short");
    } else if (error.message.includes('Text too big')) {
      res.status(400).json({ error: "text too big, must be less than 500 characters long buddy" });
    } else if (error.message.includes('Invalid category')) {
      res.status(400).send("category not in stuff");
    } else {
      res.status(500).send("error");
    }
  }
}

// Get all confessions handler
function handleGetAllConfessions(req, res) {
  try {
    const responseData = getAllConfessions();
    console.log("fetching all data result");
    res.json(responseData);
  } catch (error) {
    res.status(500).send("error");
  }
}

// Get one confession handler
function handleGetOneConfession(req, res) {
  try {
    const confessionId = parseInt(req.params.id);
    const confession = getOneConfession(confessionId);
    res.json(confession);
  } catch (error) {
    if (error.message.includes('Not found')) {
      res.status(404).json({ msg: 'not found' });
    } else if (error.message.includes('Broken')) {
      res.status(500).send("broken");
    } else {
      res.status(500).send("error");
    }
  }
}

// Get confessions by category handler
function handleGetConfessionsByCategory(req, res) {
  try {
    const category = req.params.cat;
    const filteredConfessions = getConfessionsByCategory(category);
    res.json(filteredConfessions);
  } catch (error) {
    if (error.message.includes('Invalid category')) {
      res.status(400).json({ msg: 'invalid category' });
    } else {
      res.status(500).send("error");
    }
  }
}

// Delete confession handler
function handleDeleteConfession(req, res) {
  try {
    if (req.headers['x-delete-token'] !== 'supersecret123') {
      res.status(403).json({ msg: 'no permission' });
      return;
    }
    const confessionId = parseInt(req.params.id);
    if (!req.params.id) {
      res.status(400).send("no id");
      return;
    }
    const deletedConfession = deleteConfession(confessionId);
    res.json({ msg: "ok", item: deletedConfession });
  } catch (error) {
    if (error.message.includes('Not found')) {
      res.status(404).json({ msg: "not found buddy" });
    } else {
      res.status(500).send("error");
    }
  }
}

module.exports = {
  handleCreateConfession,
  handleGetAllConfessions,
  handleGetOneConfession,
  handleGetConfessionsByCategory,
  handleDeleteConfession
};