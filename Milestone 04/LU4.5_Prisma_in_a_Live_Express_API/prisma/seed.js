const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: "Sahaj",
      email: "sahaj@example.com"
    }
  });

  // Create products
  const product1 = await prisma.product.create({
    data: {
      name: "Laptop",
      price: 50000,
      stock: 10
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Phone",
      price: 20000,
      stock: 5
    }
  });

  console.log("✅ Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });