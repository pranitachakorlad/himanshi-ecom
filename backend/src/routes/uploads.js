import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are missing in backend/.env');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
}

router.post('/sign', requireAuth, requireRole('admin', 'sales'), (req, res) => {
  try {
    configureCloudinary();

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'pranita-ecom/products';
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      folder,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Could not sign upload' });
  }
});

export default router;
