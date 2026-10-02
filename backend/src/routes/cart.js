import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

const router = express.Router();

async function getCart(userId) {
  return Cart.findOne({ userId }).populate('items.productId');
}

function cleanCart(cart) {
  const items = (cart?.items || [])
    .filter(item => item.productId && item.productId.isActive !== false)
    .map(item => ({
      product: {
        id: item.productId._id,
        name: item.productId.name,
        category: item.productId.category,
        price: item.productId.price,
        imageUrl: item.productId.imageUrl
      },
      quantity: item.quantity
    }));

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { items, total };
}

router.get('/', requireAuth, async (req, res) => {
  const cart = await getCart(req.user._id);
  res.json({ cart: cleanCart(cart) });
});

router.post('/', requireAuth, async (req, res) => {
  const productId = String(req.body.productId || '');
  const quantity = Math.max(1, Number(req.body.quantity || 1));

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $setOnInsert: { userId: req.user._id } },
    { upsert: true, new: true }
  );

  const existing = cart.items.find(item => item.productId.toString() === productId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ productId, quantity });
  await cart.save();

  const updated = await getCart(req.user._id);
  res.status(201).json({ cart: cleanCart(updated) });
});

router.patch('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;
  const quantity = Number(req.body.quantity);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(item => item.productId.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Cart item not found' });

  if (!Number.isFinite(quantity) || quantity < 1) {
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const updated = await getCart(req.user._id);
  res.json({ cart: cleanCart(updated) });
});

router.delete('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (cart) {
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
  }

  const updated = await getCart(req.user._id);
  res.json({ cart: cleanCart(updated) });
});

router.delete('/', requireAuth, async (req, res) => {
  await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] }, { upsert: true });
  res.json({ cart: { items: [], total: 0 } });
});

export default router;
