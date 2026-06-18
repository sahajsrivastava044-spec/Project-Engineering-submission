require('dotenv').config();
// src/config/db.js
// Prisma client configuration

const { PrismaClient } = require("@prisma/client");

// ============================================================
// BUG: The database URL is HARDCODED below instead of reading
// from process.env.DATABASE_URL. This works on your local
// machine but will FAIL on Render (or any production host)
// because "localhost:5432" doesn't exist there.
// ============================================================

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = prisma;
