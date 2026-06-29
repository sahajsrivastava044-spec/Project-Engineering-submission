const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const compression = require('compression');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(compression());
app.use(express.json());

// BROKEN ENDPOINT: N+1 Query, No Pagination, Over-fetching, No Compression
app.get('/api/missions', async (req, res) => {
  console.log('--- GET /api/missions called ---');
  let queryCount = 0;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await prisma.mission.count();
    const totalPages = Math.ceil(total / limit);

    // Fetch paginated missions with specific fields (trimming payload)
    const detailedMissions = await prisma.mission.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        launchDate: true,
        rocket: true,
        crew: true,
        logs: true
      }
    });
    queryCount += 2;

    console.log(`Executed ${queryCount} database queries for this request.`);
    
    res.json({
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      currentPage: page,
      data: detailedMissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
