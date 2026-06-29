import express from 'express';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Fix: CORS now allows the deployed frontend URL using an environment variable
// (Ensure you add FRONTEND_URL in Render environment variables)
const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/health', healthRoutes);
app.use('/api/items', itemRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});