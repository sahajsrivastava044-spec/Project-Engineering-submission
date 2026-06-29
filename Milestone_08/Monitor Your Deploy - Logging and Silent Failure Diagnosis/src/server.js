import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Note: No morgan middleware here.
const morganFormat =
 process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
 
app.use(morgan(morganFormat))
app.use('/api/products', productRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockapi')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error:', err.message)
    // Errors swallowed silently in catch blocks (anti-pattern)
    // console.error is omitted intentionally for the challenge
  });
