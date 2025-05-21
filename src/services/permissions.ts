import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';

// Combined function to check and request permissions if needed
export const checkAndRequestPermissions = async (): Promise<boolean> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return true;
  }
  
  try {
    // Check media library permissions first
    const mediaPermission = await MediaLibrary.getPermissionsAsync();
    
    if (mediaPermission.granted) {
      return true;
    }
    
    // If not granted, request permissions
    const mediaRequestResult = await MediaLibrary.requestPermissionsAsync();
    
    if (!mediaRequestResult.granted) {
      showPermissionExplanation();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error handling permissions:', error);
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
    return mediaLibraryPermission.granted;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Request permissions explicitly
export const requestPermissions = async (): Promise<boolean> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return true;
  }
  
  try {
    // Request media library permissions for saving files
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    
    if (!mediaLibraryPermission.granted) {
      showPermissionExplanation();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

// Show alert explaining the need for permissions
export const showPermissionExplanation = (): void => {
  Alert.alert(
    "Permission Required",
    "Storage permission is required to download and save files. Please grant this permission in your device settings to use this app.",
    [
      { 
        text: "OK", 
        style: "default" 
      }
    ]
  );
};
