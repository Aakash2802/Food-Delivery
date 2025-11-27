import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login/signup pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  addAddress: (data) => api.post('/auth/address', data),
  updateAddress: (id, data) => api.put(`/auth/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
};

// Restaurant API
export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getByVendor: () => api.get('/restaurants/vendor/restaurant'),
  create: (data) => api.post('/restaurants/vendor/restaurant', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  updateVendor: (data) => api.put('/restaurants/vendor/restaurant', data),
  delete: (id) => api.delete(`/restaurants/${id}`),
  toggleStatus: (id, data) => api.patch(`/restaurants/${id}/status`, data),
  toggleVendorStatus: () => api.patch('/restaurants/vendor/restaurant/status'),
};

// Menu API
export const menuAPI = {
  getRestaurantMenu: (restaurantId, params = {}) => api.get(`/menu/restaurants/${restaurantId}/menu`, { params }),
  getMenuItem: (itemId) => api.get(`/menu/${itemId}`),
  create: (data) => api.post('/menu/vendor/menu', data),
  update: (itemId, data) => api.put(`/menu/vendor/menu/${itemId}`, data),
  delete: (itemId) => api.delete(`/menu/vendor/menu/${itemId}`),
  toggleAvailability: (itemId, data) => api.patch(`/menu/vendor/menu/${itemId}/availability`, data),
  search: (query) => api.get('/menu/search', { params: { query: query } }),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/vendor/${id}/status`, data),
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),
  getStats: (params) => api.get('/orders/stats', { params }),
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create', data),
  verify: (data) => api.post('/payments/verify', data),
  mock: (data) => api.post('/payments/mock', data),
  getHistory: (params) => api.get('/payments/history', { params }),
};

// Driver API
export const driverAPI = {
  updateLocation: (data) => api.patch('/driver/location', data),
  toggleAvailability: (data) => api.patch('/driver/availability', data),
  getOrders: () => api.get('/driver/orders'),
  acceptOrder: (id) => api.post(`/driver/orders/${id}/accept`),
  rejectOrder: (id, data) => api.post(`/driver/orders/${id}/reject`, data),
  updateOrderStatus: (id, data) => api.patch(`/orders/driver/${id}/status`, data),
  getEarnings: (params) => api.get('/driver/earnings', { params }),
  getStats: () => api.get('/driver/stats'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data),
  getDrivers: () => api.get('/admin/drivers'),
  getLiveOrders: () => api.get('/admin/orders/live'),
  getRevenue: (params) => api.get('/admin/reports/revenue', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getPromos: () => api.get('/promos/admin/all'),
  createPromo: (data) => api.post('/promos/admin/create', data),
  updatePromo: (id, data) => api.put(`/promos/admin/${id}`, data),
  deletePromo: (id) => api.delete(`/promos/admin/${id}`),
  togglePromo: (id) => api.patch(`/promos/admin/${id}/toggle`),
  getAllRestaurants: () => api.get('/admin/restaurants'),
  approveRestaurant: (restaurantId) => api.patch(`/admin/restaurants/${restaurantId}/approve`),
  rejectRestaurant: (restaurantId) => api.patch(`/admin/restaurants/${restaurantId}/reject`),
};

// Review API
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getRestaurantReviews: (restaurantId, params) => api.get(`/reviews/restaurant/${restaurantId}`, { params }),
  getReviewByOrder: (orderId) => api.get(`/reviews/order/${orderId}`),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  respondToReview: (reviewId, data) => api.post(`/reviews/${reviewId}/respond`, data),
};

// Loyalty API
export const loyaltyAPI = {
  getSummary: () => api.get('/loyalty/summary'),
  redeem: (data) => api.post('/loyalty/redeem', data),
  getTransactions: (params) => api.get('/loyalty/transactions', { params }),
};

// Promo Code API
export const promoAPI = {
  getActive: () => api.get('/promos'),
  validate: (data) => api.post('/promos/validate', data),
  apply: (data) => api.post('/promos/apply', data),
};

// Address API
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getOne: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
};

export default api;
