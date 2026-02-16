import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const API_REQUEST_TIMEOUT_MS = 60000;
const DOWNLOAD_TIMEOUT_MS = 180000;

// Single source of truth: API_BASE_URL from constants.ts
export const API_HOST_URL = API_BASE_URL;

const resolveEndpointUrl = (endpoint: string): string => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http')) return endpoint;
  if (endpoint.startsWith('/')) return `${API_BASE_URL}${endpoint}`;
  return `${API_BASE_URL}/${endpoint}`;
};

// API client
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_REQUEST_TIMEOUT_MS,
});

// API endpoints
const endpoints = {
  mediaInfo: '/api/info',
  download: '/api/download',
  status: '/api/media/status/',
};

// Default format strings
const DEFAULT_VIDEO_FORMAT = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo[ext=mp4]/best[ext=mp4]/best';
const DEFAULT_AUDIO_FORMAT = 'bestaudio[ext=m4a]/bestaudio/best';

const getFormatForType = (type?: 'video' | 'audio' | 'image') => {
  return type === 'audio' ? DEFAULT_AUDIO_FORMAT : DEFAULT_VIDEO_FORMAT;
};

// Check if the API server is available
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await axios.get(resolveEndpointUrl('/health'), { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Download API
export const downloadAPI = {
  getMediaInfo: async (url: string) => {
    try {
      const directUrl = resolveEndpointUrl(endpoints.mediaInfo);
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
      try {
        const response = await axios.get(directUrl, {
          params: { url },
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutHandle);
        return response.data;
      } catch (err) {
        clearTimeout(timeoutHandle);
        throw err;
      }
    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
        const detailedError = new Error(errorMsg);
        Object.assign(detailedError, { response: error.response });
        throw detailedError;
      } else if (error.request) {
        throw new Error('Unable to reach server. Please check your connection.');
      }
      throw error;
    }
  },

  downloadMedia: async (options: {
    url: string;
    format?: string;
    quality?: string;
    type?: 'video' | 'audio' | 'image';
    useAutoFormat?: boolean;
  }) => {
    const payload = {
      ...options,
      format: options.format || getFormatForType(options.type),
      quality: options.quality || 'medium',
    };

    try {
      const directUrl = resolveEndpointUrl(endpoints.download);
      const response = await axios.post(directUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: DOWNLOAD_TIMEOUT_MS,
      });
      return response.data;
    } catch (error: any) {
      // If format not available, retry with auto format
      if (error?.response?.data?.error?.includes('Requested format is not available') || error?.response?.status === 400) {
        const autoPayload = {
          ...options,
          format: getFormatForType(options.type),
          quality: options.quality || 'medium',
          useAutoFormat: true,
        };
        const directUrl = resolveEndpointUrl(endpoints.download);
        const response = await axios.post(directUrl, autoPayload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: DOWNLOAD_TIMEOUT_MS,
        });
        return response.data;
      }

      if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.message || error.message;
        const detailedError = new Error(errorMsg);
        Object.assign(detailedError, { response: error.response });
        throw detailedError;
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      }
      throw error;
    }
  },

  getDownloadStatus: async (downloadId: string) => {
    try {
      const directUrl = `${resolveEndpointUrl(endpoints.status)}${downloadId}`;
      const response = await axios.get(directUrl, {
        headers: { 'Content-Type': 'application/json' },
        timeout: DOWNLOAD_TIMEOUT_MS,
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.error || `Status check failed (${error.response.status})`);
      }
      throw error;
    }
  },
};

// User API
export const userAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getUserProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },
};

// Platform API
export const platformAPI = {
  connectPlatform: async (platform: string, credentials: any) => {
    const response = await apiClient.post(`/platforms/connect/${platform}`, credentials);
    return response.data;
  },

  getConnectedPlatforms: async () => {
    const response = await apiClient.get('/platforms/connected');
    return response.data;
  },
};

// Utility: detect platform from URL
export function detectPlatformFromUrl(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'facebook';
  return 'unknown';
}

// Mock API for fallback when backend is unavailable
export const mockAPI = {
  getMediaInfo: (url: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: 'Sample Video Title',
          duration: 180,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          platform: detectPlatformFromUrl(url),
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

export default apiClient;
