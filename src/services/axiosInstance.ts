import axios from 'axios';
import { Platform } from 'react-native';

// Configure the base URL to connect to the user's backend API
// This function determines the best API URL based on platform
const getApiBaseUrl = () => {
  // For web, use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:2100';
  }
  
  // For Android emulator, use 10.0.2.2 (special IP to reach host machine)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:2100';
  }
  
  // For iOS simulator, use localhost
  if (Platform.OS === 'ios') {
    return 'http://localhost:2100';
  }
  
  // Default fallback - you may need to replace this with your actual IP address
  return 'http://192.168.1.100:2100';
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  }
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add custom headers for mobile platforms if needed
    if (Platform.OS !== 'web') {
      // Get token from secure storage in a real implementation
      const token = null; // Replace with actual token retrieval
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // For web, get from localStorage
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        // Handle mobile authentication expiration
        // Implement your navigation logic here
        console.log('Authentication expired. Redirecting to login...');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
