import { Platform } from 'react-native';

// App constants
export const APP_NAME = 'SocialSaver';

const resolveApiBaseUrl = () => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return 'http://localhost:2500';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:2500';
  }
  return 'http://10.0.2.2:2500';
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
  'TikTok',
  'Facebook',
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
