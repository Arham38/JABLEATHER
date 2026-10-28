import axios from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach bearer token if available and validate production API URL
apiClient.interceptors.request.use(
  (config) => {
    if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
      return Promise.reject(
        new Error('Missing required environment variable VITE_API_URL in production build.')
      );
    }
    const token = storage.get('jab_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses and error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
