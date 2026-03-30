# ServeDoor - Product Requirements Document

Updated on: 2026-03-30

## Product Goal
Build a production-ready food delivery platform with:

1. Customer app (Swiggy-like browsing, cart, checkout, tracking)
2. Hidden admin panel (admin-only auth flow)
3. Robust backend (OTP auth, wallet, orders, payments, invoices, notifications)

## Current Build Status

### Core Features Delivered
- [x] Customer OTP registration/login and traditional email/password auth
- [x] Restaurant listing, cart, addresses, wallet, orders, notifications APIs
- [x] Admin APIs for login, stats, users, restaurants, banners/settings/coupons
- [x] Order tracking endpoint and invoice download endpoint
- [x] Frontend flows for auth, browsing, cart, my orders, tracking, admin screens

### New Updates Added Recently
- [x] Project de-brand cleanup completed (old third-party branding references removed)
- [x] Root documentation created with setup and run guide
- [x] frontend/.env.example added
- [x] backend/.env.example added
- [x] backend/.env.example expanded with payment/map keys:
	- RAZORPAY_KEY_ID
	- RAZORPAY_KEY_SECRET
	- RAZORPAY_WEBHOOK_SECRET
	- CASHFREE_APP_ID
	- CASHFREE_SECRET_KEY
	- CASHFREE_ENV
	- GOOGLE_MAPS_API_KEY
- [x] Backend tests URL fallback improved (BACKEND_URL or local default)

## What Is Pending

### P0 - Must Complete
- [ ] Real Razorpay sandbox integration using env keys
- [ ] Real Cashfree sandbox integration using env keys
- [ ] SMTP configuration and actual invoice email sending

### P1 - High Priority
- [ ] Google Maps-based live tracking for paid orders
- [ ] Geoapify/OpenStreetMap fallback tracking for COD orders (verify end-to-end UX)
- [ ] WhatsApp/order event notifications hardening
- [ ] Frontend single-restaurant cart guard messages polish

### P2 - Medium Priority
- [ ] Real-time order updates (WebSocket/SSE integration)
- [ ] Banner management backend completion verification
- [ ] Frontend restaurant detail page + richer menu UX

## What Will Be Added Next

### Next Sprint Plan
- [ ] Wire all newly added payment/map env vars into backend config and services
- [ ] Add payment webhook handlers and signature verification flow for live callbacks
- [ ] Add startup validation for critical env keys in production mode
- [ ] Add integration tests for payment + tracking happy-path and failure-path
- [ ] Replace frontend default README with project-specific frontend docs

## Environment Keys Reference (No Real Secrets Here)

### Backend
- MONGO_URL
- DB_NAME
- JWT_SECRET
- CORS_ORIGINS
- FAST2SMS_API_KEY
- GEOAPIFY_API_KEY
- GOOGLE_MAPS_API_KEY
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- CASHFREE_APP_ID
- CASHFREE_SECRET_KEY
- CASHFREE_ENV
- BACKEND_URL

### Frontend
- REACT_APP_BACKEND_URL

## Notes
- Keep only placeholders in docs and example files.
- Store real keys only in local .env files.
- Avoid committing secrets to repository history.
