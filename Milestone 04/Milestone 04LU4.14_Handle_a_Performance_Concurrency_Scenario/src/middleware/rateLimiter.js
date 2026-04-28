const rateLimit = require("express-rate-limit");

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many booking attempts. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = bookingLimiter;