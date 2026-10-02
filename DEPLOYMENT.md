# Deployment Guide

## 1. Push Project to GitHub

Create a new GitHub repository and upload this whole `ecom` folder.
Do not upload `backend/.env`.

## 2. Deploy Backend on Render

Render settings:

- Service type: Web Service
- Root Directory: `backend`
- Runtime: Node
- Build Command: `corepack enable && pnpm install --frozen-lockfile`
- Start Command: `pnpm start`
- Plan: Free

Environment variables for Render:

```env
PORT=10000
DATABASE_URL=your_mongodb_atlas_connection_string
JWT_SECRET=make_a_long_random_secret
FRONTEND_URL=https://your-vercel-url.vercel.app
CLOUDINARY_CLOUD_NAME=foeisnv1
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

After deploy, copy the Render backend URL. It will look like:

```text
https://pranita-ecom-backend.onrender.com
```

## 3. Update Frontend Backend URL

Open:

```text
frontend/config.js
```

Change:

```js
apiBaseUrl: 'http://localhost:5000'
```

to your Render backend URL:

```js
apiBaseUrl: 'https://your-render-backend-url.onrender.com'
```

## 4. Deploy Frontend on Vercel

Vercel settings:

- Framework Preset: Other
- Root Directory: `frontend`
- Build Command: leave empty
- Output Directory: `.`

After Vercel deploys, copy your frontend URL and update Render's `FRONTEND_URL` environment variable with it.
Then redeploy/restart backend on Render.

## 5. Final Test

Test these after both deployments:

- Admin login
- Add Sales Person
- Sales Person add product using Cloudinary
- User login
- Wishlist
- Add to bag
- Card Buy now
- Razorpay test payment
- Orders in panel

Razorpay domestic test card:

```text
4718 6091 0820 4366
Any future expiry
Any 3 digit CVV
OTP: 1234
```
