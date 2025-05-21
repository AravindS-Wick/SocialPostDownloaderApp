import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { downloadAPI, mockAPI } from './api';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from './notifications';

export interface DownloadOptions {
  url: string;
  platform?: string;
  type?: 'video' | 'audio' | 'image';
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
    type: 'video' | 'audio' | 'image';
    quality: string;
  };
  error?: string;
}

class DownloadService {
  async downloadContent(
    options: DownloadOptions, 
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      // Set default progress
      if (progressCallback) {
        progressCallback({
          progress: 0,
          bytesWritten: 0,
          contentLength: 0,
          status: 'downloading',
        });
      }

      // Fetch the download URL from the API
      // Using mockAPI for now since we're on web; in a real app on a device,
      // you would use the real API calls
      const mediaInfo = await this.getMediaInfo(options.url);
      
      // In a web environment, we'll simulate the download
      // In a real mobile app, we'd download the file to the device
      if (Platform.OS === 'web') {
        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.1;
          if (progressCallback && progress <= 1) {
            progressCallback({
              progress: progress * 100,
              bytesWritten: Math.floor(progress * 10000),
              contentLength: 10000,
              status: 'downloading',
            });
          }
          
          if (progress >= 1) {
            clearInterval(interval);
            if (progressCallback) {
              progressCallback({
                progress: 100,
                bytesWritten: 10000,
                contentLength: 10000,
                status: 'completed',
              });
            }
          }
        }, 300);
        
        // Create a simulated result
        const result: DownloadResult = {
          success: true,
          fileUri: 'https://example.com/download/mocked-file.mp4',
          metadata: {
            title: mediaInfo.title || 'Downloaded Content',
            platform: options.platform || 'unknown',
            thumbnail: mediaInfo.thumbnail || '',
            author: mediaInfo.author,
            duration: mediaInfo.duration,
            fileSize: '10.5 MB',
            downloadDate: new Date().toISOString(),
            url: options.url,
            type: options.type || 'video',
            quality: options.quality || '720p',
          },
        };
        
        // Wait for the simulated download to complete
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        // Send notification
        await this.sendDownloadNotification(result.metadata?.title || 'Content');
        
        return result;
      } else {
        // Real device implementation would download and save the file
        // This would use Expo FileSystem for the actual download
        // We'd need to handle permissions, file saving, etc.
        
        // For now, return a mock result
        const result: DownloadResult = {
          success: true,
          fileUri: 'file://mocked-path/download.mp4',
          metadata: {
            title: mediaInfo.title || 'Downloaded Content',
            platform: options.platform || 'unknown',
            thumbnail: mediaInfo.thumbnail || '',
            author: mediaInfo.author,
            duration: mediaInfo.duration,
            fileSize: '10.5 MB',
            downloadDate: new Date().toISOString(),
            url: options.url,
            type: options.type || 'video',
            quality: options.quality || '720p',
          },
        };
        
        return result;
      }
    } catch (error) {
      console.error('Download error:', error);
      if (progressCallback) {
        progressCallback({
          progress: 0,
          bytesWritten: 0,
          contentLength: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getMediaInfo(url: string): Promise<any> {
    try {
      // Use mock API for now to avoid backend dependency during development
      const mediaInfo = await mockAPI.getMediaInfo(url);
      return mediaInfo;
    } catch (error) {
      console.error('Error fetching media info:', error);
      throw error;
    }
  }

  async sendDownloadNotification(title: string): Promise<void> {
    try {
      await sendNotification({
        title: 'Download Complete',
        body: `Your download of "${title}" is complete`,
        data: { screen: 'History' },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}

export default new DownloadService();