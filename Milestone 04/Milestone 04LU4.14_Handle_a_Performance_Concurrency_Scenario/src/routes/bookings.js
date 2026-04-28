const express = require('express');
const router  = express.Router();

const bookingService = require('../services/bookings');
const bookingLimiter = require('../middleware/rateLimiter');

// POST /api/bookings/book
router.post('/book', bookingLimiter, async (req, res, next) => {
  try {
    const { userId, seatId, showId } = req.body;

    // ✅ Request validation (allowed in routes)
    if (!userId || !seatId || !showId) {
      return res.status(400).json({
        success: false,
        message: 'userId, seatId, and showId are required'
      });
    }

    // ✅ Call service (no DB logic here)
    const result = await bookingService.createBooking({
      userId: Number(userId),
      seatId: Number(seatId),
      showId: Number(showId)
    });

    // ✅ Handle service response
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;