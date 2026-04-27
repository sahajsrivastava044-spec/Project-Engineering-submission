import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL in .env. Add your Neon or local PostgreSQL connection string.');
}

const prisma = new PrismaClient({
  log: ['query'], // keep this for your assignment proof
});

export default prisma;