import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/uploads.js';
import userRoutes from './routes/users.js';
import wishlistRoutes from './routes/wishlist.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/uploads', uploadRoutes);
app.use('/users', userRoutes);
app.use('/wishlist', wishlistRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'pranita-ecom-backend' });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Pranita e-commerce backend is running',
    database: 'MongoDB Atlas'
  });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Backend failed to start');
    console.error(error.message);
    process.exit(1);
  });
