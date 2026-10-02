import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { Wishlist } from '../models/Wishlist.js';

const router = express.Router();

function cleanWishlist(wishlist) {
  const products = (wishlist?.products || [])
    .filter(product => product && product.isActive !== false)
    .map(product => ({
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl
    }));

  return { products };
}

router.get('/', requireAuth, async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
  res.json({ wishlist: cleanWishlist(wishlist) });
});

router.post('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user._id },
    { $setOnInsert: { userId: req.user._id }, $addToSet: { products: productId } },
    { upsert: true, new: true }
  ).populate('products');

  res.status(201).json({ wishlist: cleanWishlist(wishlist) });
});

router.delete('/:productId', requireAuth, async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { products: productId } },
    { new: true }
  ).populate('products');

  res.json({ wishlist: cleanWishlist(wishlist) });
});

export default router;
