import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Get the size of a file
export const getFileSize = async (fileUri: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      return 0; // Not supported on web
    }
    
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      return fileInfo.size || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

// Format bytes to readable size (KB, MB, GB)
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Clean cache directory
export const cleanCache = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      return; // Not supported on web
    }
    
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;
    
    // Get all files in cache directory
    const fileList = await FileSystem.readDirectoryAsync(cacheDir);
    
    // Delete each file
    for (const file of fileList) {
      const filePath = `${cacheDir}${file}`;
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
    throw error;
  }
};

// Get total storage usage
export const getStorageUsage = async (): Promise<{ total: number; byType: Record<string, number> }> => {
  try {
    if (Platform.OS === 'web') {
      return { total: 0, byType: {} }; // Not supported on web
    }
    
    const baseDir = `${FileSystem.documentDirectory}SocialSaver`;
    
    // Check if base directory exists
    const baseInfo = await FileSystem.getInfoAsync(baseDir);
    if (!baseInfo.exists) {
      return { total: 0, byType: {} };
    }
    
    // Get size by type
    const videoDir = `${baseDir}/Video`;
    const audioDir = `${baseDir}/Audio`;
    const imageDir = `${baseDir}/Image`;
    
    const videoInfo = await FileSystem.getInfoAsync(videoDir);
    const audioInfo = await FileSystem.getInfoAsync(audioDir);
    const imageInfo = await FileSystem.getInfoAsync(imageDir);
    
    const videoSize = videoInfo.exists && videoInfo.isDirectory ? await getDirSize(videoDir) : 0;
    const audioSize = audioInfo.exists && audioInfo.isDirectory ? await getDirSize(audioDir) : 0;
    const imageSize = imageInfo.exists && imageInfo.isDirectory ? await getDirSize(imageDir) : 0;
    
    const total = videoSize + audioSize + imageSize;
    
    return {
      total,
      byType: {
        video: videoSize,
        audio: audioSize,
        image: imageSize,
      },
    };
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return { total: 0, byType: {} };
  }
};

// Helper function to get directory size recursively
const getDirSize = async (dirPath: string): Promise<number> => {
  try {
    let totalSize = 0;
    const files = await FileSystem.readDirectoryAsync(dirPath);
    
    for (const file of files) {
      const filePath = `${dirPath}/${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        if (fileInfo.isDirectory) {
          totalSize += await getDirSize(filePath);
        } else {
          totalSize += fileInfo.size || 0;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating directory size:', error);
    return 0;
  }
};
