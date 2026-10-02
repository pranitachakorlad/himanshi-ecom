import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { Product } from '../models/Product.js';

try {
  await connectDb();
  const result = await Product.deleteMany({ imageUrl: /^https:\/\/res\.cloudinary\.com\/demo\// });
  console.log(`Removed demo products: ${result.deletedCount}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
