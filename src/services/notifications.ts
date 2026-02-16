import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notifications handler only if not in Expo Go or on web
if (!isExpoGo || Platform.OS === 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Request permission to send notifications
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    // Web doesn't need permissions for notifications
    return true;
  }

  // Show warning if using Expo Go with SDK 53+
  if (isExpoGo) {
    console.warn('Push notifications are not fully supported in Expo Go with SDK 53+');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permissions have not been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Check if we got permission
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Send a local notification
 * @param {NotificationContent} content The notification content
 * @returns {Promise<string|null>} The notification ID if sent successfully, null otherwise
 */
export const sendNotification = async (content: NotificationContent): Promise<string | null> => {
  try {
    // For web, use browser notifications if available
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(content.title, { body: content.body });
          return 'web-notification';
        }
      }
      return null;
    }

    // Show warning if using Expo Go with SDK 53+
    if (isExpoGo) {
      Alert.alert(
        'Notification Limitation',
        'Push notifications are not supported in Expo Go with SDK 53+. Please use a development build for full functionality.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Ensure we have permission first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return null;
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data || {},
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};
