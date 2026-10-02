# Backend implementation next

This folder reserves the backend structure required by the assessment. No backend is implemented in this design milestone.

Recommended next implementation: JavaScript + Node.js/Express with MongoDB or PostgreSQL. Deploy to Render; the assessment specifies Render + Vercel.

Entities: User (hashed password, role); Product (seller ID, Cloudinary image URL); Cart and CartItem (user, product, quantity); Wishlist (user, product); Order and OrderItem (buyer, seller, quantity, immutable unit price, payment reference, status).

Required API boundaries:

- POST /auth/register and /auth/login. Registration always assigns User; only admins may change roles.
- GET /products?search=&category=&maxPrice=&sort= (public)
- POST /products, PATCH /products/:id, DELETE /products/:id (Admin or owning Sales Person). Verify ownership on the server.
- POST /uploads/sign (Admin or Sales Person). Sign Cloudinary uploads using the server-only API secret. Store the returned secure URL, never the raw upload.
- GET/POST/PATCH/DELETE /cart and /wishlist scoped to the authenticated user.
- POST /payments/order recalculates totals from database prices and creates a Razorpay test order.
- POST /payments/verify verifies the Razorpay HMAC signature and payment/order linkage server-side; create an order once, transactionally, then clear the cart. Never trust browser payment success or supplied prices.
- GET /orders scoped to User's own orders, Sales Person's product lines, or all orders for Admin.
- PATCH /orders/:id/status, GET/PATCH /users/:id and GET /stats restricted to Admin.

Add input validation, secure token/session handling, CORS for the deployed frontend, rate limiting, and backend authorization tests. Never promote the frontend demo role switch into authentication.
