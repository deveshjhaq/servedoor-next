# Requirements Document

## Introduction

serveDoor is a full-stack food delivery web application built with React 19 (frontend) and FastAPI + MongoDB (backend). The app already has core features: customer auth (OTP + email/password), restaurant browsing, cart, orders, payments (Razorpay/Cashfree), order tracking via WebSockets, ratings, wallet, and a full admin panel. This document defines the requirements to elevate serveDoor from a functional prototype to a truly production-grade application. The enhancements span frontend resilience, UX polish, performance, security hardening, SEO, PWA capabilities, accessibility, backend reliability, observability, and developer operations.

## Glossary

- **App**: The serveDoor React 19 single-page application
- **API_Client**: The Axios instance defined in `frontend/src/services/api.js`
- **Backend**: The FastAPI application in `backend/app/main.py`
- **Error_Boundary**: A React class component that catches rendering errors in its subtree
- **Skeleton**: A placeholder UI component that mimics the shape of loading content
- **Toast**: A non-blocking notification rendered via the Sonner library
- **PWA**: Progressive Web App — a web app installable on mobile/desktop with offline support
- **Rate_Limiter**: Backend middleware that restricts the number of requests per IP/user in a time window
- **CSP**: Content Security Policy HTTP header
- **WCAG**: Web Content Accessibility Guidelines 2.1 Level AA
- **JWT**: JSON Web Token used for authentication
- **Refresh_Token**: A long-lived token used to obtain new access tokens without re-login
- **WebSocket_Manager**: The `backend/websocket_manager.py` module managing real-time connections
- **Lazy_Loader**: React.lazy + Suspense used to split route-level bundles
- **Service_Worker**: A browser background script enabling offline caching and push notifications
- **Meta_Manager**: A utility (react-helmet or equivalent) that sets per-page HTML meta tags
- **Logger**: The structured logging system on the backend (`logging` module) and frontend (console + remote sink)
- **Paginator**: A reusable component and backend pattern for cursor/offset-based data pagination
- **Retry_Handler**: Logic in API_Client that automatically retries idempotent failed requests
- **Input_Sanitizer**: Frontend utility that strips XSS vectors from user input before submission
- **Image_Optimizer**: A component that renders images with lazy loading, correct sizing, and WebP fallback
- **Admin_Panel**: The React admin interface under `frontend/src/components/admin/`
- **Validator**: Zod schema + react-hook-form integration used for all form validation
- **Coupon_Service**: Backend service handling coupon validation and application
- **Order_Service**: Backend service in `backend/app/services/order_service.py`
- **Auth_Service**: Backend service in `backend/app/services/auth_service.py`
- **Protected_Route**: A React wrapper component that redirects unauthenticated users to login
- **Debounce**: A technique to delay function execution until after a pause in user input
- **Infinite_Scroll**: A UX pattern that loads more data as the user scrolls to the bottom
- **404_Page**: A dedicated not-found page rendered for unmatched routes
- **Env_Guard**: Validation that all required environment variables are present at startup


## Requirements

### 1. Frontend Resilience & Error Handling

#### 1.1 Global Error Boundary
- **User Story**: As a user, when a UI component crashes, I want to see a friendly error screen instead of a blank white page, so I can recover without losing context.
- **Acceptance Criteria**:
  - AC1: An Error_Boundary wraps the entire App and each major route (Home, RestaurantDetail, AdminPanel).
  - AC2: The fallback UI shows a "Something went wrong" message with a "Reload Page" button.
  - AC3: The error and component stack are logged to the console (and optionally a remote sink).
  - AC4: Navigating to a different route resets the error boundary state.

#### 1.2 API Error Handling & Retry Logic
- **User Story**: As a user, when a network request fails due to a transient error, I want the app to retry automatically, so I don't have to manually refresh.
- **Acceptance Criteria**:
  - AC1: API_Client has a response interceptor that retries GET requests up to 2 times on 5xx or network errors with exponential back-off (500 ms, 1000 ms).
  - AC2: POST/PUT/DELETE requests are never auto-retried.
  - AC3: On final failure, a Toast is shown with the error message from the API response or a generic fallback.
  - AC4: 401 responses clear localStorage tokens and redirect to the login modal.
  - AC5: 429 (rate-limited) responses show a "Too many requests, please wait" Toast.

#### 1.3 Loading States & Skeleton Screens
- **User Story**: As a user, I want to see placeholder content while data loads, so the app feels fast and responsive.
- **Acceptance Criteria**:
  - AC1: RestaurantList shows a grid of Skeleton cards (matching RestaurantCard dimensions) while fetching.
  - AC2: RestaurantDetail shows Skeleton placeholders for the menu sections while loading.
  - AC3: MyOrders shows Skeleton rows while fetching order history.
  - AC4: AdminPanel tables show Skeleton rows during data fetch.
  - AC5: All Skeleton components use the existing `skeleton.jsx` UI primitive.

#### 1.4 Empty States
- **User Story**: As a user, when a list has no results, I want to see a helpful message with a call-to-action, so I know what to do next.
- **Acceptance Criteria**:
  - AC1: RestaurantList shows "No restaurants found" with a "Clear Filters" button when search/filter yields zero results.
  - AC2: MyOrders shows "You haven't placed any orders yet" with a "Browse Restaurants" link when empty.
  - AC3: Cart shows "Your cart is empty" with a "Start Ordering" button when no items exist.
  - AC4: Admin tables (users, orders, coupons) show "No records found" with relevant context.

#### 1.5 404 & Fallback Routes
- **User Story**: As a user, when I navigate to a URL that doesn't exist, I want to see a clear not-found page, so I'm not confused by a blank screen.
- **Acceptance Criteria**:
  - AC1: A dedicated `NotFound` component is rendered for all unmatched routes via a `<Route path="*">` catch-all.
  - AC2: The 404 page shows the serveDoor logo, a "Page not found" message, and a "Go Home" button.
  - AC3: The page title updates to "404 – Page Not Found".


### 2. Form Validation & UX Polish

#### 2.1 Comprehensive Form Validation
- **User Story**: As a user, when I submit a form with invalid data, I want to see inline error messages immediately, so I can fix them without guessing.
- **Acceptance Criteria**:
  - AC1: All forms (login, register, address, checkout, coupon, admin create/edit) use react-hook-form + Zod schemas.
  - AC2: Errors appear inline below each field on blur and on submit attempt.
  - AC3: The submit button is disabled while the form is submitting (shows a spinner).
  - AC4: Phone number fields validate format (10-digit Indian mobile).
  - AC5: Email fields validate RFC-compliant format.
  - AC6: Password fields enforce minimum 8 characters.

#### 2.2 Toast Notifications for All User Actions
- **User Story**: As a user, I want brief confirmation toasts for every action I take, so I always know if something succeeded or failed.
- **Acceptance Criteria**:
  - AC1: Success toasts appear for: add to cart, remove from cart, place order, cancel order, apply coupon, remove coupon, update profile, add address, delete address, add wallet money.
  - AC2: Error toasts appear for all failed API calls with the server's error message or a generic fallback.
  - AC3: Toasts auto-dismiss after 4 seconds and can be manually dismissed.
  - AC4: All toasts use the Sonner library already installed.

#### 2.3 Confirmation Dialogs for Destructive Actions
- **User Story**: As a user, before I delete something or cancel an order, I want a confirmation prompt, so I don't accidentally lose data.
- **Acceptance Criteria**:
  - AC1: Cancelling an order shows an AlertDialog with "Are you sure?" and a reason input.
  - AC2: Deleting an address shows an AlertDialog before deletion.
  - AC3: Admin actions (delete coupon, ban user, reject restaurant) show AlertDialogs.
  - AC4: All dialogs use the existing `alert-dialog.jsx` UI primitive.

#### 2.4 Input Sanitization
- **User Story**: As a developer, I want all user-supplied text inputs sanitized before submission, so XSS vectors are stripped.
- **Acceptance Criteria**:
  - AC1: A shared `sanitize(str)` utility strips `<script>`, HTML tags, and dangerous attributes from string inputs.
  - AC2: The utility is applied in all form `onSubmit` handlers before calling the API.
  - AC3: Backend Pydantic models use `validator` decorators to strip leading/trailing whitespace on string fields.


### 3. Performance Optimizations

#### 3.1 Route-Level Code Splitting
- **User Story**: As a user, I want the initial page load to be fast, so I'm not waiting for the entire app bundle to download.
- **Acceptance Criteria**:
  - AC1: `RestaurantDetail`, `AdminPanel`, `MyOrders`, and `OrderTracking` are loaded via `React.lazy` + `Suspense`.
  - AC2: Each lazy route has a `<Suspense fallback={<PageSkeleton />}>` wrapper.
  - AC3: The main bundle size is reduced (verified by build output).

#### 3.2 Image Lazy Loading & Optimization
- **User Story**: As a user on a slow connection, I want images to load only when they scroll into view, so the page loads faster.
- **Acceptance Criteria**:
  - AC1: All `<img>` tags use `loading="lazy"` attribute.
  - AC2: Restaurant and menu item images have explicit `width` and `height` attributes to prevent layout shift.
  - AC3: Images that fail to load show a placeholder fallback image.
  - AC4: An `OptimizedImage` component encapsulates this behavior and is used throughout.

#### 3.3 Search Debouncing
- **User Story**: As a user typing in the search bar, I want the search to trigger after I stop typing, not on every keystroke, so the app doesn't make excessive API calls.
- **Acceptance Criteria**:
  - AC1: The restaurant search input debounces API calls by 400 ms.
  - AC2: A `useDebounce` custom hook is created and reused across all search inputs.
  - AC3: A loading spinner appears in the search input while the debounced request is in-flight.

#### 3.4 Pagination for Lists
- **User Story**: As a user, I want long lists (orders, restaurants) to load in pages, so the app doesn't freeze loading hundreds of items.
- **Acceptance Criteria**:
  - AC1: MyOrders uses pagination with "Load More" button or page controls (10 orders per page).
  - AC2: Admin tables (users, orders, transactions) support page-based navigation (20 rows per page).
  - AC3: Backend order and user list endpoints accept `page` and `limit` query parameters and return `total`, `page`, `pages` in the response.
  - AC4: The current page is preserved in the URL query string (`?page=2`).

#### 3.5 Memoization of Expensive Components
- **User Story**: As a developer, I want expensive list renders to be memoized, so re-renders don't cause unnecessary DOM updates.
- **Acceptance Criteria**:
  - AC1: `RestaurantCard` is wrapped in `React.memo`.
  - AC2: Cart item list computations (subtotal, item count) use `useMemo`.
  - AC3: Callback props passed to child components use `useCallback` where appropriate.


### 4. Security Hardening

#### 4.1 Backend Rate Limiting
- **User Story**: As a system operator, I want API endpoints to be rate-limited, so brute-force and abuse attacks are mitigated.
- **Acceptance Criteria**:
  - AC1: A `slowapi` (or equivalent) rate limiter middleware is added to the FastAPI app.
  - AC2: Auth endpoints (`/api/auth/send-otp`, `/api/users/signin`) are limited to 5 requests per minute per IP.
  - AC3: General API endpoints are limited to 100 requests per minute per IP.
  - AC4: Exceeding the limit returns HTTP 429 with a `Retry-After` header.

#### 4.2 Security HTTP Headers
- **User Story**: As a security engineer, I want the backend to send security headers, so common web vulnerabilities are mitigated.
- **Acceptance Criteria**:
  - AC1: The backend adds these headers to all responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=()`.
  - AC2: A `SecurityHeadersMiddleware` is added to `main.py`.
  - AC3: CORS origins are validated against an allowlist from environment config (already partially done — ensure no wildcard `*` in production).

#### 4.3 JWT Token Refresh
- **User Story**: As a user, I want my session to stay active without re-logging in every day, so I have a seamless experience.
- **Acceptance Criteria**:
  - AC1: Auth endpoints return both an `access_token` (15-minute expiry) and a `refresh_token` (7-day expiry).
  - AC2: API_Client intercepts 401 responses, attempts a token refresh via `/api/auth/refresh`, and retries the original request once.
  - AC3: If refresh fails, the user is logged out and redirected to login.
  - AC4: Refresh tokens are stored in `httpOnly` cookies (not localStorage).

#### 4.4 Environment Variable Validation
- **User Story**: As a developer, I want the app to fail fast at startup if required environment variables are missing, so misconfiguration is caught immediately.
- **Acceptance Criteria**:
  - AC1: Backend `config.py` raises a `ValueError` at import time if any of `JWT_SECRET`, `MONGODB_URL`, `CORS_ORIGINS` are missing or empty.
  - AC2: Frontend `.env.example` documents all required variables with descriptions.
  - AC3: Frontend startup logs a console warning for each missing `REACT_APP_*` variable.

#### 4.5 Admin Route Protection
- **User Story**: As a system operator, I want the admin panel to be inaccessible without valid admin credentials, so unauthorized users can't access it.
- **Acceptance Criteria**:
  - AC1: A `ProtectedAdminRoute` component checks for a valid `adminToken` in localStorage before rendering `AdminPanel`.
  - AC2: Unauthenticated access to `/admin` redirects to the admin login page.
  - AC3: Backend admin routes verify the `role: "admin"` claim in the JWT on every request.


### 5. SEO & Accessibility

#### 5.1 Per-Page Meta Tags
- **User Story**: As a marketing manager, I want each page to have unique title and description meta tags, so search engines index the app correctly.
- **Acceptance Criteria**:
  - AC1: `react-helmet-async` (or equivalent) is installed and a `HelmetProvider` wraps the app.
  - AC2: Home page sets title "serveDoor – Food Delivery" and a relevant description.
  - AC3: RestaurantDetail sets title to the restaurant name and description to the restaurant's cuisine/tagline.
  - AC4: MyOrders sets title "My Orders – serveDoor".
  - AC5: 404 page sets title "404 – Page Not Found".

#### 5.2 Semantic HTML & ARIA Labels
- **User Story**: As a user relying on a screen reader, I want interactive elements to have descriptive labels, so I can navigate the app effectively.
- **Acceptance Criteria**:
  - AC1: All icon-only buttons have `aria-label` attributes (e.g., cart button, close button, quantity +/-).
  - AC2: Navigation landmarks use `<nav>`, `<main>`, `<header>`, `<footer>` semantic elements.
  - AC3: Modal dialogs have `role="dialog"` and `aria-labelledby` pointing to the dialog title.
  - AC4: Form inputs are associated with `<label>` elements via `htmlFor`/`id`.
  - AC5: Images have meaningful `alt` text; decorative images have `alt=""`.

#### 5.3 Keyboard Navigation
- **User Story**: As a keyboard-only user, I want to navigate the entire app without a mouse, so I'm not excluded from using it.
- **Acceptance Criteria**:
  - AC1: All interactive elements (buttons, links, inputs, selects) are reachable via Tab key.
  - AC2: Modals trap focus while open and restore focus to the trigger element on close.
  - AC3: Dropdown menus are navigable with arrow keys.
  - AC4: The cart sidebar can be opened and closed with keyboard.

#### 5.4 Color Contrast & Focus Indicators
- **User Story**: As a user with low vision, I want sufficient color contrast and visible focus rings, so I can read and navigate the app.
- **Acceptance Criteria**:
  - AC1: All text elements meet a minimum 4.5:1 contrast ratio against their background.
  - AC2: Focus rings are visible on all interactive elements (not removed via `outline: none` without a replacement).
  - AC3: Error states use both color and an icon/text indicator (not color alone).


### 6. PWA & Offline Support

#### 6.1 Web App Manifest
- **User Story**: As a mobile user, I want to install serveDoor on my home screen, so I can access it like a native app.
- **Acceptance Criteria**:
  - AC1: A `manifest.json` is present in `public/` with `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, and icon entries (192x192, 512x512).
  - AC2: The `<link rel="manifest">` tag is present in `public/index.html`.
  - AC3: The app passes the PWA installability criteria in Chrome DevTools Lighthouse.

#### 6.2 Service Worker & Offline Caching
- **User Story**: As a user with intermittent connectivity, I want to see cached content when offline, so the app doesn't show a blank error page.
- **Acceptance Criteria**:
  - AC1: A Service_Worker is registered in `src/index.js` using Workbox or a custom implementation.
  - AC2: The app shell (HTML, CSS, JS bundles) is cached on install using a cache-first strategy.
  - AC3: Restaurant list data is cached with a stale-while-revalidate strategy (max 5 minutes).
  - AC4: When offline, a banner "You are offline – showing cached data" is displayed.
  - AC5: API calls that fail due to network errors while offline show a specific "No internet connection" Toast.

