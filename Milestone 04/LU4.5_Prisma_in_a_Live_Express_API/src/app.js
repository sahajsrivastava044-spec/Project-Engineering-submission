const express = require('express');
const { getProducts, getProductById } = require('./product.controller');
const { purchaseItem, getOrdersByUser } = require('./order.controller');

const app = express();
app.use(express.json());

// Routes
app.get('/products', getProducts);
app.get('/products/:id', getProductById);
app.post('/orders/purchase', purchaseItem);
app.get('/orders/:userId', getOrdersByUser);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));