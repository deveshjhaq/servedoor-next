# Implementation Plan: Production-Ready Enhancements

## Overview

This plan implements production-grade enhancements for serveDoor across six major areas: frontend resilience, form validation & UX polish, performance optimizations, security hardening, SEO & accessibility, and PWA support. Each task builds incrementally, with testing sub-tasks marked optional. The implementation uses JavaScript/React 19 for frontend and Python/FastAPI for backend.

## Tasks

- [x] 1. Set up shared frontend utilities and components foundation
  - Create `frontend/src/components/shared/` directory
  - Create `frontend/src/utils/` directory
  - Install new dependencies: `react-helmet-async`, `zod`, `@hookform/resolvers`
  - Update `backend/requirements.txt` to add `slowapi`
  - _Requirements: 1.1, 2.1, 4.1_

- [ ] 2. Implement frontend error handling infrastructure
  - [x] 2.1 Create ErrorBoundary component
    - Create `frontend/src/components/shared/ErrorBoundary.jsx` with class component that catches render errors
    - Implement ErrorFallback UI with logo, message, and reload button
    - _Requirements: 1.1.AC1, 1.1.AC2, 1.1.AC3_
  
  - [x] 2.2 Add ErrorBoundary to App.js routing
    - Wrap routes in ErrorBoundary with `key={location.pathname}` for auto-reset on navigation
    - _Requirements: 1.1.AC1, 1.1.AC4_
  
  - [x] 2.3 Implement API retry and error interceptors
    - Add retry interceptor to `frontend/src/services/api.js` for GET requests (max 2 retries, 500ms/1000ms delays)
    - Add error interceptor for 401 (logout), 429 (rate limit toast), and generic error toasts
    - Set `axios.defaults.withCredentials = true` for cookie support
    - _Requirements: 1.2.AC1, 1.2.AC2, 1.2.AC3, 1.2.AC4, 1.2.AC5_
  
  - [ ]* 2.4 Write unit tests for retry logic
    - Test retry count limits, exponential backoff timing, and GET-only retry behavior
    - _Requirements: 1.2.AC1, 1.2.AC2_

- [ ] 3. Create loading states and empty state components
  - [x] 3.1 Create skeleton components
    - Create `frontend/src/components/shared/PageSkeleton.jsx` with RestaurantCardSkeleton, MenuSectionSkeleton, OrderRowSkeleton, TableRowSkeleton, and PageSkeleton exports
    - _Requirements: 1.3.AC1, 1.3.AC2, 1.3.AC3, 1.3.AC4, 1.3.AC5_
  
  - [x] 3.2 Create EmptyState component
    - Create `frontend/src/components/shared/EmptyState.jsx` accepting icon, title, description, and action props
    - _Requirements: 1.4.AC1, 1.4.AC2, 1.4.AC3, 1.4.AC4_
  
  - [x] 3.3 Integrate skeletons into existing components
    - Add RestaurantCardSkeleton to `frontend/src/components/RestaurantList.jsx`
    - Add MenuSectionSkeleton to `frontend/src/components/customer/RestaurantDetail.jsx`
    - Add OrderRowSkeleton to `frontend/src/components/customer/MyOrders.jsx`
    - Add TableRowSkeleton to admin components
    - _Requirements: 1.3.AC1, 1.3.AC2, 1.3.AC3, 1.3.AC4_
  
  - [x] 3.4 Integrate EmptyState into existing components
    - Add EmptyState to RestaurantList, MyOrders, SmartCart, and admin tables
    - _Requirements: 1.4.AC1, 1.4.AC2, 1.4.AC3, 1.4.AC4_

- [ ] 4. Implement 404 page and route protection
  - [x] 4.1 Create NotFound component
    - Create `frontend/src/components/NotFound.jsx` with logo, message, and "Go Home" button
    - Add Helmet for page title "404 – Page Not Found"
    - _Requirements: 1.5.AC1, 1.5.AC2, 1.5.AC3_
  
  - [x] 4.2 Create ProtectedAdminRoute component
    - Create `frontend/src/components/shared/ProtectedAdminRoute.jsx` checking adminToken and redirecting to `/admin/login`
    - _Requirements: 4.5.AC1, 4.5.AC2_
  
  - [x] 4.3 Update App.js routing
    - Add catch-all `<Route path="*" element={<NotFound />} />`
    - Wrap admin routes with ProtectedAdminRoute
    - Add dedicated `/admin/login` route
    - _Requirements: 1.5.AC1, 4.5.AC1, 4.5.AC2_

- [x] 5. Checkpoint - Verify error handling and routing
  - Ensure all tests pass, manually test error boundaries, 404 page, and admin route protection. Ask the user if questions arise.

- [ ] 6. Implement form validation infrastructure
  - [x] 6.1 Create Zod validation schemas
    - Create `frontend/src/lib/validationSchemas.js` with phoneSchema, emailSchema, passwordSchema, loginSchema, registerSchema, addressSchema, couponSchema
    - _Requirements: 2.1.AC4, 2.1.AC5, 2.1.AC6_
  
  - [x] 6.2 Create input sanitization utility
    - Create `frontend/src/utils/sanitize.js` with sanitize() function stripping script tags, HTML, and javascript: URIs
    - _Requirements: 2.4.AC1_
  
  - [ ]* 6.3 Write property test for sanitization
    - **Property P4: Sanitization Completeness**
    - **Validates: Requirements 2.4.AC1**
  
  - [-] 6.4 Integrate Zod schemas into existing forms
    - Update EnhancedAuth, address forms, checkout, coupon input, and admin forms to use react-hook-form with zodResolver
    - Add disabled state and spinner to submit buttons during submission
    - Apply sanitize() in all form onSubmit handlers
    - _Requirements: 2.1.AC1, 2.1.AC2, 2.1.AC3, 2.4.AC2_
  
  - [ ]* 6.5 Write unit tests for form validation
    - Test validation error messages for invalid phone, email, password formats
    - _Requirements: 2.1.AC4, 2.1.AC5, 2.1.AC6_

- [ ] 7. Implement UX polish components
  - [-] 7.1 Create ConfirmDialog component
    - Create `frontend/src/components/shared/ConfirmDialog.jsx` wrapping alert-dialog.jsx with title, description, confirmLabel, onConfirm, onCancel, destructive props
    - _Requirements: 2.3.AC4_
  
  - [-] 7.2 Integrate ConfirmDialog for destructive actions
    - Add confirmation dialogs to order cancellation in MyOrders
    - Add confirmation dialogs to address deletion
    - Add confirmation dialogs to admin destructive actions (delete coupon, ban user, reject restaurant)
    - _Requirements: 2.3.AC1, 2.3.AC2, 2.3.AC3_
  
  - [-] 7.3 Add toast notifications to all user actions
    - Update CartContext, OrderContext, WalletContext to call toast.success() and toast.error()
    - Replace existing Toaster in App.js with Sonner's Toaster with richColors, closeButton, duration=4000
    - _Requirements: 2.2.AC1, 2.2.AC2, 2.2.AC3, 2.2.AC4_

- [ ] 8. Implement performance optimizations
  - [-] 8.1 Add route-level code splitting
    - Convert RestaurantDetail, AdminPanel, MyOrders, OrderTracking, NotFound to React.lazy imports in App.js
    - Wrap lazy routes in Suspense with PageSkeleton fallback
    - _Requirements: 3.1.AC1, 3.1.AC2_
  
  - [-] 8.2 Create OptimizedImage component
    - Create `frontend/src/components/shared/OptimizedImage.jsx` with lazy loading, width/height props, and fallback on error
    - _Requirements: 3.2.AC3, 3.2.AC4_
  
  - [~] 8.3 Replace img tags with OptimizedImage
    - Update RestaurantCard, RestaurantDetail, menu items, and banners to use OptimizedImage with explicit dimensions
    - _Requirements: 3.2.AC1, 3.2.AC2_
  
  - [~] 8.4 Create useDebounce hook
    - Create `frontend/src/hooks/useDebounce.js` with 400ms default delay
    - _Requirements: 3.3.AC2_
  
  - [~] 8.5 Integrate debouncing in search inputs
    - Add useDebounce to RestaurantList and RestaurantBrowser search inputs
    - Show loading spinner while debounced value differs from input value
    - _Requirements: 3.3.AC1, 3.3.AC3_
  
  - [ ]* 8.6 Write property test for debounce timing
    - **Property P7: Debounce Timing**
    - **Validates: Requirements 3.3.AC1**
  
  - [~] 8.7 Add memoization to expensive components
    - Wrap RestaurantCard in React.memo
    - Add useMemo to CartContext subtotal and item count calculations
    - Add useCallback to event handlers passed as props in RestaurantList and MyOrders
    - _Requirements: 3.5.AC1, 3.5.AC2, 3.5.AC3_

- [~] 9. Checkpoint - Verify forms and performance
  - Ensure all tests pass, verify form validation, toast notifications, and performance improvements. Ask the user if questions arise.

- [ ] 10. Implement backend pagination support
  - [~] 10.1 Add pagination to order repository
    - Update `backend/app/repositories/repos.py` to add get_paginated() method to OrderRepository returning (items, total)
    - _Requirements: 3.4.AC3_
  
  - [~] 10.2 Add pagination to user repository
    - Add get_paginated() method to UserRepository in repos.py
    - _Requirements: 3.4.AC3_
  
  - [~] 10.3 Update order list endpoint
    - Modify GET /api/orders in `backend/app/routes/orders.py` to accept page and limit query params, return {success, data, total, page, pages}
    - _Requirements: 3.4.AC3_
  
  - [~] 10.4 Update admin user list endpoint
    - Modify GET /api/admin/users to accept page and limit query params, return paginated response
    - _Requirements: 3.4.AC3_
  
  - [ ]* 10.5 Write property test for pagination consistency
    - **Property P6: Pagination Consistency**
    - **Validates: Requirements 3.4.AC3**

- [ ] 11. Implement frontend pagination
  - [~] 11.1 Create usePagination hook
    - Create `frontend/src/hooks/usePagination.js` with fetchFn, page, limit params returning data, total, pages, currentPage, setPage, loading
    - _Requirements: 3.4.AC1, 3.4.AC2_
  
  - [~] 11.2 Integrate pagination in MyOrders
    - Use usePagination hook with limit=10, sync page to URL query string
    - _Requirements: 3.4.AC1, 3.4.AC4_
  
  - [~] 11.3 Integrate pagination in admin tables
    - Use usePagination in UserManagement, OrderManagement with limit=20
    - _Requirements: 3.4.AC2, 3.4.AC4_

- [ ] 12. Implement backend security hardening
  - [~] 12.1 Add rate limiting middleware
    - Install slowapi, create limiter in `backend/app/main.py` with default 100/minute
    - Add rate limit decorators to auth endpoints: 5/minute for /api/auth/send-otp and /api/users/signin
    - Add exception handler for RateLimitExceeded returning 429 with Retry-After header
    - _Requirements: 4.1.AC1, 4.1.AC2, 4.1.AC3, 4.1.AC4_
  
  - [ ]* 12.2 Write property test for rate limit enforcement
    - **Property P5: Rate Limit Enforcement**
    - **Validates: Requirements 4.1.AC2, 4.1.AC4_
  
  - [~] 12.3 Create SecurityHeadersMiddleware
    - Create `backend/app/core/middleware.py` with SecurityHeadersMiddleware adding X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy headers
    - Add middleware to main.py after RequestIDMiddleware
    - _Requirements: 4.2.AC1, 4.2.AC2_
  
  - [~] 12.4 Harden CORS configuration
    - Update CORS middleware in main.py to validate origins against allowlist from config, ensure no wildcard in production
    - _Requirements: 4.2.AC3_
  
  - [~] 12.5 Add environment variable validation
    - Update `backend/app/core/config.py` to check JWT_SECRET, MONGODB_URL, CORS_ORIGINS at import time, raise ValueError if missing
    - _Requirements: 4.4.AC1_

- [ ] 13. Implement JWT refresh token support
  - [~] 13.1 Add refresh token creation
    - Update `backend/app/core/security.py` to add create_refresh_token() function with 7-day expiry and type: "refresh" claim
    - _Requirements: 4.3.AC1_
  
  - [~] 13.2 Create refresh token endpoint
    - Add POST /api/auth/refresh to `backend/app/routes/auth.py` reading refresh_token from httpOnly cookie, validating type claim, returning new access_token
    - _Requirements: 4.3.AC1, 4.3.AC2_
  
  - [~] 13.3 Update auth endpoints to issue refresh tokens
    - Modify OTP verify endpoints to return access_token (15-min) in body and set refresh_token as httpOnly; Secure; SameSite=Strict cookie
    - _Requirements: 4.3.AC1, 4.3.AC4_
  
  - [~] 13.4 Add token refresh interceptor to frontend
    - Update `frontend/src/services/api.js` to intercept 401, attempt POST /api/auth/refresh, retry original request once if successful, logout if refresh fails
    - _Requirements: 4.3.AC2, 4.3.AC3_
  
  - [ ]* 13.5 Write property test for token refresh atomicity
    - **Property P3: Token Refresh Atomicity**
    - **Validates: Requirements 4.3.AC2, 4.3.AC3_
  
  - [~] 13.6 Add backend admin route JWT validation
    - Verify role: "admin" claim in JWT for all admin routes
    - _Requirements: 4.5.AC3_

- [ ] 14. Add backend input validation
  - [~] 14.1 Add Pydantic field validators
    - Update `backend/app/models/models.py` to add field_validator with mode='before' to strip whitespace on string fields
    - _Requirements: 2.4.AC3_

- [~] 15. Checkpoint - Verify security and pagination
  - Ensure all tests pass, verify rate limiting, security headers, token refresh, and pagination. Ask the user if questions arise.

- [ ] 16. Implement SEO and accessibility foundations
  - [~] 16.1 Add react-helmet-async setup
    - Wrap App.js in HelmetProvider from react-helmet-async
    - _Requirements: 5.1.AC1_
  
  - [~] 16.2 Add meta tags to all pages
    - Add Helmet to Home with title "serveDoor – Food Delivery" and description
    - Add Helmet to RestaurantDetail with dynamic restaurant name title
    - Add Helmet to MyOrders with title "My Orders – serveDoor"
    - Add Helmet to NotFound with title "404 – Page Not Found"
    - _Requirements: 5.1.AC2, 5.1.AC3, 5.1.AC4, 5.1.AC5_
  
  - [~] 16.3 Add environment variable validation to frontend
    - Update `frontend/src/index.js` to check REACT_APP_BACKEND_URL at startup, log console warning if missing
    - Update `frontend/.env.example` to document all REACT_APP_* variables with descriptions
    - _Requirements: 4.4.AC2, 4.4.AC3_

- [ ] 17. Implement semantic HTML and ARIA improvements
  - [~] 17.1 Update Header component
    - Wrap Header.jsx in <header> element
    - Add aria-label="Open cart" to cart button
    - Add aria-label="Notifications" to notification button
    - _Requirements: 5.2.AC2, 5.2.AC1_
  
  - [~] 17.2 Update Footer component
    - Wrap Footer.jsx in <footer> element
    - _Requirements: 5.2.AC2_
  
  - [~] 17.3 Update RestaurantList component
    - Wrap RestaurantList.jsx in <main> element
    - _Requirements: 5.2.AC2_
  
  - [~] 17.4 Add ARIA labels to dialogs and forms
    - Add aria-labelledby to all Dialog and Sheet components pointing to title element id
    - Ensure all form Input elements are paired with Label htmlFor={id}
    - Add meaningful alt text to all img tags or alt="" for decorative images
    - _Requirements: 5.2.AC3, 5.2.AC4, 5.2.AC5_
  
  - [~] 17.5 Ensure keyboard navigation support
    - Verify all interactive elements are Tab-reachable (Radix UI handles most)
    - Ensure modals trap focus and restore focus on close
    - Verify dropdown menus support arrow key navigation
    - Replace any onClick on non-button elements with button or role="button" + onKeyDown
    - _Requirements: 5.3.AC1, 5.3.AC2, 5.3.AC3, 5.3.AC4_

- [ ] 18. Implement focus and contrast improvements
  - [~] 18.1 Add focus ring styles
    - Update `frontend/src/index.css` to add :focus-visible styles with 2px outline and offset
    - _Requirements: 5.4.AC2_
  
  - [~] 18.2 Improve error state indicators
    - Update form error states to use both text-red-600 color AND AlertCircle icon from lucide-react
    - _Requirements: 5.4.AC3_
  
  - [ ]* 18.3 Audit color contrast
    - Verify all text elements meet 4.5:1 contrast ratio (manual check or automated tool)
    - _Requirements: 5.4.AC1_

- [ ] 19. Implement PWA support
  - [~] 19.1 Create web app manifest
    - Create `frontend/public/manifest.json` with name, short_name, start_url, display: standalone, theme_color, background_color, icons (192x192, 512x512)
    - Add <link rel="manifest"> to `frontend/public/index.html`
    - _Requirements: 6.1.AC1, 6.1.AC2_
  
  - [~] 19.2 Create service worker
    - Create `frontend/src/serviceWorker.js` with install event caching app shell (cache-first), fetch event with stale-while-revalidate for /api/restaurants/ (5-min TTL), network-first for other API calls
    - _Requirements: 6.2.AC1, 6.2.AC2, 6.2.AC3_
  
  - [~] 19.3 Create OfflineBanner component
    - Create `frontend/src/components/shared/OfflineBanner.jsx` listening to online/offline events, showing yellow banner when offline
    - _Requirements: 6.2.AC4_
  
  - [~] 19.4 Register service worker and add offline banner
    - Update `frontend/src/index.js` to register service worker in production
    - Add OfflineBanner to App.js above BrowserRouter
    - _Requirements: 6.2.AC1, 6.2.AC4_
  
  - [~] 19.5 Update API error handling for offline
    - Update api.js error interceptor to show "No internet connection" toast for network errors when navigator.onLine is false
    - _Requirements: 6.2.AC5_
  
  - [ ]* 19.6 Verify PWA installability
    - Run Chrome DevTools Lighthouse PWA audit to verify installability criteria
    - _Requirements: 6.1.AC3_

- [~] 20. Final checkpoint and integration
  - Ensure all tests pass, verify SEO meta tags, accessibility features, and PWA functionality. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation is additive - no existing features are removed or rewritten
- Frontend uses JavaScript/React 19, backend uses Python/FastAPI
- All new components follow existing patterns (Radix UI primitives, Tailwind CSS, shadcn/ui conventions)
