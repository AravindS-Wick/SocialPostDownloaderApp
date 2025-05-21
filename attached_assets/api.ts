import axios from 'axios';
import { Platform } from 'react-native';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: Platform.OS === 'web' ? '/api' : 'http://localhost:2500/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      console.error('Response Error:', error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Handle unauthorized access
        // You might want to redirect to login screen or refresh token
      }
    } else if (error.request) {
      // No response received
      console.error('Request Error:', error.request);
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor to add authentication tokens
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from store or localStorage/AsyncStorage
      const token = localStorage.getItem('auth_token'); // In a real app, use AsyncStorage for React Native
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Request Interceptor Error:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
export const downloadAPI = {
  // Get information about a URL
  getUrlInfo: (url: string, platform: string = 'auto') => 
    api.get('/download/info', { params: { url, platform } }),
  
  // Download content from URL
  downloadContent: (url: string, options: {
    platform?: string;
    type?: 'video' | 'audio';
    quality?: string;
    format?: string;
  }) => api.post('/download', { url, ...options }),
  
  // Get download status
  getDownloadStatus: (downloadId: string) =>
    api.get(`/download/status/${downloadId}`),
  
  // Get download history
  getDownloadHistory: (page: number = 1, limit: number = 20) =>
    api.get('/download/history', { params: { page, limit } }),
  
  // Clear download history
  clearDownloadHistory: () => api.delete('/download/history'),
};

export const userAPI = {
  // User login
  login: (email: string, password: string) =>
    api.post('/user/login', { email, password }),
  
  // User registration
  register: (userData: {
    email: string;
    password: string;
    username?: string;
  }) => api.post('/user/register', userData),
  
  // Get user profile
  getProfile: () => api.get('/user/profile'),
  
  // Update user profile
  updateProfile: (profileData: any) =>
    api.put('/user/profile', profileData),
  
  // Get user settings
  getSettings: () => api.get('/user/settings'),
  
  // Update user settings
  updateSettings: (settings: any) =>
    api.put('/user/settings', settings),
};

export const platformAPI = {
  // Connect platform
  connectPlatform: (platform: string, authData: any) =>
    api.post(`/platform/connect/${platform}`, authData),
  
  // Disconnect platform
  disconnectPlatform: (platform: string) =>
    api.post(`/platform/disconnect/${platform}`),
  
  // Get connected platforms
  getPlatforms: () => api.get('/platform/list'),
  
  // Update platform settings
  updatePlatformSettings: (platform: string, settings: any) =>
    api.put(`/platform/settings/${platform}`, settings),
};

// Mock API implementation for development
// These functions simulate API responses for local development
export const mockAPI = {
  getDownloadInfo: (url: string) => {
    // Detect platform from URL
    const platform = detectPlatformFromUrl(url);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            url,
            platform,
            title: `Sample ${platform} content ${Math.floor(Math.random() * 1000)}`,
            thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200`,
            duration: Math.floor(Math.random() * 600), // 0-600 seconds
            isAgeRestricted: Math.random() > 0.7, // 30% chance to be age restricted
            formats: [
              { quality: 'high', formatId: 'high', fileSize: '15MB' },
              { quality: 'medium', formatId: 'medium', fileSize: '8MB' },
              { quality: 'low', formatId: 'low', fileSize: '4MB' },
            ],
            author: `${platform}User${Math.floor(Math.random() * 100)}`,
            description: `This is a sample ${platform} content for testing purposes.`,
          }
        });
      }, 500);
    });
  },
  
  downloadContent: (url: string, options: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            downloadId: `download_${Date.now()}`,
            url,
            title: `Downloaded ${options.type || 'video'} from ${detectPlatformFromUrl(url)}`,
            fileUrl: 'file:///path/to/downloaded/content.mp4',
            thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200`,
            status: 'completed',
            platform: detectPlatformFromUrl(url),
            type: options.type || 'video',
            quality: options.quality || 'high',
            createdAt: new Date().toISOString(),
          }
        });
      }, 1500);
    });
  },
  
  getDownloadHistory: () => {
    return new Promise((resolve) => {
      const history = Array(10).fill(0).map((_, index) => ({
        id: `history_${index}`,
        url: `https://example.com/video${index}`,
        title: `Downloaded content ${index}`,
        thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200`,
        platform: ['youtube', 'instagram', 'twitter', 'facebook', 'tiktok'][Math.floor(Math.random() * 5)],
        type: Math.random() > 0.3 ? 'video' : 'audio',
        quality: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - index * 86400000).toISOString(), // Past days
        fileSize: `${Math.floor(Math.random() * 20)}MB`,
      }));
      
      setTimeout(() => {
        resolve({
          data: {
            history,
            total: 25,
            page: 1,
            limit: 10,
          }
        });
      }, 700);
    });
  },
};

// Helper function to detect platform from URL
export function detectPlatformFromUrl(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  } else if (urlLower.includes('instagram.com')) {
    return 'instagram';
  } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter';
  } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return 'facebook';
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  }
  
  return 'unknown';
}

export default api;
