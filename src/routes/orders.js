const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { sendOrderEmail } = require('../utils/mailer');

// Create an order. If user is logged in, attach userId.
router.post('/', async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    // items: [{ productId, quantity, price }]
    const userId = req.user ? req.user.id : undefined;
    const order = await prisma.order.create({
      data: {
        userId,
        total: Number(total),
        items: { create: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity), price: Number(i.price) })) }
      },
      include: { items: { include: { product: true } } }
    });
    // send email to admin (if configured)
    try {
      await sendOrderEmail(order, order.items);
    } catch (e) {
      console.error('Failed to send email', e);
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List orders (for admin or for debugging). You can protect this route with requireAdmin if you prefer.
router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

module.exports = router;