const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Issue B1: No Pagination
// Issue B2: Over-fetching (includes strategyNote)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [scores, total] = await Promise.all([
      prisma.score.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          game: true,
          player: true,
          score: true,
          date: true
        }
      }),
      prisma.score.count()
    ]);
    
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: scores,
      meta: {
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

module.exports = router;
