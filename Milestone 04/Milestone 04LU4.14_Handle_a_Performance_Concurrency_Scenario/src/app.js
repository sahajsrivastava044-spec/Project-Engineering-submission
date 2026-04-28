require('dotenv').config();
const express = require("express");
const bookingsRouter = require("./routes/bookings");

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/bookings", bookingsRouter);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

app.listen(process.env.PORT,()=>{
    console.log(`server is running on http://localhost:${process.env.PORT}`)
})