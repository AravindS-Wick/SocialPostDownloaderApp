import AsyncStorage from '@react-native-async-storage/async-storage';
import { logActivity } from './api';

// Log user activity to local storage and server (if available)
const logToStorage = async (activityData: any): Promise<void> => {
  try {
    // Get existing logs
    const logsJson = await AsyncStorage.getItem('activity_logs');
    let logs = [];
    
    if (logsJson) {
      logs = JSON.parse(logsJson);
    }
    
    // Add new log with timestamp
    logs.unshift({
      ...activityData,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only the latest 1000 logs
    logs = logs.slice(0, 1000);
    
    // Save back to storage
    await AsyncStorage.setItem('activity_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging to storage:', error);
  }
};

// Log download attempt
export const logDownloadAttempt = async (
  url: string,
  platform: string,
  type: 'video' | 'audio' | 'image'
): Promise<void> => {
  const logData = {
    type: platform,
    status: 'attempt' as const,
    meta: { url, downloadType: type },
    ageConsent: false,
  };
  
  // Log locally
  await logToStorage(logData);
  
  // Log to server
  await logActivity(logData);
};

// Log download completion (success or failure)
export const logDownloadComplete = async (
  url: string,
  platform: string,
  type: 'video' | 'audio' | 'image',
  success: boolean,
  error?: string
): Promise<void> => {
  const logData = {
    type: platform,
    status: 'complete' as const,
    meta: { url, downloadType: type, success, error },
    ageConsent: false,
  };
  
  // Log locally
  await logToStorage(logData);
  
  // Log to server
  await logActivity(logData);
};

// Log age consent
export const logDownloadConsent = async (
  url: string,
  platform: string,
  type: 'video' | 'audio' | 'image',
  consent: boolean
): Promise<void> => {
  const logData = {
    type: platform,
    status: 'consent' as const,
    meta: { url, downloadType: type },
    ageConsent: consent,
  };
  
  // Log locally
  await logToStorage(logData);
  
  // Log to server
  await logActivity(logData);
};

// Get activity logs
export const getActivityLogs = async (): Promise<any[]> => {
  try {
    const logsJson = await AsyncStorage.getItem('activity_logs');
    
    if (logsJson) {
      return JSON.parse(logsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return [];
  }
};

// Clear activity logs
export const clearActivityLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('activity_logs');
  } catch (error) {
    console.error('Error clearing activity logs:', error);
  }
};
