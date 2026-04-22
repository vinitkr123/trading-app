import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
};

// Stocks
export const stocksAPI = {
  search: (query: string) => api.get(`/stocks/search?q=${query}`),
  quote: (symbol: string) => api.get(`/stocks/${symbol}/quote`),
  chart: (symbol: string, interval: string = '1D') =>
    api.get(`/stocks/${symbol}/chart?interval=${interval}`),
  topMovers: () => api.get('/stocks/movers'),
};

// Portfolio
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  orders: () => api.get('/portfolio/orders'),
};

// Orders
export const ordersAPI = {
  place: (order: {
    symbol: string;
    type: string;
    orderType: string;
    quantity: number;
    price?: number;
  }) => api.post('/orders', order),
  cancel: (orderId: string) => api.delete(`/orders/${orderId}`),
};

// Watchlists
export const watchlistAPI = {
  getAll: () => api.get('/watchlists'),
  create: (name: string) => api.post('/watchlists', { name }),
  delete: (id: string) => api.delete(`/watchlists/${id}`),
  addStock: (id: string, symbol: string) =>
    api.post(`/watchlists/${id}/stocks`, { symbol }),
  removeStock: (id: string, symbol: string) =>
    api.delete(`/watchlists/${id}/stocks/${symbol}`),
};

export default api;
