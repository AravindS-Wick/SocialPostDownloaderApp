import axios from 'axios';
import { Platform } from 'react-native';

// Configure the base URL to connect to the user's backend API
// This function determines the best API URL based on platform
const getApiBaseUrl = () => {
  console.log('=== DETERMINING API BASE URL ===');
  console.log('Platform.OS:', Platform.OS);
  
  // For web, use localhost
  if (Platform.OS === 'web') {
    console.log('Using web API URL: http://localhost:2500/api');
    return 'http://localhost:2500/api';
  }
  
  // For Android emulator, use 10.0.2.2 (special IP to reach host machine)
  if (Platform.OS === 'android') {
    console.log('Using Android API URL: http://10.0.2.2:2500/api');
    return 'http://10.0.2.2:2500/api';
  }
  
  // For iOS simulator, use localhost
  if (Platform.OS === 'ios') {
    console.log('Using iOS API URL: http://localhost:2500/api');
    return 'http://localhost:2500/api';
  }
  
  // Default fallback - you may need to replace this with your actual IP address
  // when testing on physical devices
  console.log('Using default fallback API URL: http://192.168.1.100:2500/api');
  return 'http://192.168.1.100:2500/api'; // Replace with your computer's IP address
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used
console.log(`Using API URL: ${API_BASE_URL} on platform: ${Platform.OS}`);

// Check if the API server is available
export const checkApiAvailability = async () => {
  console.log('=== CHECKING API SERVER AVAILABILITY ===');
  console.log('API base URL:', API_BASE_URL);
  const healthEndpoint = `${API_BASE_URL.replace('/api', '')}/health`;
  console.log('Health check endpoint:', healthEndpoint);
  
  try {
    console.log('Sending health check request...');
    const response = await axios.get(healthEndpoint, { 
      timeout: 5000 
    });
    
    console.log('Health check response status:', response.status);
    console.log('Health check response data:', JSON.stringify(response.data));
    
    if (response.status === 200) {
      console.log('✅ API server is available and healthy');
      return true;
    }
    
    console.warn('⚠️ API server responded with non-200 status:', response.status);
    return false;
  } catch (error: any) {
    console.error('❌ API server health check failed');
    console.error('Error message:', error?.message || 'Unknown error');
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('No response received. Request details:', JSON.stringify(error.request));
    }
    
    console.warn('API server is not available, will use mock data');
    return false;
  }
};

// Run the check when the app starts
console.log('Initiating API availability check on app start');
checkApiAvailability()
  .then(isAvailable => {
    console.log('API availability check completed. Available:', isAvailable);
    
    // If API is available, test a direct axios call to verify
    if (isAvailable) {
      console.log('=== TESTING DIRECT AXIOS CALL ===');
      
      // Run API discovery
      console.log('Running API discovery on startup');
      discoverApiEndpoints().catch(error => {
        console.error('Error during API discovery:', error);
      });
      
      axios.get(`${API_BASE_URL.replace('/api', '')}/health`)
        .then(response => {
          console.log('Direct axios call successful:', response.status);
          console.log('Response data:', JSON.stringify(response.data));
          console.log('Health check successful, proceeding with media info test');
          
          console.log('API server check complete.');
        })
        .catch(error => {
          console.error('Direct axios call failed:', error?.message || 'Unknown error');
          if (error.response) {
            console.error('Error response:', error.response.status, JSON.stringify(error.response.data));
          } else if (error.request) {
            console.error('No response received. Request details:', JSON.stringify(error.request));
          }
        });
    }
  })
  .catch(error => {
    console.error('Unexpected error during API availability check:', error);
  });

// Create an axios instance with the base URL
console.log('Creating API client with base URL:', API_BASE_URL);

// Try to import the custom axios instance if available
let apiClient;
try {
  // Dynamic import to avoid circular dependencies
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });
  
  // Use the imported axios instance configuration if available
  import('./axiosInstance').then(module => {
    const axiosInstance = module.default;
    // Only update the baseURL to keep our API paths working
    apiClient.defaults.baseURL = API_BASE_URL;
    apiClient.defaults.timeout = axiosInstance.defaults.timeout;
    apiClient.defaults.headers = {
      ...axiosInstance.defaults.headers,
      ...apiClient.defaults.headers
    };
    console.log('Successfully imported and configured custom axios instance');
  }).catch(err => {
    console.log('Using default axios instance, custom import failed:', err.message);
  });
} catch (error) {
  console.log('Error configuring axios, using default:', error);
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });
}

// Log the created client
console.log('API client created with config:', {
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
  headers: apiClient.defaults.headers
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  config => {
    console.log('=== API REQUEST INTERCEPTOR ===');
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request URL:', `${config.baseURL}${config.url}`);
    console.log('Request params:', config.params);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error: any) => {
    console.error('=== API REQUEST ERROR INTERCEPTOR ===');
    console.error('API Request Error:', error?.message || 'Unknown error');
    console.error('Error details:', JSON.stringify(error));
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('=== API RESPONSE INTERCEPTOR ===');
    console.log(`API Response: ${response.status} ${response.config.url}`);
    console.log('Response data:', JSON.stringify(response.data));
    console.log('Response headers:', response.headers);
    return response;
  },
  (error: any) => {
    console.error('=== API RESPONSE ERROR INTERCEPTOR ===');
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      console.error('Response headers:', error.response.headers);
      console.error('Request that caused the error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        data: error.config?.data,
        params: error.config?.params
      });
    } else if (error.request) {
      console.error('API No Response - Request was made but no response received');
      console.error('Request details:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        data: error.config?.data,
        params: error.config?.params
      });
      console.error('Request object:', JSON.stringify(error.request));
    } else {
      console.error('API Error:', error.message || 'Unknown error');
      console.error('Error details:', JSON.stringify(error));
    }
    return Promise.reject(error);
  }
);

// Default format string that matches the backend youtube-dl format
const DEFAULT_VIDEO_FORMAT = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo[ext=mp4]/best[ext=mp4]/best';
const DEFAULT_AUDIO_FORMAT = 'bestaudio[ext=m4a]/bestaudio/best';

// Helper function to get the appropriate format based on content type
const getFormatForType = (type?: 'video' | 'audio' | 'image') => {
  if (type === 'audio') {
    return DEFAULT_AUDIO_FORMAT;
  }
  return DEFAULT_VIDEO_FORMAT;
};

// Store discovered API endpoints
let discoveredEndpoints = {
  mediaInfo: '/media/info',
  download: '/download',
  status: '/media/status'
};

// Function to update discovered endpoints
export const updateDiscoveredEndpoints = (endpoints: {
  mediaInfo?: string;
  download?: string;
  status?: string;
}) => {
  console.log('Updating discovered endpoints:', endpoints);
  discoveredEndpoints = { ...discoveredEndpoints, ...endpoints };
  console.log('New endpoints:', discoveredEndpoints);
};

// API endpoints for download functionality
export const downloadAPI = {
  // Get information about media (available formats, duration, etc.)
  getMediaInfo: async (url: string) => {
    console.log('=== API SERVICE: getMediaInfo CALLED ===');
    console.log('URL parameter:', url);
    console.log('API base URL being used:', API_BASE_URL);
    
    try {
      console.log('Making GET request to /media/info with params:', { url });
      
      // Try with direct axios call first
      try {
        const endpoint = discoveredEndpoints.mediaInfo;
        console.log('Using discovered media info endpoint:', endpoint);
        console.log('Attempting direct axios call to:', `${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}?url=${encodeURIComponent(url)}`);
        const directResponse = await axios.get(`${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}`, {
          params: { url },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        });
        console.log('Direct axios call successful:', directResponse.status);
        console.log('Response data:', JSON.stringify(directResponse.data));
        return directResponse.data;
      } catch (directError: any) {
        console.error('Direct axios call failed:', directError?.message || 'Unknown error');
        console.error('Falling back to apiClient...');
        
        // Fall back to apiClient
        const endpoint = discoveredEndpoints.mediaInfo;
        console.log('Falling back to apiClient with endpoint:', endpoint);
        const response = await apiClient.get(endpoint, {
          params: { url },
        });
        console.log('Media info API response status:', response.status);
        console.log('Media info API response data:', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error: any) {
      console.error('=== API SERVICE: getMediaInfo ERROR ===');
      console.error('Error fetching media info:', error?.message || 'Unknown error');
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('No response received from server. Request details:', JSON.stringify(error.request));
      }
      console.error('Request was to:', `${API_BASE_URL}/media/info?url=${encodeURIComponent(url)}`);
      throw error;
    }
  },
  
  // Start the download process
  downloadMedia: async (options: {
    url: string;
    format?: string;
    quality?: string;
    type?: 'video' | 'audio' | 'image';
    useAutoFormat?: boolean;
  }) => {
    console.log('=== API SERVICE: downloadMedia CALLED ===');
    
    // Set default format to match backend format string if not specified
    const updatedOptions = {
      ...options,
      format: options.format || getFormatForType(options.type),
      quality: options.quality || 'medium'
    };
    
    console.log('Options (with defaults):', JSON.stringify(updatedOptions));
    console.log('API base URL being used:', API_BASE_URL);
    
    try {
      console.log('Making POST request to /media/download with data:', JSON.stringify(updatedOptions));
      
      // Try with direct axios call first
      try {
        const endpoint = discoveredEndpoints.download;
        console.log('Using discovered download endpoint:', endpoint);
        console.log('Attempting direct axios call to:', `${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}`);
        
        // First try with the specified format
        try {
          console.log('Trying with specified format:', updatedOptions.format, 'and quality:', updatedOptions.quality);
          const directResponse = await axios.post(`${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}`, updatedOptions, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000
          });
          console.log('Direct axios call successful:', directResponse.status);
          console.log('Response data:', JSON.stringify(directResponse.data));
          return directResponse.data;
        } catch (formatError: any) {
          console.error('Error with specified format:', formatError?.message || 'Unknown error');
          
          // If the error is about format not being available, try with auto format
          if (formatError?.response?.data?.error?.includes('Requested format is not available') || 
              formatError?.message?.includes('400')) {
            console.log('Format not available, trying with backend format string...');
            
            // Create a new options object with backend format string for testing
            const autoOptions = { 
              ...options, 
              format: getFormatForType(options.type), 
              quality: 'medium',
              useAutoFormat: true 
            };
            
            console.log('Trying with backend format string options:', JSON.stringify(autoOptions));
            const autoResponse = await axios.post(`${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}`, autoOptions, {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 30000
            });
            
            console.log('Auto format request successful:', autoResponse.status);
            console.log('Auto format response data:', JSON.stringify(autoResponse.data));
            return autoResponse.data;
          } else {
            // If it's a different error, rethrow it
            throw formatError;
          }
        }
      } catch (directError: any) {
        console.error('All direct axios calls failed:', directError?.message || 'Unknown error');
        console.error('Falling back to apiClient...');
        
        // Fall back to apiClient
        try {
          const endpoint = discoveredEndpoints.download;
          console.log('Falling back to apiClient with endpoint:', endpoint);
          
          // Try with backend format string for the fallback too
          const fallbackOptions = { 
            ...options, 
            format: getFormatForType(options.type), 
            quality: 'medium',
            useAutoFormat: true 
          };
          
          console.log('Trying apiClient with backend format string options:', JSON.stringify(fallbackOptions));
          const response = await apiClient.post(endpoint, fallbackOptions);
          console.log('Download media API response status:', response.status);
          console.log('Download media API response data:', JSON.stringify(response.data));
          return response.data;
        } catch (apiClientError: any) {
          console.error('apiClient fallback also failed:', apiClientError?.message || 'Unknown error');
          throw apiClientError;
        }
      }
    } catch (error: any) {
      console.error('=== API SERVICE: downloadMedia ERROR ===');
      console.error('Error downloading media:', error?.message || 'Unknown error');
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('No response received from server. Request details:', JSON.stringify(error.request));
      }
      console.error('Request was to:', `${API_BASE_URL}/media/download`);
      console.error('With payload:', JSON.stringify(options));
      throw error;
    }
  },
  
  // Get download status
  getDownloadStatus: async (downloadId: string) => {
    console.log('=== API SERVICE: getDownloadStatus CALLED ===');
    console.log('Download ID:', downloadId);
    console.log('API base URL being used:', API_BASE_URL);
    
    try {
      console.log('Making GET request to /media/status/' + downloadId);
      
      // Try with direct axios call first
      try {
        const endpoint = discoveredEndpoints.status;
        console.log('Using discovered status endpoint:', endpoint);
        console.log('Attempting direct axios call to:', `${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}${downloadId}`);
        const directResponse = await axios.get(`${endpoint.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${endpoint}${downloadId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        });
        console.log('Direct axios call successful:', directResponse.status);
        console.log('Response data:', JSON.stringify(directResponse.data));
        return directResponse.data;
      } catch (directError: any) {
        console.error('Direct axios call failed:', directError?.message || 'Unknown error');
        console.error('Falling back to apiClient...');
        
        // Fall back to apiClient
        const endpoint = discoveredEndpoints.status;
        console.log('Falling back to apiClient with endpoint:', endpoint);
        const response = await apiClient.get(`${endpoint}${downloadId}`);
        console.log('Download status API response status:', response.status);
        console.log('Download status API response data:', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error: any) {
      console.error('=== API SERVICE: getDownloadStatus ERROR ===');
      console.error('Error getting download status:', error?.message || 'Unknown error');
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('No response received from server. Request details:', JSON.stringify(error.request));
      }
      console.error('Request was to:', `${API_BASE_URL}/media/status/${downloadId}`);
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

// Utility function to discover available API endpoints
export const discoverApiEndpoints = async () => {
  console.log('=== DISCOVERING API ENDPOINTS ===');
  try {
    // Try to get the API documentation or available routes
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`);
    console.log('API root response:', response.status);
    console.log('API root data:', JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    console.error('Error discovering API endpoints:', error?.message || 'Unknown error');
    
    // Try some common endpoint patterns
    const endpointsToTry = [
      '/routes',
      '/endpoints',
      '/api-docs',
      '/swagger',
      '/docs',
      '/health',
      '/api',
      '/api/youtube',
      '/api/download',
      '/api/media',
      '/youtube',
      '/download',
      '/media'
    ];
    
    console.log('Trying common endpoint patterns...');
    
    for (const endpoint of endpointsToTry) {
      try {
        const response = await axios.get(`${API_BASE_URL.replace('/api', '')}${endpoint}`);
        console.log(`Endpoint ${endpoint} response:`, response.status);
        console.log(`Endpoint ${endpoint} data:`, JSON.stringify(response.data));
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} not available`);
      }
    }
    
    return null;
  }
};

// Utility function to test API endpoints directly
export const testApiEndpoints = async () => {
  console.log('=== TESTING API ENDPOINTS ===');
  const results = {
    health: false,
    mediaInfo: false,
    downloadMedia: false,
    downloadStatus: false
  };
  
  // Test health endpoint
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: 5000 });
    results.health = healthResponse.status === 200;
    console.log('Health endpoint test result:', results.health ? 'SUCCESS' : 'FAILED');
    console.log('Response:', JSON.stringify(healthResponse.data));
  } catch (error: any) {
    console.error('Health endpoint test failed:', error?.message || 'Unknown error');
  }
  
  // Test media info endpoint with a sample URL
  try {
    console.log('Testing media info endpoint...');
    const testUrl = 'https://youtu.be/uVC3iQtt6Hw?feature=shared';
    console.log('Testing media info with backend format string');
    const mediaInfoResponse = await apiClient.get('/media/info', { 
      params: { 
        url: testUrl,
        format: DEFAULT_VIDEO_FORMAT,
        quality: 'medium'
      } 
    });
    results.mediaInfo = mediaInfoResponse.status === 200;
    console.log('Media info endpoint test result:', results.mediaInfo ? 'SUCCESS' : 'FAILED');
    console.log('Response:', JSON.stringify(mediaInfoResponse.data));
  } catch (error: any) {
    console.error('Media info endpoint test failed:', error?.message || 'Unknown error');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
  }
  
  // Test download media endpoint with a sample URL
  try {
    console.log('Testing download media endpoint...');
    const testUrl = 'https://youtu.be/uVC3iQtt6Hw?feature=shared';
    console.log('Testing download with backend format string');
    const downloadResponse = await apiClient.post('/media/download', { 
      url: testUrl,
      format: DEFAULT_VIDEO_FORMAT,
      quality: 'medium',
      useAutoFormat: false,
      type: 'video'
    });
    results.downloadMedia = downloadResponse.status === 200;
    console.log('Download media endpoint test result:', results.downloadMedia ? 'SUCCESS' : 'FAILED');
    console.log('Response:', JSON.stringify(downloadResponse.data));
    
    // If we got a download ID, test the status endpoint
    if (downloadResponse.data && downloadResponse.data.downloadId) {
      try {
        console.log('Testing download status endpoint...');
        const statusResponse = await apiClient.get(`/media/status/${downloadResponse.data.downloadId}`);
        results.downloadStatus = statusResponse.status === 200;
        console.log('Download status endpoint test result:', results.downloadStatus ? 'SUCCESS' : 'FAILED');
        console.log('Response:', JSON.stringify(statusResponse.data));
      } catch (error: any) {
        console.error('Download status endpoint test failed:', error?.message || 'Unknown error');
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data));
        }
      }
    }
  } catch (error: any) {
    console.error('Download media endpoint test failed:', error?.message || 'Unknown error');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
  }
  
  console.log('=== API ENDPOINT TEST RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
};

// Export the API client for custom requests
export default apiClient;
