import express from 'express';
import cors from 'cors';
import { prisma } from './prisma.config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// BROKEN ENDPOINT: Multiple performance killers
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // PROBLEM 3: Blocking Event Loop (Sync processing of a large array)
    // Simulating heavy data transformation that freezes the server
    const processedData = orders.map(order => {
      const start = Date.now();
      while (Date.now() - start < 1) { /* Artificial 1ms block per order */ }
      return {
        ...order,
        _metadata: { processedAt: new Date().toISOString() }
      };
    });

    res.json(processedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'broken' });
});

app.listen(PORT, () => {
  console.log(`Broken Server running at http://localhost:${PORT}`);
});
