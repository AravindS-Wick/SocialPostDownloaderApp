// Download history item
export interface DownloadHistoryItem {
  id: string;
  url: string;
  platform: string;
  type: string;
  filename: string;
  resolution: string;
  timestamp: string;
  path: string;
}

// User info
export interface User {
  email: string;
  token: string;
}

// Platform connection
export interface PlatformConnection {
  platform: string;
  connected: boolean;
  username?: string;
}

// Download options
export interface DownloadOptions {
  type: 'video' | 'audio' | 'image';
  resolution?: string;
  quality?: string;
}

// Video format
export interface VideoFormat {
  url: string;
  mimeType: string;
  quality?: string;
  qualityLabel?: string;
  height?: number;
  width?: number;
  hasVideo: boolean;
  hasAudio: boolean;
  audioQuality?: string;
  audioBitrate?: number;
}

// Video info response
export interface VideoInfo {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  author?: string;
  duration?: number;
  formats: VideoFormat[];
}

// Activity log
export interface ActivityLog {
  type: string;
  status: 'attempt' | 'complete' | 'consent';
  meta: any;
  ageConsent: boolean;
  timestamp: string;
}

// Notification
export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}