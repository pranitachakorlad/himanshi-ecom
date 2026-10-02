# Pranita E-Commerce

Full-stack e-commerce project built for the Full Stack Intern Technical Assessment.

## Live Links

- Frontend: https://himanshi-ecom-frontend.vercel.app/
- Backend: https://himanshi-ecom.onrender.com
- GitHub Repository: https://github.com/pranitachakorlad/himanshi-ecom

## Demo Login Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@pranita.local | Admin12345 |
| Sales Person | sales.demo@pranita.local | Sales12345 |
| User | user@pranita.local | User12345 |

## Role Access

### User

- Browse products
- Search and filter products
- Add products to wishlist
- Add products to bag
- Buy products using Razorpay test checkout
- View order history

### Sales Person

- Login from the same login form
- Add product with Cloudinary image upload
- Manage only their own products
- View orders related to their products

### Admin

- Login from the same login form
- Create sales person accounts
- View users and sales persons
- Manage all seller products
- View all orders

## Payment Testing

Use Razorpay test mode.

| Field | Value |
| --- | --- |
| Card Number | 4718 6091 0820 4366 |
| Expiry | Any future date, for example 12/30 |
| CVV | Any 3 digits, for example 123 |
| OTP | 1234 |

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT and bcrypt password hashing
- Image Upload: Cloudinary signed upload
- Payment Gateway: Razorpay test integration
- Frontend Deployment: Vercel
- Backend Deployment: Render

## Main Features

- Dark themed responsive shopping UI
- Product listing with search, category filter, price filter and sorting
- Wishlist and bag/cart
- Role based login system
- User, Admin and Sales Person panels
- Sales person product ownership rules
- Admin can manage users, sales persons, products and orders
- Cloudinary product image upload
- Razorpay test payment flow
- MongoDB backed products, users, wishlist, cart and orders

## Local Setup

### Backend

```bash
cd backend
pnpm install
pnpm start
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
python -m http.server 5173
```

Frontend runs on:

```text
http://localhost:5173
```

For local testing, update `frontend/config.js`:

```js
apiBaseUrl: 'http://localhost:5000'
```

For deployed testing, it is set to:

```js
apiBaseUrl: 'https://himanshi-ecom.onrender.com'
```

## Environment Variables

Backend environment variables are configured on Render.

Required keys:

```env
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Note: Secret values are not committed to GitHub.

## Deployment

### Backend

Hosted on Render.

- Root Directory: `backend`
- Build Command: `pnpm install --frozen-lockfile`
- Start Command: `pnpm start`

### Frontend

Hosted on Vercel.

- Root Directory: `frontend`
- Framework: Other
- Build Command: empty
- Output Directory: `.`

## Testing Flow

1. Open the frontend live link.
2. Login as Sales Person.
3. Add a product with image upload.
4. Logout and login as User.
5. Add product to wishlist.
6. Add product to bag.
7. Click Buy Now and complete Razorpay test payment.
8. Login as Admin and verify users, sales persons, products and orders.

## Notes

- Render free backend may sleep after inactivity, so the first request can take 30-60 seconds.
- The project uses test credentials and Razorpay test mode only.
- Product images are uploaded through Cloudinary from the Sales Person or Admin product form.
