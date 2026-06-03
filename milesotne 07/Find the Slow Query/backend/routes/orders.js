const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// SLOW ENDPOINT 2 — N+1 query pattern (Explicit loop, no include/join)
// Recent Orders with User info
router.get('/recent', async (req, res) => {
  try {
    const ordersWithUsers=await prisma.order.findMany({
      take:20,
      orderBy:{createdAt:'desc'},
      include:{
        user:{
          select:{
            name:true,
            email:true
          }
        }
      }
    });

    res.json({
      success:true,
      data:ordersWithUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
