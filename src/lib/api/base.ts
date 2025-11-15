import axios from 'axios';
import { logger } from '@/lib/utils/logger';
import { getAuthToken, clearAuthData } from '@/lib/utils/auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization token handling for Django REST Framework
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
      
    } else {
      logger.warn('No auth token found in localStorage');
    }
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logger.exception('Authentication failed - token may be invalid or expired');
      if (typeof window !== 'undefined') {
        clearAuthData();
      }
    }
    return Promise.reject(error);
  }
);



export { API_BASE_URL };