import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
const API_URL = configuredUrl
  ? Platform.OS === 'android'
    ? configuredUrl.replace('://localhost', '://10.0.2.2')
    : configuredUrl
  : `http://${defaultHost}:5000/api`;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
