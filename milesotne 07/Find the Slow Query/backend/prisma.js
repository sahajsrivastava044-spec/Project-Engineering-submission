const { PrismaClient } = require('@prisma/client');

// Prisma Client instantiation - NO query logging here for students
// (They must add { log: ['query', 'info', 'warn', 'error'] } themselves)
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
})

prisma.$on('query', (e) => {
  console.log('--- PRISMA QUERY ---')
  console.log('Query:', e.query)
  console.log('Params:', e.params)
  console.log('Duration:', e.duration + 'ms')
  console.log('---')
})

module.exports = prisma;
