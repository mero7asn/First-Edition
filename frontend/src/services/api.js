import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const INTEGRITY_SECRET = process.env.REACT_APP_INTEGRITY_SECRET || '';

const hmac = (payload) =>
  CryptoJS.HmacSHA256(payload, INTEGRITY_SECRET).toString(CryptoJS.enc.Hex);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Outgoing: attach JWT + sign request body
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const methods = ['post', 'put', 'patch'];
  if (methods.includes(config.method) && config.data) {
    const payload = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    config.headers['X-Request-Signature'] = hmac(payload);
  }

  return config;
});

// Incoming: verify response signature + normalize errors
api.interceptors.response.use(
  (response) => {
    const signature = response.headers['x-response-signature'];
    if (signature && response.data) {
      const payload = JSON.stringify(response.data);
      const expected = hmac(payload);
      if (signature !== expected) {
        return Promise.reject({ displayMessage: 'Response integrity check failed. Data may have been tampered.' });
      }
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...error, displayMessage: message });
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addToWishlist: (productId) => api.post('/auth/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/auth/wishlist/${productId}`)
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  toggleAvailability: (id) => api.patch(`/products/${id}/toggle-availability`),
  delete: (id) => api.delete(`/products/${id}`)
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data),
  getStats: () => api.get('/orders/stats')
};

export const dropAPI = {
  getAll: (params) => api.get('/drops', { params }),
  getOne: (id) => api.get(`/drops/${id}`),
  create: (data) => api.post('/drops', data),
  update: (id, data) => api.put(`/drops/${id}`, data),
  delete: (id) => api.delete(`/drops/${id}`),
  subscribe: (id) => api.post(`/drops/${id}/subscribe`),
  launch: (id) => api.post(`/drops/${id}/launch`)
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`)
};

export const cmsAPI = {
  getActiveBanners: () => api.get('/cms/banners/active'),
  getAllBanners: () => api.get('/cms/banners'),
  createBanner: (data) => api.post('/cms/banners', data),
  updateBanner: (id, data) => api.put(`/cms/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/cms/banners/${id}`),
  subscribeNewsletter: (email) => api.post('/cms/newsletter', { email })
};

export const uploadAPI = {
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
};

export default api;
