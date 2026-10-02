import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');
const name = String(process.env.ADMIN_NAME || 'Pranita Admin').trim();

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  process.exit(1);
}

if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters');
  process.exit(1);
}

await connectDb();

const passwordHash = await bcrypt.hash(password, 12);
const user = await User.findOneAndUpdate(
  { email },
  { name, email, passwordHash, role: 'admin' },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

console.log(`Admin ready: ${user.email}`);
process.exit(0);
