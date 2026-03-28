// services/confessionService.js
// WHY: Services layer contains pure business logic separated from HTTP concerns.
// This allows business rules to be tested independently of web frameworks,
// reused across different interfaces (API, CLI, etc.), and modified without
// affecting HTTP request/response handling. Services focus on WHAT the business
// does, not HOW it's delivered over HTTP.

// WHY: Global state (confessions array, counter) is managed here because
// services are responsible for data persistence and state management.
// This centralizes data operations and makes it easier to implement
// proper data storage (database) later without changing controllers.
var confessions = []
var confessionIdCounter = 0

// WHY: Validation is extracted to a separate function because input validation
// is a cross-cutting concern that might be needed in multiple places.
// Separating it allows for consistent validation rules and easier testing.
// Throwing errors instead of returning them keeps the validation pure and
// forces callers to handle validation failures explicitly.
function validateConfessionInput(requestBody) {
  if (!requestBody) {
    throw new Error('Bad request: no body provided');
  }
  if (!requestBody.text) {
    throw new Error('Need text: confession text is required');
  }
  if (requestBody.text.length <= 0) {
    throw new Error('Too short: confession text cannot be empty');
  }
  if (requestBody.text.length >= 500) {
    throw new Error('Text too big: must be less than 500 characters');
  }
  const validCategories = ["bug", "deadline", "imposter", "vibe-code"];
  if (!validCategories.includes(requestBody.category)) {
    throw new Error('Invalid category: must be one of bug, deadline, imposter, vibe-code');
  }
}

// WHY: Save operation is separated because persistence logic might change
// (from in-memory array to database) without affecting validation or HTTP handling.
// This function focuses solely on creating and storing the confession object,
// making it easier to test data persistence independently.
function saveConfession(requestBody) {
  const newConfession = {
    id: ++confessionIdCounter,
    text: requestBody.text,
    category: requestBody.category,
    created_at: new Date()
  };
  confessions.push(newConfession);
  console.log("added one info " + newConfession.id);
  return newConfession;
}

function formatConfessionResponse(confession) {
  return confession;
}

// WHY: Data retrieval operations are separated because they might have
// different performance requirements, caching strategies, or data sources.
// Keeping them in services allows for optimization without affecting controllers.
function getAllConfessions() {
  let sortedConfessions = confessions.sort((a, b) => b.created_at - a.created_at);
  return {
    data: sortedConfessions,
    count: sortedConfessions.length
  };
}

function getOneConfession(confessionId) {
  const confession = confessions.find(confessionItem => confessionItem.id === confessionId);
  if (!confession) {
    throw new Error('Not found: confession with this ID does not exist');
  }
  if (!confession.text) {
    throw new Error('Broken: confession data is corrupted');
  }
  console.log("found info with " + confession.text.length + " chars");
  return confession;
}

function getConfessionsByCategory(category) {
  const validCategories = ["bug", "deadline", "imposter", "vibe-code"];
  if (!validCategories.includes(category)) {
    throw new Error('Invalid category: must be one of bug, deadline, imposter, vibe-code');
  }
  let filteredConfessions = confessions.filter(function(confessionItem) {
    return confessionItem.category === category;
  }).reverse();
  return filteredConfessions;
}

function deleteConfession(confessionId) {
  const confessionIndex = confessions.findIndex(item => item.id === confessionId);
  if (confessionIndex === -1) {
    throw new Error('Not found: confession with this ID does not exist');
  }
  const deletedConfession = confessions.splice(confessionIndex, 1);
  console.log("deleted something");
  return deletedConfession[0];
}

// WHY: Module exports are explicit to clearly define the service's public API.
// Only functions that should be used by controllers are exported, hiding internal
// implementation details and global state from external consumers.
module.exports = {
  validateConfessionInput,
  saveConfession,
  formatConfessionResponse,
  getAllConfessions,
  getOneConfession,
  getConfessionsByCategory,
  deleteConfession,
  confessions,
  confessionIdCounter
};