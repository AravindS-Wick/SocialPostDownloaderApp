import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';

// Global permission status cache
let permissionStatus: 'granted' | 'denied' | 'undetermined' | null = null;
let permissionAskedBefore = false; // Track if we've asked before

export const checkAndRequestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  return await checkMediaLibraryPermissions();
};

export const checkPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  
  const { status } = await MediaLibrary.getPermissionsAsync();
  permissionStatus = status;
  return status === 'granted';
};

export const checkMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  
  // Use cached status if available and still valid
  if (permissionStatus === 'granted') {
    return true;
  }
  
  const { status } = await MediaLibrary.getPermissionsAsync();
  permissionStatus = status;
  return status === 'granted';
};

export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  
  // Check current status first
  if (await checkMediaLibraryPermissions()) {
    return true;
  }
  
  // Don't ask again if we've already asked and been denied
  if (permissionAskedBefore && permissionStatus === 'denied') {
    console.log('⚠️ Permissions previously denied, not asking again');
    return false;
  }
  
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  permissionStatus = status;
  permissionAskedBefore = true;
  
  if (status !== 'granted' && canAskAgain) {
    showPermissionExplanation();
  }
  
  return status === 'granted';
};

// New function to request permissions with user confirmation - ONLY call at startup
export const requestPermissionsWithPrompt = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }
  
  // Check if we already have permissions
  if (await checkMediaLibraryPermissions()) {
    return true;
  }
  
  // Don't ask again if we've already been denied
  if (permissionAskedBefore && permissionStatus === 'denied') {
    console.log('⚠️ Permissions previously denied, not showing prompt again');
    return false;
  }
  
  return new Promise((resolve) => {
    Alert.alert(
      'Media Library Access',
      'This app needs access to your media library to save downloaded videos, audio, and images. Would you like to grant permission?\n\nNote: You can change this later in Settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => {
            permissionAskedBefore = true;
            permissionStatus = 'denied';
            resolve(false);
          },
        },
        {
          text: 'Grant Permission',
          onPress: async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            permissionStatus = status;
            permissionAskedBefore = true;
            resolve(status === 'granted');
          },
        },
      ]
    );
  });
};

export const showPermissionExplanation = (): void => {
  Alert.alert(
    'Permission Required',
    'This app needs access to your media library to save downloaded media files. You can grant this permission in your device settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          // Note: Opening settings automatically is platform-specific
          // For now, just show instruction to user
          Alert.alert(
            'Open Settings',
            'Go to Settings > Apps > SocialSaver > Permissions > Storage and enable access.',
            [{ text: 'OK' }]
          );
        },
      },
    ]
  );
};

// Function to reset permission cache (useful for testing)
export const resetPermissionCache = (): void => {
  permissionStatus = null;
  permissionAskedBefore = false;
};
