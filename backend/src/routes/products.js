import express from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Product } from '../models/Product.js';

const router = express.Router();

function cleanProduct(product) {
  return {
    id: product._id,
    name: product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
    sellerId: product.sellerId,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

function productPayload(body) {
  return {
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    price: Number(body.price),
    imageUrl: String(body.imageUrl || '').trim()
  };
}

function validatePayload(payload, partial = false) {
  const errors = [];

  if (!partial || payload.name !== '') {
    if (!payload.name || payload.name.length > 100) errors.push('Product name is required');
  }

  if (!partial || payload.category !== '') {
    if (!payload.category || payload.category.length > 60) errors.push('Category is required');
  }

  if (!partial || !Number.isNaN(payload.price)) {
    if (!Number.isFinite(payload.price) || payload.price < 1) errors.push('Price must be at least 1');
  }

  if (!partial || payload.imageUrl !== '') {
    if (!payload.imageUrl || !payload.imageUrl.startsWith('https://')) {
      errors.push('A secure image URL is required');
    }
  }

  return errors;
}

router.get('/', async (req, res) => {
  const query = { isActive: true };
  const search = String(req.query.search || '').trim();
  const category = String(req.query.category || '').trim();
  const maxPrice = Number(req.query.maxPrice);

  if (category && category !== 'All') query.category = category;
  if (Number.isFinite(maxPrice) && maxPrice > 0) query.price = { $lte: maxPrice };
  if (search) query.$text = { $search: search };

  const sort = String(req.query.sort || 'featured');
  const sortMap = {
    low: { price: 1 },
    high: { price: -1 },
    name: { name: 1 },
    featured: { createdAt: -1 }
  };

  const products = await Product.find(query).sort(sortMap[sort] || sortMap.featured);
  res.json({ products: products.map(cleanProduct) });
});

router.post('/', requireAuth, requireRole('admin', 'sales'), async (req, res) => {
  const payload = productPayload(req.body);
  const errors = validatePayload(payload);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const product = await Product.create({
    ...payload,
    sellerId: req.user._id
  });

  res.status(201).json({ product: cleanProduct(product) });
});

router.patch('/:id', requireAuth, requireRole('admin', 'sales'), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (req.user.role === 'sales' && product.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Sales person can update only their own products' });
  }

  const payload = productPayload({ ...product.toObject(), ...req.body });
  const errors = validatePayload(payload, true);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  product.name = payload.name;
  product.category = payload.category;
  product.price = payload.price;
  product.imageUrl = payload.imageUrl;
  await product.save();

  res.json({ product: cleanProduct(product) });
});

router.delete('/:id', requireAuth, requireRole('admin', 'sales'), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (req.user.role === 'sales' && product.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Sales person can delete only their own products' });
  }

  product.isActive = false;
  await product.save();

  res.json({ message: 'Product deleted' });
});

export default router;
