import { Platform } from 'react-native';

// App constants
export const APP_NAME = 'SocialSaver';

// Production API URL — from EXPO_PUBLIC_API_URL in .env
export const RAILWAY_API: string =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://postdownloaderapi-production.up.railway.app';

// Resolve API URL based on environment
const resolveApiBaseUrl = () => {
  if (__DEV__) {
    // Dev mode: use local backend
    if (Platform.OS === 'android') return 'http://10.0.2.2:2500'; // Android emulator
    return 'http://localhost:2500'; // iOS simulator
  }
  // Production build: use env variable or fallback
  return RAILWAY_API;
};

export const API_BASE_URL = resolveApiBaseUrl();

// Storage constants
export const STORAGE_KEYS = {
  ACTIVITY_LOGS: 'activity_logs',
  SETTINGS: 'settings',
  DOWNLOAD_HISTORY: 'download_history',
  USER_AUTH: 'user_auth',
  HAS_ONBOARDED: 'hasCompletedOnboarding',
};

// Supported platforms
export const SUPPORTED_PLATFORMS = [
  'YouTube',
  'Instagram',
  'Twitter',
  // 'TikTok',   // coming soon
  // 'Facebook', // coming soon
];

// Video resolutions
export const VIDEO_RESOLUTIONS = [
  '144',
  '240',
  '360',
  '480',
  '720',
  '1080',
  '1440',
  '2160',
  '4320',
];

// Audio quality options
export const AUDIO_QUALITIES = [
  'low',
  'medium',
  'high',
];

// Download types
export const DOWNLOAD_TYPES = [
  'video',
  'audio',
  'image',
];
