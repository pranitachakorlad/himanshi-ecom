import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users: users.map(publicUser) });
});

router.post('/sales', requireAuth, requireRole('admin'), async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'sales'
  });

  res.status(201).json({ user: publicUser(user) });
});

router.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const role = String(req.body.role || '').trim();
  if (!['user', 'sales', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be user, sales, or admin' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-passwordHash');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user: publicUser(user) });
});

export default router;
