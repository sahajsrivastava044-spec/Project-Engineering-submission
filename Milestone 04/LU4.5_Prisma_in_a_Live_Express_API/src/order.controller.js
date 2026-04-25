const prisma = require('./utils/prisma');

async function purchaseItem(req, res) {
  try {
    const { userId, productId } = req.body;

    // Convert to numbers
    const parsedUserId = Number(userId);
    const parsedProductId = Number(productId);

    // ✅ Null safety
    const product = await prisma.product.findUnique({
      where: { id: parsedProductId }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Stock check
    if (product.stock <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }

    // ✅ Transaction (VERY IMPORTANT)
    const result = await prisma.$transaction(async (tx) => {

      const order = await tx.order.create({
        data: {
          userId: parsedUserId,
          productId: parsedProductId,
          quantity: 1
        }
      });

      await tx.product.update({
        where: { id: parsedProductId },
        data: {
          stock: {
            decrement: 1
          }
        }
      });

      return order;
    });

    res.status(201).json({ order: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrdersByUser(req, res) {
  try {
    const userId = Number(req.params.userId);

    const orders = await prisma.order.findMany({
      where: { userId }
    });

    // Optional but good practice
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { purchaseItem, getOrdersByUser };