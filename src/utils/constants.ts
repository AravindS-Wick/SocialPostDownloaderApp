// App constants
export const APP_NAME = 'SocialSaver';

// Local server (free, requires same WiFi network) — disabled for now
// export const LOCAL_API = 'http://192.168.0.4:2500';
export const LOCAL_API = 'https://fantastic-mercy-production-1ff1.up.railway.app';
export const RAILWAY_API = 'https://fantastic-mercy-production-1ff1.up.railway.app';

const resolveApiBaseUrl = () => {
  // TODO: re-enable local server once network issues are resolved
  // if (Platform.OS === 'web') return 'http://localhost:2500';
  // return LOCAL_API;
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
