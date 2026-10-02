import mongoose from 'mongoose';

export async function connectDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Add your MongoDB Atlas connection string to backend/.env');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.DATABASE_URL, {
    serverSelectionTimeoutMS: 10000
  });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
