# FORME — JavaScript e-commerce design

A responsive design milestone for the provided Full Stack Internship assessment. Plain HTML, CSS and JavaScript; no build step or dependency installation. The frontend can be hosted separately on Vercel or Netlify.

## Run locally

From `frontend`, start any static server, for example `python -m http.server 5173`, then open http://localhost:5173. You can also open index.html directly for a quick preview.

## Implemented

- Responsive storefront, category/search/price filters, sorting and empty states.
- Wishlist, cart quantities, removal and totals persisted in browser localStorage.
- User, Sales Person and Admin dashboard previews through the account button.
- Local product creation/edit/delete preview, seller-specific product views.
- Direct Cloudinary Upload Widget integration: selected files upload to Cloudinary, only returned HTTPS Cloudinary image URLs are saved.
- Vercel and Netlify static deployment configuration; separate frontend/backend structure and environment example.

## Cloudinary setup

Edit `frontend/config.js` with your cloud name and a restricted unsigned image upload preset. The widget accepts one local JPG/PNG/WebP image up to 5 MB. Configure size/type restrictions in Cloudinary too; browser checks alone do not enforce them. No Cloudinary API secret belongs in the frontend.

The initial images are assets delivered from Cloudinary's public demo cloud, not uploads into your own account. They are temporary layout samples. Upload your own matching product images before submission. Unsigned upload is for this prototype; for the assessed app add a backend signature endpoint and use signed uploads.

Documentation: https://cloudinary.com/documentation/upload_widget

## Deploy design on Vercel (assessment target)

Push the project to a GitHub repository. Import it in Vercel, set Root Directory to `frontend`, choose framework `Other`, disable/leave empty the build command, and use the root (`.`) as output directory. Deploy the static files. No private environment variables are required for this design.

For Netlify, select `frontend` as the base directory, leave the build command empty and use `.` as the publish directory. This is an alternative for preview; the assessment explicitly requests Vercel.

## What is still required for the full assessment

This is a design prototype, not the complete assessed full-stack platform. No real login, password hashing, server permission enforcement, database, order history, sales stats or Razorpay payments are implemented. Role previews and localStorage are not secure or shared between users. Cart contents are preserved at the checkout boundary.

1. Implement the JavaScript backend and database described in `backend/README.md`.
2. Connect frontend API calls, real authentication, signed Cloudinary uploads and protected dashboards.
3. Add Razorpay test order creation and server signature verification; record verified orders and clear cart.
4. Commit milestones going forward, make a feature branch and merge a real PR. Existing milestone history is not fabricated.
5. Deploy backend on Render and frontend on Vercel, configure backend secrets and CORS, then test every role and checkout end to end.
6. Add actual test account credentials, 2–3 screenshots, repository link and deployment links to the final README.

No accounts were created, external uploads made, payments processed or hosting published during this design milestone.
