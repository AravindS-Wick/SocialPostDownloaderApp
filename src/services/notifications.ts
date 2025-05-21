import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
    // Ensure we have permission first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission && Platform.OS !== 'web') {
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