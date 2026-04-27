import prisma from "../config/prisma.js";

export async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true
    }
  });

  return orders;
}

export async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true
    }
  });

  return order;
}