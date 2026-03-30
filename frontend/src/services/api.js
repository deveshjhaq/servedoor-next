import axios from 'axios';
import { toast } from '../hooks/use-toast';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enable credentials (cookies) for cross-origin requests
axios.defaults.withCredentials = true;
apiClient.defaults.withCredentials = true;

// Attach customer auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Retry interceptor for GET requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }
    
    // Only retry GET requests
    if (config.method?.toLowerCase() === 'get') {
      const shouldRetry = 
        (!error.response || error.response.status >= 500) && 
        config._retryCount < 2;
      
      if (shouldRetry) {
        config._retryCount += 1;
        const delays = [500, 1000];
        const delay = delays[config._retryCount - 1];
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }
    
    return Promise.reject(error);
  }
);

// Error and auth interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !originalRequest._refreshAttempted) {
      originalRequest._refreshAttempted = true;
      try {
        const refreshResponse = await apiClient.post('/auth/refresh');
        const nextToken = refreshResponse?.data?.data?.access_token;
        if (nextToken) {
          localStorage.setItem('authToken', nextToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${nextToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Continue to logout flow below.
      }
    }
    
    // Handle 401 - Unauthorized
    if (status === 401) {
      // Clear tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Show error toast
      toast({
        title: 'Session expired',
        description: 'Please log in again',
        variant: 'destructive',
      });
    }
    
    // Handle 429 - Rate Limited
    else if (status === 429) {
      toast({
        title: 'Too many requests',
        description: 'Please wait a moment and try again',
        variant: 'destructive',
      });
    }
    
    // Handle all other errors
    else {
      if (!navigator.onLine) {
        toast({
          title: 'No internet connection',
          description: 'Please check your network and try again',
          variant: 'destructive',
        });
        return Promise.reject(error);
      }

      const message = error.response?.data?.message || 
                     error.response?.data?.detail ||
                     error.message ||
                     'An unexpected error occurred';
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper: get admin auth header
const adminAuthHeader = () => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
};

const api = {
  // Health
  health: () => apiClient.get('/health'),

  // Auth - Traditional (Email/Password) - TBD implementation
  auth: {
    signup: (userData) => apiClient.post('/users/signup', userData),
    signin: (credentials) => apiClient.post('/users/signin', credentials),
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data) => apiClient.put('/users/profile', data),

    // OTP-based auth (Unified)
    registerWithOTP: (userData) => apiClient.post('/auth/send-otp', { phone: userData.phone }),
    verifyRegistrationOTP: (data) => apiClient.post('/auth/verify-otp', data),
    loginWithOTP: (phone) => apiClient.post('/auth/send-otp', { phone }),
    verifyLoginOTP: (data) => apiClient.post('/auth/verify-otp', data),
  },

  // Restaurants & Menu
  restaurants: {
    getAll: (params = {}) => apiClient.get('/restaurants/', { params }),
    getById: (id) => apiClient.get(`/restaurants/${id}`),
    getMenu: (restaurantId) => apiClient.get(`/restaurants/${restaurantId}/menu`),
    search: (query, filters = {}) =>
      apiClient.get('/restaurants/', { params: { search: query, ...filters } }),
    getCategories: () => apiClient.get('/restaurants/categories'),
  },

  // Cart Management
  cart: {
    get: () => apiClient.get('/cart/'),
    addItem: (item) => apiClient.post('/cart/items', item),
    updateQuantity: (itemId, quantity) =>
      apiClient.put(`/cart/items/${itemId}`, { quantity }),
    removeItem: (itemId) => apiClient.put(`/cart/items/${itemId}`, { quantity: 0 }),
    clear: () => apiClient.delete('/cart/'),
    applyCoupon: (couponCode) => apiClient.post('/cart/coupon', { code: couponCode }),
    removeCoupon: () => apiClient.delete('/cart/coupon'),
  },

  // Address Management
  addresses: {
    getAll: () => apiClient.get('/users/addresses'),
    create: (address) => apiClient.post('/users/addresses', address),
    update: (id, address) => apiClient.put(`/users/addresses/${id}`, address),
    delete: (id) => apiClient.delete(`/users/addresses/${id}`),
    setDefault: (id) => apiClient.put(`/users/addresses/${id}/default`),
  },

  // Order Management
  orders: {
    create: (orderData) => apiClient.post('/orders', orderData),
    getAll: (params = {}) => apiClient.get('/orders', { params }),
    getById: (orderId) => apiClient.get(`/orders/${orderId}`),
    cancel: (orderId, reason) =>
      apiClient.post(`/orders/${orderId}/cancel`, { reason }),
    track: (orderId) => apiClient.get(`/orders/${orderId}/track`),
    addRating: (orderId, rating) =>
      apiClient.post(`/orders/${orderId}/rating`, rating),
    getInvoice: (orderId) => apiClient.get(`/orders/${orderId}/invoice`, { responseType: 'arraybuffer' }),
    reorder: (orderId) => apiClient.post(`/orders/${orderId}/reorder`),
  },

  // Payment Integration
  payments: {
    createCashfreeOrder: (orderData) =>
      apiClient.post('/payments/cashfree/create', orderData),
    verifyCashfreePayment: (paymentId) =>
      apiClient.post('/payments/cashfree/verify', { paymentId }),
    createRazorpayOrder: (orderData) =>
      apiClient.post('/payments/razorpay/create', orderData),
    verifyRazorpayPayment: (paymentData) =>
      apiClient.post('/payments/razorpay/verify', paymentData),
    getPaymentMethods: () => apiClient.get('/payments/methods'),
  },

  // Digital Wallet
  wallet: {
    getBalance: () => apiClient.get('/users/wallet/balance'),
    addMoney: (amount, paymentMethod) =>
      apiClient.post('/users/wallet/add', { amount, paymentMethod }),
    getTransactions: (params = {}) =>
      apiClient.get('/users/wallet/transactions', { params }),
    useWallet: (amount) => apiClient.post('/users/wallet/use', { amount }),
  },

  // Coupons
  coupons: {
    getAvailable: () => apiClient.get('/coupons/available'),
    validate: (code, orderAmount) =>
      apiClient.post('/coupons/validate', { code, orderAmount }),
    apply: (code) => apiClient.post('/coupons/apply', { code }),
  },

  // Notifications
  notifications: {
    getAll: (params = {}) => apiClient.get('/notifications', { params }),
    markAsRead: (notificationId) =>
      apiClient.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => apiClient.put('/notifications/mark-all-read'),
    updatePreferences: (preferences) =>
      apiClient.put('/users/notification-preferences', preferences),
  },

  // Support
  support: {
    submitContactForm: (data) => apiClient.post('/support/contact', data),
    getChatHistory: () => apiClient.get('/support/chat/history'),
    sendMessage: (message) =>
      apiClient.post('/support/chat/message', { message }),
  },

  // Location
  location: {
    detectFromCoordinates: (coordinates) =>
      apiClient.post('/location/detect', { coordinates }),
    searchPlaces: (query, lat, lng) => {
      const params = { query };
      if (lat && lng) { params.lat = lat; params.lng = lng; }
      return apiClient.get('/location/search', { params });
    },
    getCities: () => apiClient.get('/cities'),
  },

  // Cuisines
  cuisines: {
    getAll: () => apiClient.get('/cuisines'),
  },

  // Admin Panel
  admin: {
    setupDemo: () => apiClient.post('/admin/setup-demo'),
    verifyPhone: (data) => apiClient.post('/auth/admin/send-otp', { phone: data.phone }),
    login: (data) => apiClient.post('/auth/admin/verify-otp', data),
    getProfile: () =>
      apiClient.get('/admin/profile', { headers: adminAuthHeader() }),
    getDashboardStats: () =>
      apiClient.get('/admin/dashboard/stats', { headers: adminAuthHeader() }),
    getUsers: (params = {}) =>
      apiClient.get('/admin/users', { params, headers: adminAuthHeader() }),
    toggleUserStatus: (userId, isActive) =>
      apiClient.post(`/admin/users/${userId}/toggle-status`, null, {
        params: { is_active: isActive },
        headers: adminAuthHeader(),
      }),
    getPendingRestaurants: () =>
      apiClient.get('/admin/restaurants/pending', { headers: adminAuthHeader() }),
    approveRestaurant: (restaurantId, status, comment) =>
      apiClient.post(`/admin/restaurants/${restaurantId}/approve`, null, {
        params: { status, comment },
        headers: adminAuthHeader(),
      }),
    getBanners: () =>
      apiClient.get('/admin/banners', { headers: adminAuthHeader() }),
    createBanner: (data) =>
      apiClient.post('/admin/banners', data, { headers: adminAuthHeader() }),
    getSettings: () =>
      apiClient.get('/admin/settings', { headers: adminAuthHeader() }),
    updateSettings: (data) =>
      apiClient.post('/admin/settings', data, { headers: adminAuthHeader() }),

    // Coupon management
    getCoupons: () =>
      apiClient.get('/admin/coupons', { headers: adminAuthHeader() }),
    createCoupon: (data) =>
      apiClient.post('/admin/coupons', data, { headers: adminAuthHeader() }),
    updateCoupon: (couponId, data) =>
      apiClient.put(`/admin/coupons/${couponId}`, data, { headers: adminAuthHeader() }),
    deleteCoupon: (couponId) =>
      apiClient.delete(`/admin/coupons/${couponId}`, { headers: adminAuthHeader() }),
    toggleCoupon: (couponId) =>
      apiClient.post(`/admin/coupons/${couponId}/toggle`, null, { headers: adminAuthHeader() }),

    // Financial reports
    getFinancialStats: (period = 'month') =>
      apiClient.get('/admin/financial/stats', { params: { period }, headers: adminAuthHeader() }),
    getFinancialTransactions: (params = {}) =>
      apiClient.get('/admin/financial/transactions', { params, headers: adminAuthHeader() }),

    // Ratings
    getRatings: (params = {}) =>
      apiClient.get('/admin/ratings', { params, headers: adminAuthHeader() }),

    // Order management
    getOrders: (params = {}) =>
      apiClient.get('/admin/orders', { params, headers: adminAuthHeader() }),
    updateOrderStatus: (orderId, statusData) =>
      apiClient.post(`/admin/orders/${orderId}/update-status`, statusData, { headers: adminAuthHeader() }),
  },
};

export { api };
export default api;
