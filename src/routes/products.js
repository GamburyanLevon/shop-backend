const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const requireAdmin = require('../middleware/admin');

// Public: list products
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

// Public: get product
router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// Admin: create product
router.post('/', requireAdmin, async (req, res) => {
  const { title, description, price, image } = req.body;
  const p = await prisma.product.create({ data: { title, description, price: Number(price), image } });
  res.json(p);
});

// Admin: update product
router.put('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, price, image } = req.body;
  const updated = await prisma.product.update({
    where: { id },
    data: { title, description, price: Number(price), image }
  });
  res.json(updated);
});

// Admin: delete product
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ success: true });
});

module.exports = router;