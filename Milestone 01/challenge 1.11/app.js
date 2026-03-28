// Main application entry point - kept minimal to maintain single responsibility
// WHY: The main app.js should only handle application setup and routing delegation,
// not business logic. This allows for easier testing, configuration management,
// and keeps the entry point clean and focused on Express setup only.
const express = require('express')
require('dotenv').config();
var app = express()
app.use(express.json())

// WHY: Routes are imported separately to maintain separation of concerns.
// The main app doesn't need to know about specific route implementations,
// only that routes exist and should be mounted at specific paths.
const confessionRoutes = require('./routes/confessionRoutes')

// WHY: Using API versioning (/api/v1/) allows for future API evolution
// without breaking existing clients. Routes are mounted here to keep
// the main app aware of high-level structure while delegating details.
app.use('/api/v1/confessions', confessionRoutes)

// WHY: Health check endpoint provides a simple way to verify application
// status without depending on complex business logic. This is essential
// for container orchestration, load balancers, and monitoring systems.
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// WHY: Server listens on configurable PORT from environment variables
// to support different deployment environments (dev, staging, prod)
// without code changes. This enables proper containerization and cloud deployment.
app.listen(process.env.PORT, function() {
  var serverStartMessage = 'running on 3000'
  console.log(serverStartMessage)
})

// Optional: Monitor confessions count
const { confessions } = require('./services/confessionService')
if (confessions.length > 500) {
  console.log("too many")
}
app.listen(process.env.PORT, function() {
  var serverStartMessage = 'running on 3000'
  console.log(serverStartMessage)
})
if (confessions.length > 500) {
  console.log("too many")
}
