import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';
import { requestNotificationPermissions } from './notifications';

/**
 * Check and request all necessary permissions
 * @returns {Promise<boolean>} Whether all permissions were granted
 */
export const checkAndRequestPermissions = async (): Promise<boolean> => {
  try {
    const mediaPermission = await requestMediaLibraryPermissions();
    const notificationPermission = await requestNotificationPermissions();
    
    // On web, media permissions might not be supported
    if (Platform.OS === 'web') {
      return notificationPermission;
    }
    
    // Return true only if all permissions are granted
    return mediaPermission && notificationPermission;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

/**
 * Check if we have media library permissions
 * @returns {Promise<boolean>} Whether media library permissions are granted
 */
export const checkPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need media permissions in the same way
  }
  
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking media library permissions:', error);
    return false;
  }
};

/**
 * Request media library permissions
 * @returns {Promise<boolean>} Whether media library permissions were granted
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need media permissions in the same way
  }
  
  try {
    const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();
    
    // Return early if we already have permission
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Request permission
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    // If permission was denied, show explanation
    if (status !== 'granted') {
      showPermissionExplanation();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
};

/**
 * Show an explanation for why permissions are needed
 */
export const showPermissionExplanation = (): void => {
  Alert.alert(
    'Permission Required',
    'We need permission to save media to your device. Please enable this permission in your device settings.',
    [{ text: 'OK' }]
  );
};