import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

/**
 * Check and request all necessary permissions
 * @returns {Promise<boolean>} Whether all permissions were granted
 */
export const checkAndRequestPermissions = async (): Promise<boolean> => {
  // Only check media library permissions on mobile platforms
  if (Platform.OS === 'web') {
    console.log('Skipping permission check on web platform');
    return true;
  }

  return await checkMediaLibraryPermissions();
};

/**
 * Check if we have media library permissions
 * @returns {Promise<boolean>} Whether media library permissions are granted
 */
export const checkMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  
  const { status } = await MediaLibrary.getPermissionsAsync();
  return status === 'granted';
};

/**
 * Request media library permissions
 * @returns {Promise<boolean>} Whether media library permissions were granted
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  
  if (status !== 'granted' && canAskAgain) {
    showPermissionExplanation();
  }
  
  return status === 'granted';
};

/**
 * Show an explanation for why permissions are needed
 */
export const showPermissionExplanation = (): void => {
  Alert.alert(
    'Permission Required',
    'This app needs access to your media library to save downloaded media files.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => console.log('Open settings') },
    ]
  );
};