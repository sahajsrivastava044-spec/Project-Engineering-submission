require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Row Counts ---');
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();
  const activityCount = await prisma.activity.count();
  
  console.log(`Products: ${productsCount}`);
  console.log(`Orders: ${ordersCount}`);
  console.log(`Users: ${usersCount}`);
  console.log(`Activity: ${activityCount}`);

  if (productsCount === 0) {
    console.log('\nWARNING: Database is empty. Please run `npx prisma db seed`.');
    return;
  }

  console.log('\n--- Endpoint 1: Products by Category ---');
  const q1 = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT "id", "name", "category", "price", "description", "imageUrl", "metadata", "createdAt", "updatedAt" FROM "public"."Product" WHERE "category" = 'electronics' ORDER BY "createdAt" DESC`);
  console.log(q1.map(row => row['QUERY PLAN']).join('\n'));

  console.log('\n--- Endpoint 2: Recent Orders ---');
  const q2 = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT "id", "userId", "total", "status", "createdAt" FROM "public"."Order" ORDER BY "createdAt" DESC LIMIT 20 OFFSET 0`);
  console.log(q2.map(row => row['QUERY PLAN']).join('\n'));
  
  console.log('\n--- Endpoint 3: User Activity ---');
  // Need a real user ID
  const user = await prisma.user.findFirst();
  if (user) {
    const q3 = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT "id", "userId", "type", "data", "metadata", "notes", "createdAt" FROM "public"."Activity" WHERE "userId" = '${user.id}' ORDER BY "createdAt" DESC`);
    console.log(q3.map(row => row['QUERY PLAN']).join('\n'));
  }

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
