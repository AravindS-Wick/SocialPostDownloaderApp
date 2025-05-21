import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { getVideoInfo } from './api';
import { saveFile } from './storage';
import { sendNotification } from './notifications';
import { store } from '../store';
import { setIsDownloading, setProgress, setAvailableResolutions } from '../store/slices/downloadSlice';

// Function to start a download and track progress
export const startDownload = async (
  url: string,
  platform: string,
  type: 'video' | 'audio' | 'image',
  resolution?: string | null
) => {
  try {
    store.dispatch(setIsDownloading(true));
    store.dispatch(setProgress(0));
    
    // Get video/content info from API
    const info = await getVideoInfo(url, platform);
    
    if (!info || !info.formats) {
      throw new Error('Failed to get download information');
    }
    
    // Get available resolutions from formats
    const availableResolutions = info.formats
      .filter((format: any) => format.qualityLabel || format.height)
      .map((format: any) => format.height?.toString())
      .filter((height: string | undefined) => !!height)
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) // Unique values
      .sort((a: string, b: string) => parseInt(b) - parseInt(a)); // Sort descending
    
    store.dispatch(setAvailableResolutions(availableResolutions));
    
    // Find the appropriate format to download
    let formatToDownload = null;
    
    if (type === 'video') {
      // If resolution specified, find closest match
      if (resolution) {
        const targetHeight = parseInt(resolution);
        
        // First filter formats that have both video and audio
        const videoFormats = info.formats.filter((format: any) => format.hasVideo && format.hasAudio);
        
        if (videoFormats.length === 0) {
          throw new Error('No video format with audio found');
        }
        
        // Sort by closest resolution to target
        formatToDownload = videoFormats.sort((a: any, b: any) => {
          const aDiff = Math.abs((a.height || 0) - targetHeight);
          const bDiff = Math.abs((b.height || 0) - targetHeight);
          return aDiff - bDiff;
        })[0];
      }
      
      // If no resolution specified or no format found, use highest quality
      if (!formatToDownload) {
        formatToDownload = info.formats
          .filter((format: any) => format.hasVideo && format.hasAudio)
          .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))[0];
      }
    } else if (type === 'audio') {
      formatToDownload = info.formats
        .filter((format: any) => format.hasAudio && !format.hasVideo)
        .sort((a: any, b: any) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
        
      // If no audio-only format found, try to get any format with audio
      if (!formatToDownload) {
        formatToDownload = info.formats
          .filter((format: any) => format.hasAudio)
          .sort((a: any, b: any) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
      }
    } else if (type === 'image') {
      // For images, typically use the thumbnail or preview url
      formatToDownload = {
        url: info.thumbnail || info.thumbnailUrl,
        mimeType: 'image/jpeg',
      };
    }
    
    if (!formatToDownload) {
      throw new Error(`No ${type} format found for this content`);
    }
    
    // Create a filename based on video title or URL
    const title = info.title || new URL(url).pathname.split('/').pop() || 'download';
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    
    let extension = 'mp4';
    if (formatToDownload.mimeType) {
      const mimeTypeParts = formatToDownload.mimeType.split('/');
      if (mimeTypeParts.length > 1) {
        extension = mimeTypeParts[1].split(';')[0];
      }
    }
    
    // Set extension based on type if not determined from mimeType
    if (type === 'audio' && extension === 'mp4') {
      extension = 'mp3';
    } else if (type === 'image' && extension === 'mp4') {
      extension = 'jpg';
    }
    
    const filename = `${platform.toLowerCase()}_${sanitizedTitle}_${timestamp}.${extension}`;
    
    // Download the file
    if (Platform.OS === 'web') {
      // For web, create a download link
      const downloadUrl = formatToDownload.url;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      store.dispatch(setProgress(1));
      store.dispatch(setIsDownloading(false));
      
      return { filename, path: downloadUrl };
    } else {
      // For mobile, download to file system
      const downloadUrl = formatToDownload.url;
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        FileSystem.cacheDirectory + filename,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          store.dispatch(setProgress(progress));
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      
      if (!result) {
        throw new Error('Download failed');
      }
      
      // Save the file to appropriate folder
      const savedPath = await saveFile(result.uri, filename, type);
      
      // Show notification
      await sendNotification({
        title: 'Download Complete',
        body: `${type.charAt(0).toUpperCase() + type.slice(1)} from ${platform} has been downloaded successfully`,
        data: { url, filename, type, platform },
      });
      
      store.dispatch(setIsDownloading(false));
      
      return { filename, path: savedPath };
    }
  } catch (error) {
    store.dispatch(setIsDownloading(false));
    console.error('Download error:', error);
    throw error;
  }
};
