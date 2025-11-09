const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authMiddleware = require('./middleware/auth');
const requireAdmin = require('./middleware/admin');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Public (no token required)
app.use('/api/auth', authRoutes);

// Private (token required)
app.use(authMiddleware);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/admin/summary', requireAdmin, async (req, res) => {
  const prisma = require('./prismaClient');
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();
  res.json({ productsCount, ordersCount, usersCount });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
