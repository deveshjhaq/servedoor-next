# Design Document

## Overview

This document describes the technical design for elevating serveDoor to production-grade quality. The changes span both the React 19 frontend and FastAPI + MongoDB backend. The approach is additive — no existing features are removed or rewritten from scratch. Each section maps directly to the requirements and specifies exactly which files change, what new files are created, and the key implementation patterns.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Frontend                     │
│                                                          │
│  App.js                                                  │
│  ├── HelmetProvider (react-helmet-async)                 │
│  ├── ErrorBoundary (global)                              │
│  ├── OfflineBanner                                       │
│  └── BrowserRouter                                       │
│       ├── Suspense (lazy routes)                         │
│       │    ├── Home                                      │
│       │    ├── RestaurantDetail (lazy)                   │
│       │    ├── ProtectedAdminRoute → AdminPanel (lazy)   │
│       │    ├── MyOrders (lazy)                           │
│       │    └── NotFound                                  │
│       └── Toaster (Sonner)                               │
│                                                          │
│  services/api.js  ← retry + refresh interceptors        │
│  hooks/           ← useDebounce, usePagination           │
│  utils/           ← sanitize, optimizedImage             │
│  components/shared/ ← ErrorBoundary, OptimizedImage,    │
│                       EmptyState, PageSkeleton           │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  main.py                                                 │
│  ├── SecurityHeadersMiddleware (new)                     │
│  ├── RateLimitMiddleware (slowapi)                       │
│  ├── RequestIDMiddleware (existing)                      │
│  └── CORSMiddleware (existing, hardened)                 │
│                                                          │
│  core/config.py   ← env validation (hardened)           │
│  core/security.py ← refresh token support               │
│  routes/auth.py   ← /auth/refresh endpoint              │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Resilience & Error Handling

### 1.1 ErrorBoundary Component

**New file**: `frontend/src/components/shared/ErrorBoundary.jsx`

React class component (required — hooks can't catch render errors):

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
    // optional: send to remote logging
  }

  render() {
    if (this.state.hasError) return <ErrorFallback onReset={...} />
    return this.props.children
  }
}
```

`ErrorFallback` renders a centered card with the serveDoor logo, "Something went wrong" message, and a "Reload Page" button that calls `window.location.reload()`.

Wraps each route in `App.js` — the boundary `key` prop is set to `location.pathname` so navigation resets it automatically.

### 1.2 API Client — Retry & Interceptors

**Modified file**: `frontend/src/services/api.js`

Two new response interceptors added to `apiClient`:

**Retry interceptor** (runs first):
- Tracks retry count via `config._retryCount`
- Only retries GET requests on network error or status >= 500
- Max 2 retries with delays: `[500, 1000]` ms
- Uses `new Promise(resolve => setTimeout(resolve, delay))` then re-issues via `apiClient(config)`

**Auth/error interceptor** (runs second):
- 401 → clears `authToken` + `adminToken` from localStorage, dispatches a custom `auth:logout` window event, shows error toast
- 429 → shows "Too many requests, please wait" toast
- All other errors → shows toast with `error.response?.data?.message` or generic fallback

**Token refresh** (separate interceptor):
- On 401, before clearing tokens, attempts `POST /api/auth/refresh` with the refresh token from cookie
- If successful, updates `authToken` in localStorage and retries original request once
- If refresh fails, proceeds to logout flow

### 1.3 Skeleton Screens

**New file**: `frontend/src/components/shared/PageSkeleton.jsx`

Reusable skeletons built on the existing `skeleton.jsx` primitive:

- `RestaurantCardSkeleton` — matches RestaurantCard dimensions (image + 3 text lines)
- `MenuSectionSkeleton` — matches menu item row layout
- `OrderRowSkeleton` — matches order history row
- `TableRowSkeleton` — generic admin table row
- `PageSkeleton` — full-page loading state for lazy routes

Each component is exported individually and used in the respective list components.

### 1.4 Empty States

**New file**: `frontend/src/components/shared/EmptyState.jsx`

Generic component accepting `icon`, `title`, `description`, and `action` (optional button/link):

```jsx
<EmptyState
  icon={<UtensilsCrossed />}
  title="No restaurants found"
  description="Try clearing your filters"
  action={<Button onClick={clearFilters}>Clear Filters</Button>}
/>
```

Used in: `RestaurantList`, `MyOrders`, `SmartCart`, and all admin tables.

### 1.5 NotFound Page

**New file**: `frontend/src/components/NotFound.jsx`

Simple centered page with logo, "404 – Page Not Found" heading, and a `<Link to="/">Go Home</Link>` button. Sets page title via `react-helmet-async`.

Added to `App.js` as `<Route path="*" element={<NotFound />} />`.

---

## 2. Form Validation & UX Polish

### 2.1 Zod Schemas

**New file**: `frontend/src/lib/validationSchemas.js`

Centralised Zod schemas:

```js
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
export const emailSchema = z.string().email('Enter a valid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const loginSchema = z.object({ email: emailSchema, password: passwordSchema })
export const registerSchema = z.object({ name: z.string().min(2), phone: phoneSchema, email: emailSchema.optional(), password: passwordSchema })
export const addressSchema = z.object({ label: z.string().min(1), street: z.string().min(5), city: z.string().min(2), pincode: z.string().regex(/^\d{6}$/) })
export const couponSchema = z.object({ code: z.string().min(3).max(20).toUpperCase() })
```

All existing forms are updated to use `useForm({ resolver: zodResolver(schema) })`. Submit buttons get `disabled={isSubmitting}` and show a `<Loader2 className="animate-spin" />` icon while submitting.

### 2.2 Toast Integration

All cart, order, coupon, profile, address, and wallet actions in `CartContext`, `OrderContext`, `WalletContext`, and component handlers are updated to call `toast.success(...)` or `toast.error(...)` from Sonner on completion.

The existing `<Toaster />` in `App.js` is replaced with Sonner's `<Toaster richColors closeButton duration={4000} />`.

### 2.3 Confirmation Dialogs

**New file**: `frontend/src/components/shared/ConfirmDialog.jsx`

Thin wrapper around the existing `alert-dialog.jsx`:

```jsx
<ConfirmDialog
  open={open}
  title="Cancel Order?"
  description="This action cannot be undone."
  confirmLabel="Yes, Cancel"
  onConfirm={handleCancel}
  onCancel={() => setOpen(false)}
  destructive
/>
```

Used in: `MyOrders` (cancel order), address delete, and all admin destructive actions.

### 2.4 Input Sanitization

**New file**: `frontend/src/utils/sanitize.js`

```js
export function sanitize(str) {
  if (typeof str !== 'string') return str
  return str
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
}
```

Applied in form `onSubmit` handlers by mapping over string fields before API calls.

Backend: Pydantic `field_validator` with `mode='before'` added to string fields in `models.py` to strip whitespace.

---

## 3. Performance Optimizations

### 3.1 Code Splitting

**Modified file**: `frontend/src/App.js`

```jsx
const RestaurantDetail = React.lazy(() => import('./components/customer/RestaurantDetail'))
const AdminPanel = React.lazy(() => import('./components/admin/AdminPanel'))
const MyOrders = React.lazy(() => import('./components/customer/MyOrders'))
const OrderTracking = React.lazy(() => import('./components/customer/OrderTracking'))
const NotFound = React.lazy(() => import('./components/NotFound'))
```

Each lazy import wrapped in `<Suspense fallback={<PageSkeleton />}>`.

### 3.2 OptimizedImage Component

**New file**: `frontend/src/components/shared/OptimizedImage.jsx`

```jsx
function OptimizedImage({ src, alt, width, height, className, fallback = '/placeholder-food.png' }) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={className}
      onError={() => setImgSrc(fallback)}
    />
  )
}
```

Replaces all `<img>` tags in `RestaurantCard`, `RestaurantDetail`, menu items, and banners.

### 3.3 useDebounce Hook

**New file**: `frontend/src/hooks/useDebounce.js`

```js
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

Used in `RestaurantList` and `RestaurantBrowser` search inputs. A `isSearching` boolean state shows a spinner in the search input while the debounced value differs from the current input value.

### 3.4 Pagination

**New file**: `frontend/src/hooks/usePagination.js`

```js
export function usePagination(fetchFn, { page = 1, limit = 10 } = {}) {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(page)
  const [loading, setLoading] = useState(false)
  // ... fetch logic, returns { data, total, pages, currentPage, setPage, loading }
}
```

`MyOrders` uses this hook with `limit=10`. Admin tables use `limit=20`. Page state is synced to URL via `useSearchParams`.

**Backend changes** — `GET /api/orders` and `GET /api/admin/users` accept `page: int = 1` and `limit: int = 10` query params. Repositories get a `get_paginated(filter, skip, limit)` method returning `(items, total)`. Response shape:

```json
{ "success": true, "data": [...], "total": 100, "page": 2, "pages": 10 }
```

### 3.5 Memoization

- `RestaurantCard` → `export default React.memo(RestaurantCard)`
- `CartContext` subtotal/item count → `useMemo(() => items.reduce(...), [items])`
- Event handlers passed as props in `RestaurantList`, `MyOrders` → `useCallback`

---

## 4. Security Hardening

### 4.1 Rate Limiting

**Modified file**: `backend/app/main.py`

`slowapi` added to `requirements.txt`. Limiter configured with `key_func=get_remote_address`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

Auth route handlers decorated with `@limiter.limit("5/minute")`.

### 4.2 Security Headers Middleware

**New file**: `backend/app/core/middleware.py`

```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        return response
```

Added to `main.py` after `RequestIDMiddleware`.

### 4.3 JWT Token Refresh

**Modified file**: `backend/app/core/security.py`

New function `create_refresh_token(subject)` — 7-day expiry, `type: "refresh"` claim.

**Modified file**: `backend/app/routes/auth.py`

New endpoint `POST /api/auth/refresh`:
- Reads `refresh_token` from `httpOnly` cookie
- Validates token and `type == "refresh"` claim
- Returns new `access_token` (15-min) in response body
- Sets new `refresh_token` cookie

All OTP verify endpoints updated to:
1. Return `access_token` with 15-min expiry in response body
2. Set `refresh_token` as `httpOnly; Secure; SameSite=Strict` cookie via `response.set_cookie()`

**Modified file**: `frontend/src/services/api.js`

Refresh interceptor added (see §1.2 above). `axios.defaults.withCredentials = true` set so cookies are sent cross-origin.

### 4.4 Environment Variable Validation

**Modified file**: `backend/app/core/config.py`

```python
REQUIRED_VARS = ["JWT_SECRET", "MONGODB_URL"]
missing = [v for v in REQUIRED_VARS if not os.getenv(v)]
if missing:
    raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
```

**Modified file**: `frontend/.env.example` — all `REACT_APP_*` variables documented with descriptions and example values.

**Modified file**: `frontend/src/index.js` — startup check:

```js
const REQUIRED_ENV = ['REACT_APP_BACKEND_URL']
REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) console.warn(`[Config] Missing env var: ${key}`)
})
```

### 4.5 Admin Route Protection

**New file**: `frontend/src/components/shared/ProtectedAdminRoute.jsx`

```jsx
export function ProtectedAdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken')
  if (!adminToken) return <Navigate to="/admin/login" replace />
  return children
}
```

`App.js` updated: `<Route path="/admin" element={<ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>} />`

A dedicated `/admin/login` route renders `AdminLogin` component (already exists at `components/admin/AdminLogin.jsx`).

---

## 5. SEO & Accessibility

### 5.1 Meta Tags

**New dependency**: `react-helmet-async` added to `package.json`.

**Modified file**: `frontend/src/App.js` — `<HelmetProvider>` wraps the entire app.

Each page component adds:

```jsx
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>serveDoor – Food Delivery</title>
  <meta name="description" content="Order food from the best restaurants near you" />
</Helmet>
```

`RestaurantDetail` sets title dynamically from the fetched restaurant name.

### 5.2 Semantic HTML & ARIA

Changes applied across existing components:

- `Header.jsx` — `<header>` wrapping, cart button gets `aria-label="Open cart"`, notification button gets `aria-label="Notifications"`
- `Footer.jsx` — `<footer>` wrapping
- `RestaurantList.jsx` — wrapped in `<main>`
- All `<Dialog>` and `<Sheet>` components — `aria-labelledby` pointing to title element id
- All form `<Input>` elements — paired with `<Label htmlFor={id}>`
- All `<img>` tags — meaningful `alt` text or `alt=""` for decorative images

### 5.3 Keyboard Navigation

Radix UI primitives (already used throughout) handle focus trapping and arrow key navigation natively. Remaining gaps:

- Cart `<Sheet>` — already uses Radix Sheet which traps focus
- Custom dropdowns in `Header` — migrated to Radix `<DropdownMenu>` if not already
- All `onClick` handlers on non-button elements — replaced with `<button>` or `role="button"` + `onKeyDown` handler

### 5.4 Focus & Contrast

**Modified file**: `frontend/src/index.css`

```css
/* Ensure focus rings are always visible */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

Error states in form fields use both `text-red-600` color AND a `<AlertCircle>` icon from lucide-react alongside the error message text.

---

## 6. PWA & Offline Support

### 6.1 Web App Manifest

**New file**: `frontend/public/manifest.json`

```json
{
  "name": "serveDoor – Food Delivery",
  "short_name": "serveDoor",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#f97316",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Modified file**: `frontend/public/index.html` — `<link rel="manifest" href="%PUBLIC_URL%/manifest.json">` added.

### 6.2 Service Worker

**New file**: `frontend/src/serviceWorker.js`

Custom service worker using the Cache API (no Workbox dependency needed):

- **Install event**: caches app shell files (`/`, `/static/js/main.*.js`, `/static/css/main.*.css`)
- **Fetch event**: 
  - App shell requests → cache-first
  - `/api/restaurants/` GET → stale-while-revalidate (5-minute TTL check via cached timestamp)
  - All other API requests → network-first, fall through on failure

**New file**: `frontend/src/components/shared/OfflineBanner.jsx`

```jsx
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (!offline) return null
  return <div className="fixed top-0 inset-x-0 z-50 bg-yellow-500 text-center py-2 text-sm font-medium">You are offline – showing cached data</div>
}
```

Added to `App.js` above `<BrowserRouter>`.

**Modified file**: `frontend/src/index.js` — service worker registration:

```js
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
  })
}
```

---

## New Files Summary

| File | Purpose |
|------|---------|
| `frontend/src/components/shared/ErrorBoundary.jsx` | Global + per-route error catching |
| `frontend/src/components/shared/PageSkeleton.jsx` | Loading skeletons for all major views |
| `frontend/src/components/shared/EmptyState.jsx` | Reusable empty state UI |
| `frontend/src/components/shared/OptimizedImage.jsx` | Lazy image with fallback |
| `frontend/src/components/shared/ConfirmDialog.jsx` | Reusable destructive action dialog |
| `frontend/src/components/shared/ProtectedAdminRoute.jsx` | Admin auth guard |
| `frontend/src/components/shared/OfflineBanner.jsx` | Offline status indicator |
| `frontend/src/components/NotFound.jsx` | 404 page |
| `frontend/src/hooks/useDebounce.js` | Debounce hook |
| `frontend/src/hooks/usePagination.js` | Pagination hook |
| `frontend/src/lib/validationSchemas.js` | Centralised Zod schemas |
| `frontend/src/utils/sanitize.js` | XSS sanitization utility |
| `frontend/src/serviceWorker.js` | PWA service worker |
| `frontend/public/manifest.json` | PWA manifest |
| `backend/app/core/middleware.py` | SecurityHeadersMiddleware |

## Modified Files Summary

| File | Changes |
|------|---------|
| `frontend/src/App.js` | Lazy routes, ErrorBoundary, HelmetProvider, OfflineBanner, ProtectedAdminRoute, NotFound route |
| `frontend/src/services/api.js` | Retry interceptor, refresh interceptor, 401/429 handling |
| `frontend/src/index.js` | SW registration, env var check |
| `frontend/src/index.css` | Focus ring styles |
| `frontend/package.json` | Add `react-helmet-async` |
| `backend/app/main.py` | SecurityHeadersMiddleware, slowapi limiter |
| `backend/app/core/config.py` | Required env var validation |
| `backend/app/core/security.py` | `create_refresh_token` function |
| `backend/app/routes/auth.py` | `/auth/refresh` endpoint, refresh cookie on login |
| `backend/app/models/models.py` | Pydantic field validators for whitespace stripping |
| `backend/requirements.txt` | Add `slowapi` |

---

## Correctness Properties

These properties define what "correct" means for the production enhancements and will be validated via property-based tests.

**P1 — Error Boundary Isolation**: For any component subtree that throws during render, the error must be caught by the nearest ErrorBoundary and must not propagate to crash the entire app.

**P2 — Retry Idempotency**: For any GET request that fails with a 5xx status, the retry mechanism must re-issue the identical request (same URL, headers, params) and must never retry POST/PUT/DELETE requests.

**P3 — Token Refresh Atomicity**: For any 401 response received while a valid refresh token exists, exactly one refresh attempt is made. If the refresh succeeds, the original request is retried exactly once with the new token. If the refresh fails, no further retries occur and the user is logged out.

**P4 — Sanitization Completeness**: For any string input containing `<script>` tags, HTML tags, or `javascript:` URIs, the `sanitize()` function must return a string containing none of those patterns.

**P5 — Rate Limit Enforcement**: For any IP address that sends more than 5 requests to auth endpoints within a 60-second window, all requests beyond the 5th must receive HTTP 429.

**P6 — Pagination Consistency**: For any paginated list endpoint, the sum of items across all pages must equal the `total` field returned in any single page response, regardless of the `limit` parameter.

**P7 — Debounce Timing**: For any sequence of input changes within a 400 ms window, the search API must be called exactly once — after the final change settles for 400 ms.
