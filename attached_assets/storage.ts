import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

// Define the base folder for all downloads
const DOWNLOAD_BASE_FOLDER = 'SocialSaver';

// Setup the folders structure for downloads
export const setupFolders = async (): Promise<void> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return;
  }
  
  try {
    // Check if we have permission first
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Media library permission is required');
    }
    
    // Create base folder in Documents directory
    const baseDir = `${FileSystem.documentDirectory}${DOWNLOAD_BASE_FOLDER}`;
    const videosDir = `${baseDir}/Video`;
    const audioDir = `${baseDir}/Audio`;
    const imagesDir = `${baseDir}/Image`;
    
    // Create base directory if it doesn't exist
    const baseInfo = await FileSystem.getInfoAsync(baseDir);
    if (!baseInfo.exists) {
      await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
    }
    
    // Create videos directory if it doesn't exist
    const videosInfo = await FileSystem.getInfoAsync(videosDir);
    if (!videosInfo.exists) {
      await FileSystem.makeDirectoryAsync(videosDir, { intermediates: true });
    }
    
    // Create audio directory if it doesn't exist
    const audioInfo = await FileSystem.getInfoAsync(audioDir);
    if (!audioInfo.exists) {
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
    }
    
    // Create images directory if it doesn't exist
    const imagesInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!imagesInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }
  } catch (error) {
    console.error('Error setting up folders:', error);
    throw new Error('Failed to setup download folders');
  }
};

// Save a file to the appropriate folder
export const saveFile = async (
  fileUri: string,
  filename: string,
  type: 'video' | 'audio' | 'image'
): Promise<string> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return fileUri;
  }
  
  try {
    // Choose the correct folder based on type
    let targetFolder = '';
    switch (type) {
      case 'video':
        targetFolder = 'Video';
        break;
      case 'audio':
        targetFolder = 'Audio';
        break;
      case 'image':
        targetFolder = 'Image';
        break;
      default:
        targetFolder = 'Video';
    }
    
    // Setup target path
    const targetDir = `${FileSystem.documentDirectory}${DOWNLOAD_BASE_FOLDER}/${targetFolder}`;
    const targetPath = `${targetDir}/${filename}`;
    
    // Copy the file to the target directory
    await FileSystem.copyAsync({
      from: fileUri,
      to: targetPath,
    });
    
    // Save to media library so it's visible in the gallery
    const asset = await MediaLibrary.createAssetAsync(targetPath);
    
    // Create album if it doesn't exist
    const albums = await MediaLibrary.getAlbumsAsync();
    let album = albums.find(a => a.title === DOWNLOAD_BASE_FOLDER);
    
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(DOWNLOAD_BASE_FOLDER, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
    
    // Delete the cached file to save space
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    
    return targetPath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save downloaded file');
  }
};
