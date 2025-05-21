import axios from 'axios';

// Configure the base URL to connect to the user's backend API
const API_BASE_URL = 'http://localhost:2500/api';

// Create an axios instance with the base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// API endpoints for download functionality
export const downloadAPI = {
  // Get information about media (available formats, duration, etc.)
  getMediaInfo: async (url: string) => {
    try {
      const response = await apiClient.get('/media/info', {
        params: { url },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching media info:', error);
      throw error;
    }
  },
  
  // Start the download process
  downloadMedia: async (options: {
    url: string;
    format?: string;
    quality?: string;
    type?: 'video' | 'audio' | 'image';
  }) => {
    try {
      const response = await apiClient.post('/media/download', options);
      return response.data;
    } catch (error) {
      console.error('Error downloading media:', error);
      throw error;
    }
  },
  
  // Get download status
  getDownloadStatus: async (downloadId: string) => {
    try {
      const response = await apiClient.get(`/media/status/${downloadId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting download status:', error);
      throw error;
    }
  },
};

// API endpoints for user-related functionality
export const userAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
};

// API endpoints for platform-specific functionality
export const platformAPI = {
  connectPlatform: async (platform: string, credentials: any) => {
    try {
      const response = await apiClient.post(`/platforms/connect/${platform}`, credentials);
      return response.data;
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      throw error;
    }
  },
  
  getConnectedPlatforms: async () => {
    try {
      const response = await apiClient.get('/platforms/connected');
      return response.data;
    } catch (error) {
      console.error('Error fetching connected platforms:', error);
      throw error;
    }
  },
};

// Mock API for testing without the backend
export const mockAPI = {
  getMediaInfo: (url: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const platform = detectPlatformFromUrl(url);
        resolve({
          title: 'Sample Video Title',
          duration: 180, // 3 minutes
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          platform,
          formats: ['mp4', 'webm', 'mp3'],
          qualities: ['1080p', '720p', '480p', '360p'],
          audioQualities: ['high', 'medium', 'low'],
          author: 'Content Creator',
          url,
        });
      }, 1000);
    });
  },
  
  downloadMedia: (options: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          downloadId: 'mock-download-' + Math.random().toString(36).substring(7),
          title: 'Sample Video Title',
          url: options.url,
          format: options.format || 'mp4',
          quality: options.quality || '720p',
          type: options.type || 'video',
        });
      }, 1500);
    });
  },
  
  getDownloadStatus: (downloadId: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          downloadId,
          status: 'completed',
          progress: 100,
          fileUrl: 'https://example.com/downloads/sample.mp4',
        });
      }, 800);
    });
  },
};

// Utility function to detect platform from URL
export function detectPlatformFromUrl(url: string): string {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  } else if (lowerUrl.includes('instagram.com')) {
    return 'instagram';
  } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  } else if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  } else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
    return 'facebook';
  } else {
    return 'unknown';
  }
}

// Log user activity
export const logActivity = async (activityData: any) => {
  try {
    const response = await apiClient.post('/logs/activity', activityData);
    return response.data;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Silently fail for logging errors
    return null;
  }
};

// Export the API client for custom requests
export default apiClient;