import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.64:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT on every request
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and let the navigator react
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // useAuthStore will detect the cleared token via its listener
    }
    return Promise.reject(error);
  }
);

// Extract the error message from the standard {"error": "message"} shape
export function getErrorMessage(error) {
  return error.response?.data?.error || error.message || 'Something went wrong';
}

export default client;
