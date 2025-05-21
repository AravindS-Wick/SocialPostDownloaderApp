import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

// Create Axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: Platform.OS === 'web' ? 'http://localhost:2500' : 'http://localhost:2500',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions for downloading content
export const getVideoInfo = async (url: string, platform: string) => {
  try {
    const response = await apiClient.post('/download', { url, platform });
    return response.data;
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw new Error('Failed to get video information. Please check the URL and try again.');
  }
};

export const streamVideo = async (url: string, itag: string) => {
  try {
    const response = await apiClient.get('/stream', {
      params: { url, itag },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error streaming video:', error);
    throw new Error('Failed to stream video. Please try again.');
  }
};

// Authentication functions
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, error: error.response.data.message || 'Login failed' };
    }
    return { success: false, error: 'Login failed' };
  }
};

export const socialLogin = async (platform: string) => {
  try {
    const response = await apiClient.post(`/connect/${platform.toLowerCase()}`);
    return { success: true, ...response.data };
  } catch (error) {
    console.error(`${platform} login error:`, error);
    return { success: false, error: `Failed to connect to ${platform}` };
  }
};

export const logActivity = async (data: {
  email?: string;
  type: string;
  status: 'attempt' | 'complete' | 'consent';
  meta: any;
  ageConsent: boolean;
}) => {
  try {
    const response = await apiClient.post('/log', data);
    return response.data;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw here, just log the error
    return { success: false };
  }
};

export default apiClient;
