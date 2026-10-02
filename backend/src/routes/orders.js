import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function cleanOrder(order) {
  return {
    id: order._id,
    userId: order.userId,
    items: order.items.map(item => ({
      productId: item.productId,
      sellerId: item.sellerId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    createdAt: order.createdAt
  };
}

async function createRazorpayOrder(order) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keySecret.includes('paste_')) {
    throw new Error('Razorpay test keys are missing in backend/.env');
  }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: `order_${order._id}`,
      payment_capture: 1,
      notes: {
        appOrderId: String(order._id)
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description || 'Could not create Razorpay order');
  }

  return data;
}

router.get('/', requireAuth, async (req, res) => {
  const filter = {};

  if (req.user.role === 'user') {
    filter.userId = req.user._id;
  }

  if (req.user.role === 'sales') {
    filter['items.sellerId'] = req.user._id;
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ orders: orders.map(cleanOrder) });
});

router.post('/from-cart', requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    const cartItems = (cart?.items || []).filter(item => item.productId && item.productId.isActive !== false);

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cartItems.map(item => ({
      productId: item.productId._id,
      sellerId: item.productId.sellerId,
      name: item.productId.name,
      quantity: item.quantity,
      unitPrice: item.productId.price
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      paymentStatus: 'created'
    });

    const razorpayOrder = await createRazorpayOrder(order);
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      order: cleanOrder(order),
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Could not start Razorpay checkout' });
  }
});

router.post('/:id/verify-payment', requireAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  const razorpayOrderId = String(req.body.razorpay_order_id || '');
  const razorpayPaymentId = String(req.body.razorpay_payment_id || '');
  const razorpaySignature = String(req.body.razorpay_signature || '');

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const ownsOrder = order.userId.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !ownsOrder) {
    return res.status(403).json({ message: 'You do not have permission for this order' });
  }

  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
    return res.status(400).json({ message: 'Payment order mismatch' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (!razorpaySignature || expectedSignature !== razorpaySignature) {
    order.paymentStatus = 'failed';
    await order.save();
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpayPaymentId;
  await order.save();

  if (ownsOrder) {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
  }

  res.json({ order: cleanOrder(order) });
});

export default router;
