import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { downloadAPI, mockAPI } from './api';
import { sendNotification } from './notifications';
import { saveFile, setupFolders, SaveOptions } from './storage';
import { requestMediaLibraryPermissions } from './permissions';
import { API_BASE_URL } from '../utils/constants';

export interface DownloadOptions {
  url: string;
  platform?: string;
  type?: 'video' | 'audio' | 'image';
  quality?: string;
  format?: string;
  title?: string;
  useAutoFormat?: boolean;
  user?: string | null;
  ageConsent?: boolean;
  saveLocation?: 'media_library' | 'downloads' | 'movies' | 'music';
}

export interface DownloadProgress {
  progress: number;
  bytesWritten: number;
  contentLength: number;
  status: 'idle' | 'downloading' | 'processing' | 'saving' | 'completed' | 'failed';
  error?: string;
  currentStep?: string;
}

export interface DownloadResult {
  success: boolean;
  fileUri?: string;
  filePath?: string;
  savedLocation?: string;
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
    channel?: string;
    hashtags?: string[];
    length?: string;
    ageRestriction?: boolean;
  };
  error?: string;
}

class DownloadService {
  // Cache permission status to avoid repeated requests
  private static permissionStatus: 'granted' | 'denied' | 'undetermined' | null = null;

  private async checkCachedPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    // Return cached status if available
    if (DownloadService.permissionStatus === 'granted') {
      return true;
    }

    try {
      console.log('🔐 Checking cached Android storage permissions...');
      const { status } = await MediaLibrary.getPermissionsAsync();
      DownloadService.permissionStatus = status;
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error checking storage permissions:', error);
      return false;
    }
  }

  private async requestAndroidStoragePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    // Check cached permissions first
    if (await this.checkCachedPermissions()) {
      return true;
    }

    try {
      console.log('🔐 Requesting Android storage permissions...');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      DownloadService.permissionStatus = status;
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error requesting storage permissions:', error);
      return false;
    }
  }

  private async getAppSpecificDirectoryPath(type: 'video' | 'audio' | 'image'): Promise<string> {
    const baseDir = FileSystem.documentDirectory;
    const folderName = type === 'video' ? 'Videos' : type === 'audio' ? 'Audio' : 'Images';
    const targetDir = `${baseDir}SocialSaver/${folderName}/`;
    await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    return targetDir;
  }

  private getFileExtensionFromUrl(url: string, type: 'video' | 'audio' | 'image'): string {
    const defaultExtensions: Record<typeof type, string> = {
      video: 'mp4',
      audio: 'mp3',
      image: 'jpg',
    };

    try {
      const parsedUrl = new URL(url);
      const extMatch = parsedUrl.pathname.match(/\.([a-z0-9]+)$/i);
      if (extMatch && extMatch[1]) {
        return extMatch[1].toLowerCase();
      }
    } catch (error) {
      console.warn('Could not extract extension from URL:', error);
    }

    return defaultExtensions[type];
  }

  private getDownloadBaseUrl(): string {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:2500';
    }

    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      return API_BASE_URL.replace(/\/$/, '');
    }

    return API_BASE_URL.replace(/\/$/, '');
  }

  private buildFileName(
    title: string,
    type: 'video' | 'audio' | 'image',
    explicitFilename?: string,
    sourceUrl?: string
  ): string {
    if (explicitFilename) {
      return explicitFilename;
    }

    const extension = this.getFileExtensionFromUrl(sourceUrl || title, type);
    const sanitizedTitle = (title || 'download')
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50) || 'download';

    return `${sanitizedTitle}_${Date.now()}.${extension}`;
  }

  private async saveToAppDirectory(
    sourceUri: string,
    fileName: string,
    type: 'video' | 'audio' | 'image'
  ): Promise<string> {
    try {
      const targetDir = await this.getAppSpecificDirectoryPath(type);
      const targetPath = `${targetDir}${fileName}`;
      await FileSystem.copyAsync({ from: sourceUri, to: targetPath });
      return targetPath;
    } catch (error) {
      console.error('❌ Error saving to app directory:', error);
      throw error;
    }
  }

  // private async addToMediaLibrary(filePath: string, type: 'video' | 'audio' | 'image'): Promise<string | null> {
  //   try {
  //     // Only check cached permissions - don't request new ones during download
  //     if (!await this.checkCachedPermissions()) {
  //       console.log('No media library permission, skipping media library save...');
  //       return filePath; // Return app directory path instead
  //     }

  //     const fileInfo = await FileSystem.getInfoAsync(filePath);
  //     if (!fileInfo.exists || fileInfo.size === 0) return null;

  //     // Create asset without requesting additional permissions
  //     const asset = await MediaLibrary.createAssetAsync(filePath);

  //     const albumName = `SocialSaver_${type.charAt(0).toUpperCase() + type.slice(1)}`;
  //     let album = await MediaLibrary.getAlbumAsync(albumName);
  //     if (!album) {
  //       album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
  //     } else {
  //       // Only add to existing album, don't create new one
  //       await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  //     }

  //     return asset.uri;
  //   } catch (error) {
  //     console.error('❌ Error adding to media library:', error);
  //     // If media library fails, the file is still saved in app directory
  //     return filePath; // Return the app directory path instead
  //   }
  // }

  private async addToMediaLibrary(filePath: string, type: 'video' | 'audio' | 'image'): Promise<string | null> {
  try {
    // Only check cached permissions - don't request new ones during download
    if (!await this.checkCachedPermissions()) {
      console.log('No media library permission, skipping media library save...');
      return filePath; // Return app directory path instead
    }

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists || fileInfo.size === 0) return null;

    // Use saveToLibraryAsync for Android 13+ to avoid permission dialog
    if (Platform.OS === 'android') {
      await MediaLibrary.saveToLibraryAsync(filePath);
      return filePath; // saveToLibraryAsync doesn't return an asset, so return the file path
    } else {
      // For iOS, use the album approach
      const asset = await MediaLibrary.createAssetAsync(filePath);
      const albumName = `SocialSaver_${type.charAt(0).toUpperCase() + type.slice(1)}`;
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      return asset.uri;
    }
  } catch (error) {
    console.error('❌ Error adding to media library:', error);
    // If media library fails, the file is still saved in app directory
    return filePath; // Return the app directory path instead
  }
}

  async downloadContent(
    options: DownloadOptions,
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      if (Platform.OS === 'web') {
        return await this.downloadForWeb(options, progressCallback);
      } else {
        return await this.downloadForMobile(options, progressCallback);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async downloadForWeb(
    options: DownloadOptions,
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      progressCallback?.({
        progress: 5,
        bytesWritten: 0,
        contentLength: 0,
        status: 'processing',
        currentStep: 'Preparing download...',
      });

      const mediaInfo = await this.getMediaInfo(options.url);
      const downloadResponse = await downloadAPI.downloadMedia({
        url: options.url,
        type: options.type || 'video',
        quality: options.quality || 'best',
        useAutoFormat: options.useAutoFormat || true
      });

      if (!downloadResponse?.success) {
        throw new Error(downloadResponse.error || 'Download failed');
      }

      if (!downloadResponse.downloadUrl) {
        throw new Error('Download URL missing from server response');
      }

      const baseUrl = this.getDownloadBaseUrl();
      const fullDownloadUrl = downloadResponse.downloadUrl.startsWith('http')
        ? downloadResponse.downloadUrl
        : `${baseUrl}${downloadResponse.downloadUrl}`;

      const fileName = this.buildFileName(
        downloadResponse.title || mediaInfo?.title || 'Downloaded Content',
        options.type || 'video',
        downloadResponse.filename,
        fullDownloadUrl
      );

      progressCallback?.({
        progress: 40,
        bytesWritten: 0,
        contentLength: 0,
        status: 'downloading',
        currentStep: 'Starting browser download...',
      });

      if (typeof document !== 'undefined') {
        const link = document.createElement('a');
        link.href = fullDownloadUrl;
        link.download = fileName;
        link.rel = 'noopener';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (typeof window !== 'undefined') {
        window.open(fullDownloadUrl, '_blank');
      }

      progressCallback?.({
        progress: 100,
        bytesWritten: 0,
        contentLength: 0,
        status: 'completed',
        currentStep: 'Download started in browser',
      });

      return {
        success: true,
        fileUri: fullDownloadUrl,
        savedLocation: 'browser_downloads',
        metadata: {
          title: downloadResponse.title || mediaInfo?.title || 'Downloaded Content',
          platform: options.platform || 'youtube',
          thumbnail: downloadResponse.thumbnail || mediaInfo?.thumbnail || '',
          author: downloadResponse.channel || mediaInfo?.author || '',
          channel: downloadResponse.channel || '',
          hashtags: downloadResponse.hashtags || [],
          length: downloadResponse.length || '',
          ageRestriction: downloadResponse.ageRestriction || false,
          fileSize: '10.5 MB',
          downloadDate: new Date().toISOString(),
          url: options.url,
          type: (options.type || 'video') as 'video' | 'audio' | 'image',
          quality: options.quality || '720p',
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

private async downloadForMobile(
  options: DownloadOptions,
  progressCallback?: (progress: DownloadProgress) => void
): Promise<DownloadResult> {
  try {
    await setupFolders();

      
      // Check permissions but don't request them during download
      const hasPermissions = await this.checkCachedPermissions();
      if (!hasPermissions) {
        console.log('⚠️ No media library permissions - files will be saved to app directory only');
      }

      const mediaInfo = await this.getMediaInfo(options.url);
      const downloadResponse = await downloadAPI.downloadMedia({
        url: options.url,
        type: options.type || 'video',
        quality: options.quality || 'best',
        useAutoFormat: options.useAutoFormat || true
      });

      if (!downloadResponse?.success || !downloadResponse.downloadUrl) {
        throw new Error(downloadResponse?.error || 'Download failed');
      }

      const baseUrl = this.getDownloadBaseUrl();
      let fullDownloadUrl = downloadResponse.downloadUrl;
      if (!fullDownloadUrl.startsWith('http')) {
        fullDownloadUrl = `${baseUrl}${downloadResponse.downloadUrl}`;
      }

      const fileName = this.buildFileName(
        downloadResponse.title || mediaInfo?.title || 'download',
        options.type || 'video',
        downloadResponse.filename,
        fullDownloadUrl
      );
      const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        fullDownloadUrl,
        tempFileUri,
        {
          headers: {
            'Accept': '*/*',
            'User-Agent': 'SocialSaver-Mobile/1.0',
            'Accept-Encoding': 'identity',
          }
        },
        (downloadProgress) => {
          if (progressCallback) {
            progressCallback({
              progress: Math.round((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100),
              bytesWritten: downloadProgress.totalBytesWritten,
              contentLength: downloadProgress.totalBytesExpectedToWrite,
              status: 'downloading',
              currentStep: `Downloading file... ${Math.round((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100)}%`,
            });
          }
        }
      );

      const downloadResult = await downloadResumable.downloadAsync();
      const downloadedFileInfo = await FileSystem.getInfoAsync(downloadResult.uri);

      if (!downloadedFileInfo.exists || downloadedFileInfo.size === 0) {
        throw new Error('Downloaded file is missing or empty');
      }

      if (downloadedFileInfo.size < 1024) {
        const fileContent = await FileSystem.readAsStringAsync(downloadResult.uri, { length: 200 });
        if (fileContent.includes('error') || fileContent.includes('404')) {
          throw new Error('Downloaded file appears to be an error page');
        }
      }

      // Always save to app directory first
      const permanentPath = await this.saveToAppDirectory(downloadResult.uri, fileName, options.type || 'video');
      
      // Try to add to media library (only if permissions were granted earlier)
      const mediaLibraryUri = await this.addToMediaLibrary(permanentPath, options.type || 'video');

      // Clean up temp file
      await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });

      return {
        success: true,
        fileUri: mediaLibraryUri || permanentPath,
        filePath: permanentPath,
        savedLocation: this.getSavedLocationDescription(options.type || 'video'),
        metadata: {
          title: downloadResponse.title || mediaInfo?.title || 'Downloaded Content',
          platform: options.platform || 'youtube',
          thumbnail: downloadResponse.thumbnail || mediaInfo?.thumbnail || '',
          author: downloadResponse.channel || mediaInfo?.author || '',
          channel: downloadResponse.channel || '',
          hashtags: downloadResponse.hashtags || [],
          length: downloadResponse.length || '',
          ageRestriction: downloadResponse.ageRestriction || false,
          fileSize: `${(downloadedFileInfo.size / (1024 * 1024)).toFixed(2)} MB`,
          downloadDate: new Date().toISOString(),
          url: options.url,
          type: (options.type || 'video') as 'video' | 'audio' | 'image',
          quality: options.quality || '720p',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private getSavedLocationDescription(type: 'video' | 'audio' | 'image'): string {
    const hasPermissions = DownloadService.permissionStatus === 'granted';
    const location = type === 'video' ? 'Videos' : type === 'audio' ? 'Audio' : 'Images';
    
    if (hasPermissions) {
      return `SocialSaver/${location} + Gallery`;
    } else {
      return `SocialSaver/${location}`;
    }
  }

  async getMediaInfo(url: string): Promise<any> {
    try {
      const mediaInfo = await downloadAPI.getMediaInfo(url);
      return mediaInfo;
    } catch (error: any) {
      const mediaInfo = await mockAPI.getMediaInfo(url);
      return mediaInfo;
    }
  }

  async sendDownloadNotification(title: string): Promise<void> {
    try {
      await sendNotification({
        title: 'Download Complete! 🎉',
        body: `Your download of "${title}" is complete and saved to your device`,
        data: { screen: 'History' },
      });
    } catch (error: any) {
      console.error('❌ Failed to send notification:', error?.message || error);
    }
  }

  async listDownloadedFiles(): Promise<void> {
    try {
      const types = ['video', 'audio', 'image'] as const;
      let totalFiles = 0;

      for (const type of types) {
        const dir = await this.getAppSpecificDirectoryPath(type);
        const files = await FileSystem.readDirectoryAsync(dir);
        totalFiles += files.length;
      }

      Alert.alert(
        'Downloaded Files',
        totalFiles > 0
          ? `Found ${totalFiles} downloaded files. Check the console for details.`
          : 'No downloaded files found yet.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Error listing downloaded files:', error);
    }
  }

  // Method to check and request permissions upfront (call this from your UI)
  async ensurePermissions(): Promise<boolean> {
    return await this.requestAndroidStoragePermissions();
  }
}

export default new DownloadService();
