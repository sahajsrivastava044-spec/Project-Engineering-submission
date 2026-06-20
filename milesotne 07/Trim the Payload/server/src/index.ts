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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.order.count();
    const totalPages = Math.ceil(total / limit);

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    const processedData = orders.map(order => {
      return {
        ...order,
        _metadata: { processedAt: new Date().toISOString() }
      };
    });

    res.json({
      data: processedData,
      meta: {
        currentPage: page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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
