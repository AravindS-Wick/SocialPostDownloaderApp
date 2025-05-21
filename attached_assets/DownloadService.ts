import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { mockAPI } from './api';
import * as Notifications from 'expo-notifications';

export interface DownloadOptions {
  url: string;
  platform?: string;
  type?: 'video' | 'audio';
  quality?: string;
  format?: string;
  title?: string;
}

export interface DownloadProgress {
  progress: number;
  bytesWritten: number;
  contentLength: number;
  status: 'idle' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  fileUri?: string;
  filePath?: string;
  metadata?: {
    title: string;
    platform: string;
    thumbnail: string;
    author?: string;
    duration?: number;
    fileSize?: string;
    downloadDate: string;
    url: string;
    type: 'video' | 'audio';
    quality: string;
  };
  error?: string;
}

// Configure notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

class DownloadService {
  async downloadContent(options: DownloadOptions, progressCallback?: (progress: DownloadProgress) => void): Promise<DownloadResult> {
    try {
      // Set initial progress
      if (progressCallback) {
        progressCallback({
          progress: 0,
          bytesWritten: 0,
          contentLength: 100,
          status: 'downloading',
        });
      }

      // For development without a real API, use mock API
      // In a real app, you would call your backend API
      const response = await mockAPI.downloadContent(options.url, {
        type: options.type || 'video',
        quality: options.quality || 'high',
        platform: options.platform || 'auto',
      });

      const data = response.data;
      
      // Simulate download progress
      if (progressCallback) {
        // Simulate progress updates
        const totalSteps = 10;
        for (let i = 1; i <= totalSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          progressCallback({
            progress: i / totalSteps,
            bytesWritten: i * 1000000, // Simulate bytes
            contentLength: 10000000, // Simulate 10MB file
            status: 'downloading',
          });
        }
      }

      // For web platform, we can't save to the file system directly
      if (Platform.OS === 'web') {
        // In a real app, you might handle downloads differently on web
        // For example, using the browser's download capability
        
        // For demonstration, we'll just simulate a successful download
        if (progressCallback) {
          progressCallback({
            progress: 1,
            bytesWritten: 10000000,
            contentLength: 10000000,
            status: 'completed',
          });
        }
        
        return {
          success: true,
          metadata: {
            title: data.title,
            platform: data.platform,
            thumbnail: data.thumbnail,
            downloadDate: new Date().toISOString(),
            url: options.url,
            type: options.type || 'video',
            quality: options.quality || 'high',
          },
        };
      }

      // For mobile platforms, save to file system
      const fileExt = options.type === 'audio' ? 'mp3' : 'mp4';
      const fileName = `${Date.now()}_download.${fileExt}`;
      const directory = `${FileSystem.documentDirectory}SocialSaver/${options.type === 'audio' ? 'Audio' : 'Video'}`;
      
      // Create directories if they don't exist
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
      
      const fileUri = `${directory}/${fileName}`;
      
      // In a real app, you would download the actual file
      // For this demo, we'll create a mock file
      await FileSystem.writeAsStringAsync(fileUri, 'Mock file content');
      
      // Save to media library (only on mobile)
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync('SocialSaver');
      
      if (album === null) {
        await MediaLibrary.createAlbumAsync('SocialSaver', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      
      // Send a notification when download completes
      await this.sendDownloadNotification(data.title);
      
      // Update progress to completed
      if (progressCallback) {
        progressCallback({
          progress: 1,
          bytesWritten: 10000000,
          contentLength: 10000000,
          status: 'completed',
        });
      }
      
      return {
        success: true,
        fileUri,
        filePath: asset.uri,
        metadata: {
          title: data.title,
          platform: data.platform,
          thumbnail: data.thumbnail,
          author: data.author,
          duration: data.duration,
          fileSize: '10MB', // Mock file size
          downloadDate: new Date().toISOString(),
          url: options.url,
          type: options.type || 'video',
          quality: options.quality || 'high',
        },
      };
    } catch (error) {
      console.error('Download error:', error);
      
      // Update progress to failed
      if (progressCallback) {
        progressCallback({
          progress: 0,
          bytesWritten: 0,
          contentLength: 0,
          status: 'failed',
          error: (error as Error).message,
        });
      }
      
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getMediaInfo(url: string): Promise<any> {
    try {
      // In a real app, you would call your backend API
      // For development without a real API, use mock API
      const response = await mockAPI.getDownloadInfo(url);
      return response.data;
    } catch (error) {
      console.error('Get media info error:', error);
      throw error;
    }
  }

  async sendDownloadNotification(title: string): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Complete',
          body: `"${title}" has been successfully downloaded`,
          data: { title },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }
}

export default new DownloadService();