import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Interface for notification data
interface NotificationContent {
  title: string;
  body: string;
  data?: object;
}

// Request permissions for notifications
export const requestNotificationPermissions = async (): Promise<boolean> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    return false;
  }
  
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Send a local notification
export const sendNotification = async (content: NotificationContent): Promise<string | null> => {
  // Skip for web platform
  if (Platform.OS === 'web') {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(content.title, { body: content.body });
        return 'web-notification';
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(content.title, { body: content.body });
          return 'web-notification';
        }
      }
    }
    return null;
  }
  
  try {
    // Ensure we have permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return null;
    }
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data || {},
      },
      trigger: null, // Trigger immediately
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};
