const prisma = require('./utils/prisma');

async function getProducts(req, res) {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id }
    });

    // ✅ Null safety (VERY IMPORTANT)
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      name: product.name,
      price: product.price
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProducts, getProductById };