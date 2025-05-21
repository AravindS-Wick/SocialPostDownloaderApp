import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { Platform } from 'react-native';
import { VideoInfo, VideoFormat } from '../types';

class DownloadService {
  private static instance: DownloadService;

  static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  /**
   * Get media info from URL
   * @param url URL to get info from
   * @param platform Platform type (instagram, youtube, twitter, auto)
   */
  async getMediaInfo(url: string, platform: string): Promise<VideoInfo> {
    try {
      // In a real app, you would make an API call to your backend
      // or a third-party service that can extract video information
      // For now, we'll simulate this with mock data
      
      // Mock data for different platforms
      let formats: VideoFormat[] = [];
      let title = 'Video Title';
      let thumbnailUrl = '';
      let author = 'Content Creator';
      
      if (platform === 'youtube' || (platform === 'auto' && url.includes('youtube.com'))) {
        formats = [
          { url: 'mock-url-360p', mimeType: 'video/mp4', qualityLabel: '360p', height: 360, width: 640, hasVideo: true, hasAudio: true },
          { url: 'mock-url-480p', mimeType: 'video/mp4', qualityLabel: '480p', height: 480, width: 854, hasVideo: true, hasAudio: true },
          { url: 'mock-url-720p', mimeType: 'video/mp4', qualityLabel: '720p', height: 720, width: 1280, hasVideo: true, hasAudio: true },
          { url: 'mock-url-1080p', mimeType: 'video/mp4', qualityLabel: '1080p', height: 1080, width: 1920, hasVideo: true, hasAudio: true },
          { url: 'mock-url-audio', mimeType: 'audio/mp4', audioQuality: 'high', audioBitrate: 128, hasVideo: false, hasAudio: true },
        ];
        title = 'YouTube Video Title';
        thumbnailUrl = 'https://i.ytimg.com/vi/ABCDEFGH/maxresdefault.jpg';
        author = 'YouTube Creator';
      } else if (platform === 'instagram' || (platform === 'auto' && url.includes('instagram.com'))) {
        formats = [
          { url: 'mock-url-standard', mimeType: 'video/mp4', qualityLabel: 'Standard', hasVideo: true, hasAudio: true },
          { url: 'mock-url-high', mimeType: 'video/mp4', qualityLabel: 'High', hasVideo: true, hasAudio: true },
        ];
        title = 'Instagram Reel';
        thumbnailUrl = 'https://example.com/instagram-thumbnail.jpg';
        author = 'Instagram User';
      } else if (platform === 'twitter' || (platform === 'auto' && (url.includes('twitter.com') || url.includes('x.com')))) {
        formats = [
          { url: 'mock-url-low', mimeType: 'video/mp4', qualityLabel: 'Low', hasVideo: true, hasAudio: true },
          { url: 'mock-url-medium', mimeType: 'video/mp4', qualityLabel: 'Medium', hasVideo: true, hasAudio: true },
          { url: 'mock-url-high', mimeType: 'video/mp4', qualityLabel: 'High', hasVideo: true, hasAudio: true },
        ];
        title = 'Twitter Video';
        thumbnailUrl = 'https://example.com/twitter-thumbnail.jpg';
        author = 'Twitter User';
      }
      
      // Return mock video info
      return {
        title,
        thumbnailUrl,
        author,
        duration: 120, // 2 minutes
        formats,
      };
    } catch (error) {
      console.error('Error getting media info:', error);
      throw new Error('Failed to get media information');
    }
  }

  /**
   * Download media from URL
   * @param url URL to download from
   * @param options Download options (type, resolution)
   * @param progressCallback Callback for download progress
   */
  async downloadMedia(
    url: string, 
    options: { type: 'video' | 'audio' | 'image', resolution?: string },
    progressCallback?: (progress: number) => void
  ): Promise<string> {
    try {
      // First, check for permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }
      
      // Generate a filename based on the current time
      const timestamp = new Date().getTime();
      const fileExtension = options.type === 'audio' ? 'mp3' : (options.type === 'image' ? 'jpg' : 'mp4');
      const filename = `download_${timestamp}.${fileExtension}`;
      
      // Define the local file URI
      const fileUri = FileSystem.documentDirectory + filename;
      
      // In a real app, you would get the actual download URL from your API
      // For now, we'll just simulate a download
      
      // Simulate the download process
      await new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.1;
          if (progressCallback) {
            progressCallback(Math.min(progress, 0.99) * 100);
          }
          if (progress >= 1) {
            clearInterval(interval);
            resolve();
          }
        }, 300);
      });
      
      // In a real app, you would download the file
      // const downloadResumable = FileSystem.createDownloadResumable(
      //   actualDownloadUrl,
      //   fileUri,
      //   {},
      //   (downloadProgress) => {
      //     const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      //     if (progressCallback) {
      //       progressCallback(progress * 100);
      //     }
      //   }
      // );
      // await downloadResumable.downloadAsync();
      
      // For this demo, we'll create a dummy file
      await FileSystem.writeAsStringAsync(fileUri, 'Dummy file content');
      
      // Save the file to the media library
      if (Platform.OS !== 'web') {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        const album = await MediaLibrary.getAlbumAsync('Downloads');
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('Downloads', asset, false);
        }
      }
      
      // Call completion callback with 100% progress
      if (progressCallback) {
        progressCallback(100);
      }
      
      return fileUri;
    } catch (error) {
      console.error('Error downloading media:', error);
      throw new Error('Failed to download media');
    }
  }

  /**
   * Check if URL is valid for supported platforms
   * @param url URL to validate
   */
  isValidUrl(url: string): boolean {
    if (!url) return false;
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return false;
    }
    
    // Check if the URL is from a supported platform
    const supportedDomains = [
      'youtube.com', 'youtu.be',
      'instagram.com',
      'twitter.com', 'x.com'
    ];
    
    return supportedDomains.some(domain => url.includes(domain));
  }

  /**
   * Detect platform from URL
   * @param url URL to analyze
   */
  detectPlatform(url: string): string {
    if (!url) return 'unknown';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    }
    
    return 'unknown';
  }
}

export default DownloadService.getInstance();