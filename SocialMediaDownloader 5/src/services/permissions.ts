import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

// Request all necessary permissions for the app
export const setupPermissions = async (): Promise<boolean> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return true;
  }
  
  try {
    // Request media library permissions for saving files
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (!mediaLibraryPermission.granted) {
      console.warn('Media library permission not granted');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

// Check if all required permissions are granted
export const checkPermissions = async (): Promise<boolean> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return true;
  }
  
  try {
    // Check media library permissions
    const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();
    if (!mediaLibraryPermission.granted) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};
