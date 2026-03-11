import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { downloadAPI, mockAPI } from './api';
import { sendNotification } from './notifications';
import { setupFolders } from './storage';
import { API_BASE_URL } from '../utils/constants';
import { store } from '../store';
import { setSafFolderUri } from '../store/slices/settingsSlice';

const { StorageAccessFramework } = FileSystem as any;

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

export interface MediaInfo {
  title?: string;
  thumbnail?: string;
  author?: string;
  uploader?: string;
  channel?: string;
  duration?: number;
  quality?: string;
  qualities?: string[];
  audioQualities?: string[];
  formats?: Array<{ quality?: string; format_note?: string }>;
  description?: string;
  view_count?: number;
  like_count?: number;
  upload_date?: string;
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
      console.log('Checking cached Android storage permissions...');
      const { status } = await MediaLibrary.getPermissionsAsync();
      DownloadService.permissionStatus = status;
      return status === 'granted';
    } catch (error) {
      console.error('Error checking storage permissions:', error);
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
      console.log('Requesting Android storage permissions...');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      DownloadService.permissionStatus = status;
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting storage permissions:', error);
      return false;
    }
  }

  private async getAppSpecificDirectoryPath(type: 'video' | 'audio' | 'image'): Promise<string> {
    // On Android, try SAF (Storage Access Framework) so files go to user-chosen public folder
    if (Platform.OS === 'android' && StorageAccessFramework) {
      try {
        const savedUri = store.getState().settings.safFolderUri;
        let folderUri: string | null = savedUri;

        if (!folderUri) {
          // Show folder picker once — user chooses Downloads/SocialSaver or DCIM/SocialSaver
          const perm = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (perm.granted) {
            folderUri = perm.directoryUri;
            store.dispatch(setSafFolderUri(folderUri));
          }
        }

        if (folderUri) {
          // SAF URI is the chosen directory — return it as the target
          // Callers that need to write will use StorageAccessFramework.createFileAsync
          return folderUri;
        }
      } catch (e) {
        console.warn('SAF folder picker failed, falling back to app directory:', e);
      }
    }

    // Fallback: app-internal directory (iOS always uses this)
    const baseDir = FileSystem.documentDirectory;
    const folderName = type === 'video' ? 'Videos' : type === 'audio' ? 'Audio' : 'Images';
    const downloadPath = store.getState().settings.downloadPath || 'SocialSaver';
    const targetDir = `${baseDir}${downloadPath}/${folderName}/`;
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

  private async saveToAppDirectory(
    sourceUri: string,
    fileName: string,
    type: 'video' | 'audio' | 'image'
  ): Promise<string> {
    try {
      const targetDir = await this.getAppSpecificDirectoryPath(type);

      // SAF content:// URI — write via StorageAccessFramework
      if (targetDir.startsWith('content://') && StorageAccessFramework) {
        const mimeType = type === 'audio' ? 'audio/mpeg'
          : type === 'image' ? 'image/jpeg'
          : 'video/mp4';
        const newFileUri = await StorageAccessFramework.createFileAsync(targetDir, fileName, mimeType);
        const base64 = await FileSystem.readAsStringAsync(sourceUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(newFileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return newFileUri;
      }

      // Standard file:// path
      const targetPath = `${targetDir}${fileName}`;
      await FileSystem.copyAsync({ from: sourceUri, to: targetPath });
      return targetPath;
    } catch (error) {
      console.error('Error saving to app directory:', error);
      throw error;
    }
  }

  private async addToMediaLibrary(filePath: string, _type: 'video' | 'audio' | 'image'): Promise<string | null> {
    // SAF content:// URIs are already in a public folder — skip media library
    if (filePath.startsWith('content://')) return filePath;

    try {
      // Only check cached permissions - don't request new ones during download
      if (!await this.checkCachedPermissions()) {
        console.log('No media library permission, skipping media library save...');
        return filePath;
      }

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || fileInfo.size === 0) return null;

      // Create asset then save into a named album (works on both Android & iOS)
      const downloadPath = store.getState().settings.downloadPath || 'SocialSaver';
      const asset = await MediaLibrary.createAssetAsync(filePath);
      let album = await MediaLibrary.getAlbumAsync(downloadPath);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(downloadPath, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      return asset.uri;
    } catch (error) {
      console.error('Error adding to media library:', error);
      return filePath;
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private sanitizeFilename(name: string, maxLength: number = 80): string {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')       // strip diacritics
      .replace(/[\/\\?%*:|"<>&#+,{}^~`\[\]@!$;=]/g, '') // strip unsafe chars
      .replace(/\./g, '')                    // strip dots (extension added separately)
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, maxLength) || 'download';
  }

  private extractFilename(downloadUrl: string): string {
    try {
      const parsed = new URL(downloadUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const candidate = segments[segments.length - 1];
      if (candidate) {
        return candidate;
      }
    } catch (error) {
      console.warn('Failed to parse filename from URL:', error);
    }
    return `download-${Date.now()}`;
  }

  private async triggerWebDownload(
    downloadUrl: string,
    filename?: string,
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch downloaded file');
    }

    const lengthHeader = response.headers.get('Content-Length');
    const totalBytes = lengthHeader ? Number(lengthHeader) : undefined;
    const totalForProgress = Number.isFinite(totalBytes) ? Number(totalBytes) : undefined;

    progressCallback?.({
      progress: 0,
      bytesWritten: 0,
      contentLength: totalForProgress ?? 0,
      status: 'downloading'
    });

    let blob: Blob;

    if (response.body && response.body.getReader) {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          chunks.push(value);
          received += value.length;
          if (totalForProgress && totalForProgress > 0) {
            const percent = Math.min(100, Math.round((received / totalForProgress) * 100));
            progressCallback?.({
              progress: percent,
              bytesWritten: received,
              contentLength: totalForProgress,
              status: 'downloading'
            });
          }
        }
      }

      blob = new Blob(chunks as BlobPart[], {
        type: response.headers.get('Content-Type') || 'application/octet-stream'
      });

      progressCallback?.({
        progress: 100,
        bytesWritten: received,
        contentLength: totalForProgress ?? received,
        status: 'completed'
      });
    } else {
      blob = await response.blob();
      progressCallback?.({
        progress: 100,
        bytesWritten: totalForProgress ?? 0,
        contentLength: totalForProgress ?? 0,
        status: 'completed'
      });
    }

    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename || this.extractFilename(downloadUrl);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(objectUrl);
  }

  private async downloadForWeb(
    options: DownloadOptions,
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      console.log('Web download starting');
      const mediaInfo = await this.getMediaInfo(options.url);
      const downloadResponse = await downloadAPI.downloadMedia({
        url: options.url,
        type: options.type || 'video',
        quality: options.quality || 'best',
        useAutoFormat: options.useAutoFormat || true
      });

      if (!downloadResponse.success) {
        console.error('Web download failed:', downloadResponse.error);
        throw new Error(downloadResponse.error || 'Download failed');
      }

      // Use localhost for web, not 10.0.2.2
      const fullDownloadUrl = `http://localhost:2500${downloadResponse.downloadUrl}`;

      const derivedQuality = downloadResponse.quality || options.quality || mediaInfo?.quality || 'best';
      const baseName = [downloadResponse.title || mediaInfo?.title || 'download', derivedQuality]
        .filter(Boolean)
        .map(part => part.trim())
        .join(' - ');
      const extension = this.getFileExtensionFromUrl(fullDownloadUrl, options.type || 'video');
      const safeBaseName = this.sanitizeFilename(baseName);
      const finalFilename = `${safeBaseName}.${extension}`;

      await this.triggerWebDownload(fullDownloadUrl, finalFilename, progressCallback);

      return {
        success: true,
        fileUri: fullDownloadUrl,
        filePath: fullDownloadUrl,
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
          fileSize: downloadResponse.fileSize || '10.5 MB',
          downloadDate: new Date().toISOString(),
          url: options.url,
          type: (options.type || 'video') as 'video' | 'audio' | 'image',
          quality: derivedQuality,
        },
      };
    } catch (error) {
      console.error('Web download error:', error instanceof Error ? error.message : error);
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
        console.log('No media library permissions - files will be saved to app directory only');
      }

      const mediaInfo = await this.getMediaInfo(options.url);
      const downloadResponse = await downloadAPI.downloadMedia({
        url: options.url,
        type: options.type || 'video',
        quality: options.quality || 'best',
        useAutoFormat: options.useAutoFormat || true
      });

      let fullDownloadUrl = downloadResponse.downloadUrl;
      if (fullDownloadUrl && !fullDownloadUrl.startsWith('http')) {
        fullDownloadUrl = `${API_BASE_URL}${downloadResponse.downloadUrl}`;
      } else if (!fullDownloadUrl) {
        throw new Error('Download URL is not provided in the response');
      }

      const fileExt = this.getFileExtensionFromUrl(fullDownloadUrl, options.type || 'video');
      const derivedQuality = downloadResponse.quality || options.quality || mediaInfo?.quality || 'best';
      const baseName = [downloadResponse.title || mediaInfo?.title || 'download', derivedQuality]
        .filter(Boolean)
        .map(part => String(part).trim())
        .join(' - ');
      const safeBaseName = this.sanitizeFilename(baseName);
      const fileName = `${safeBaseName}.${fileExt}`;
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
      if (!downloadResult) {
        throw new Error('Download failed: no result returned');
      }
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
          quality: derivedQuality,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private getSavedLocationDescription(type: 'video' | 'audio' | 'image'): string {
    const hasPermissions = DownloadService.permissionStatus === 'granted';
    const location = type === 'video' ? 'Videos' : type === 'audio' ? 'Audio' : 'Images';
    const downloadPath = store.getState().settings.downloadPath || 'SocialSaver';

    if (hasPermissions) {
      return `${downloadPath}/${location} + Gallery`;
    } else {
      return `${downloadPath}/${location}`;
    }
  }

  async getMediaInfo(url: string): Promise<MediaInfo> {
    try {
      return await downloadAPI.getMediaInfo(url) as MediaInfo;
    } catch {
      return await mockAPI.getMediaInfo(url) as MediaInfo;
    }
  }

  async sendDownloadNotification(title: string): Promise<void> {
    const notifEnabled = store.getState().settings.notificationsEnabled;
    if (!notifEnabled) return;
    try {
      await sendNotification({
        title: 'Download Complete',
        body: `Your download of "${title}" is complete and saved to your device`,
        data: { screen: 'History' },
      });
    } catch (error) {
      console.error('Failed to send notification:', error instanceof Error ? error.message : error);
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
      console.error('Error listing downloaded files:', error);
    }
  }

  // Method to check and request permissions upfront (call this from your UI)
  async ensurePermissions(): Promise<boolean> {
    return await this.requestAndroidStoragePermissions();
  }
}

export default new DownloadService();
