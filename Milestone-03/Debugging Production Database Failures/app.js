const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Import routes
const customersRoutes = require('./routes/customers');
const ordersRoutes = require('./routes/orders');
const orderItemsRoutes = require('./routes/order_items');
const paymentsRoutes = require('./routes/payments');
const productsRoutes = require('./routes/products');

// --------------------
// Middleware
// --------------------
app.use(express.json()); // Built-in body parser (no need for body-parser)
app.use(express.static('public'));

// --------------------
// Root Route
// --------------------
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to OrderFlow API!',
    routes: [
      '/customers',
      '/orders',
      '/order_items',
      '/payments',
      '/products'
    ],
    version: '1.0.0',
    status: 'Running'
  });
});

// --------------------
// Register Routes
// --------------------
app.use('/customers', customersRoutes);
app.use('/orders', ordersRoutes);
app.use('/order_items', orderItemsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/products', productsRoutes);

// --------------------
// 404 Handler (Important)
// --------------------
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// --------------------
// Start Server
// --------------------
app.listen(port, () => {
  console.log(`🚀 OrderFlow API running at http://localhost:${port}`);
});

module.exports = app;