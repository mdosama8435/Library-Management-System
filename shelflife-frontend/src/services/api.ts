import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface NormalizedError {
  message: string;
  statusCode?: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('shelflife_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Parse standardized backend error message and handle 401s
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; message?: string }>) => {
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    const normalizedError: NormalizedError = {
      message: backendMessage || error.message || 'An unexpected error occurred. Please try again.',
      statusCode,
    };

    // If token is invalid or expired, clear session
    if (statusCode === 401) {
      localStorage.removeItem('shelflife_token');
      localStorage.removeItem('shelflife_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
