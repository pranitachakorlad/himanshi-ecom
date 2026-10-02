import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const image = (id) => `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_700/${id}`;

const products = [
  {
    name: 'The Everyday Carry',
    category: 'Accessories',
    price: 2490,
    imageUrl: image('samples/ecommerce/accessories-bag')
  },
  {
    name: 'The Weekend Sneaker',
    category: 'Lifestyle',
    price: 3290,
    imageUrl: image('samples/ecommerce/shoes')
  },
  {
    name: 'The Classic Watch',
    category: 'Accessories',
    price: 4990,
    imageUrl: image('samples/ecommerce/analog-classic')
  },
  {
    name: 'The Leather Companion',
    category: 'Accessories',
    price: 5490,
    imageUrl: image('samples/ecommerce/leather-bag-gray')
  },
  {
    name: 'The Coffee Ritual',
    category: 'Home & Living',
    price: 890,
    imageUrl: image('coffee')
  },
  {
    name: 'The Pantry Edit',
    category: 'Home & Living',
    price: 1290,
    imageUrl: image('samples/food/spices')
  },
  {
    name: 'The City Bicycle',
    category: 'Lifestyle',
    price: 9990,
    imageUrl: image('samples/bike')
  },
  {
    name: 'A Moment in Bloom',
    category: 'Home & Living',
    price: 1490,
    imageUrl: image('sample')
  }
];

try {
  await connectDb();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('Create the admin user first with: pnpm run seed:admin');
  }

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const result = await Product.updateOne(
      { name: product.name },
      { $set: { ...product, sellerId: admin._id, isActive: true } },
      { upsert: true }
    );

    if (result.upsertedCount) created += 1;
    else updated += result.modifiedCount ? 1 : 0;
  }

  console.log(`Seeded products. Created: ${created}, Updated: ${updated}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
