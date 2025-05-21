import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { checkPermissions, requestMediaLibraryPermissions } from './permissions';

// Constants for folder structure
const APP_FOLDER_NAME = 'SocialSaver';
const VIDEO_FOLDER_NAME = 'Video';
const AUDIO_FOLDER_NAME = 'Audio';
const IMAGE_FOLDER_NAME = 'Images';

/**
 * Setup required folders for storing downloaded content
 * @returns {Promise<void>}
 */
export const setupFolders = async (): Promise<void> => {
  // Skip for web as FileSystem is not fully supported
  if (Platform.OS === 'web') {
    console.log('Folders not created for web platform');
    return;
  }

  try {
    // Check if we have permissions first
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log('No permissions to create folders');
      return;
    }

    // Create the main app folder in MediaLibrary
    const mainAlbum = await MediaLibrary.getAlbumAsync(APP_FOLDER_NAME);
    
    if (!mainAlbum) {
      // Create a temporary file to use for creating the album
      const tempFilePath = `${FileSystem.cacheDirectory}temp_${Date.now()}.jpg`;
      
      // Write a small file
      await FileSystem.writeAsStringAsync(
        tempFilePath,
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Base64 of a 1x1 transparent GIF
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      // Save to MediaLibrary to create the album
      const asset = await MediaLibrary.createAssetAsync(tempFilePath);
      await MediaLibrary.createAlbumAsync(APP_FOLDER_NAME, asset, false);
      
      // Clean up the temp file
      await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
      
      console.log(`Created main album: ${APP_FOLDER_NAME}`);
      
      // Create subfolders by saving placeholder files
      await createSubFolder(VIDEO_FOLDER_NAME);
      await createSubFolder(AUDIO_FOLDER_NAME);
      await createSubFolder(IMAGE_FOLDER_NAME);
    } else {
      console.log(`Album ${APP_FOLDER_NAME} already exists`);
    }
  } catch (error) {
    console.error('Error setting up folders:', error);
  }
};

/**
 * Create a subfolder in the app's main folder
 * @param {string} folderName The name of the subfolder
 * @returns {Promise<void>}
 */
const createSubFolder = async (folderName: string): Promise<void> => {
  try {
    const subFolderPath = `${APP_FOLDER_NAME}/${folderName}`;
    
    // Check if subfolder already exists
    const subAlbum = await MediaLibrary.getAlbumAsync(subFolderPath);
    
    if (!subAlbum) {
      // Create a temporary file to use for creating the album
      const tempFilePath = `${FileSystem.cacheDirectory}temp_${folderName}_${Date.now()}.jpg`;
      
      // Write a small file
      await FileSystem.writeAsStringAsync(
        tempFilePath,
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Base64 of a 1x1 transparent GIF
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      // Save to MediaLibrary to create the album
      const asset = await MediaLibrary.createAssetAsync(tempFilePath);
      await MediaLibrary.createAlbumAsync(folderName, asset, false);
      
      // Clean up the temp file
      await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
      
      console.log(`Created subfolder: ${folderName}`);
    } else {
      console.log(`Subfolder ${folderName} already exists`);
    }
  } catch (error) {
    console.error(`Error creating subfolder ${folderName}:`, error);
  }
};

/**
 * Save a downloaded file to the device
 * @param {string} fileUri The URI of the file to save
 * @param {string} fileName The name to save the file as
 * @param {'video' | 'audio' | 'image'} type The type of file
 * @returns {Promise<string | null>} The path where the file was saved, or null on failure
 */
export const saveFile = async (
  fileUri: string,
  fileName: string,
  type: 'video' | 'audio' | 'image'
): Promise<string | null> => {
  // For web, return a mock result
  if (Platform.OS === 'web') {
    console.log('File saving not supported on web');
    return fileUri;
  }
  
  try {
    // Ensure we have permissions
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      console.log('No permissions to save file');
      return null;
    }
    
    // Determine which folder to save to
    let folderName = '';
    switch (type) {
      case 'video':
        folderName = VIDEO_FOLDER_NAME;
        break;
      case 'audio':
        folderName = AUDIO_FOLDER_NAME;
        break;
      case 'image':
        folderName = IMAGE_FOLDER_NAME;
        break;
      default:
        folderName = VIDEO_FOLDER_NAME;
    }
    
    // Create a unique file name if not provided
    if (!fileName) {
      fileName = `${type}_${uuidv4()}`;
    }
    
    // Ensure file has the right extension
    if (!fileName.includes('.')) {
      if (type === 'video') fileName += '.mp4';
      else if (type === 'audio') fileName += '.mp3';
      else if (type === 'image') fileName += '.jpg';
    }
    
    // Path to save the file in FileSystem cache first
    const fileDestination = `${FileSystem.cacheDirectory}${fileName}`;
    
    // Copy file to cache location
    await FileSystem.copyAsync({
      from: fileUri,
      to: fileDestination,
    });
    
    // Save to MediaLibrary
    const asset = await MediaLibrary.createAssetAsync(fileDestination);
    
    // Add to appropriate album
    await MediaLibrary.createAlbumAsync(APP_FOLDER_NAME, asset, false);
    console.log(`File saved to ${APP_FOLDER_NAME}/${folderName}/${fileName}`);
    
    // Clean up the cache file
    await FileSystem.deleteAsync(fileDestination, { idempotent: true });
    
    return asset.uri;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
};