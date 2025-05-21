import AsyncStorage from '@react-native-async-storage/async-storage';
import { logActivity } from './api';
import { v4 as uuidv4 } from 'uuid';

// Constants
const LOG_STORAGE_KEY = 'social_media_downloader_logs';
const MAX_LOG_ENTRIES = 100;

// Log types
type LogType = 'download_attempt' | 'download_complete' | 'download_error' | 'permission_granted' | 'permission_denied' | 'user_consent';

/**
 * Log a download attempt
 * @param url The URL that was attempted
 * @param platform The detected platform
 */
export const logDownloadAttempt = async (
  url: string,
  platform: string
): Promise<void> => {
  const logEntry = {
    id: uuidv4(),
    type: 'download_attempt' as LogType,
    timestamp: new Date().toISOString(),
    url,
    platform,
  };
  
  await saveLog(logEntry);
  
  // Also send to API if available
  try {
    await logActivity(logEntry);
  } catch (error) {
    console.log('Error sending log to API:', error);
  }
};

/**
 * Log a completed download
 * @param url The URL that was downloaded
 * @param platform The detected platform
 * @param contentType The type of content (video, audio, image)
 * @param fileName The name of the saved file
 */
export const logDownloadComplete = async (
  url: string,
  platform: string,
  contentType: 'video' | 'audio' | 'image',
  fileName: string
): Promise<void> => {
  const logEntry = {
    id: uuidv4(),
    type: 'download_complete' as LogType,
    timestamp: new Date().toISOString(),
    url,
    platform,
    contentType,
    fileName,
  };
  
  await saveLog(logEntry);
  
  // Also send to API if available
  try {
    await logActivity(logEntry);
  } catch (error) {
    console.log('Error sending log to API:', error);
  }
};

/**
 * Log when the user gives consent for downloading content
 * @param url The URL for which consent was given
 * @param platform The platform of the content
 */
export const logDownloadConsent = async (
  url: string,
  platform: string
): Promise<void> => {
  const logEntry = {
    id: uuidv4(),
    type: 'user_consent' as LogType,
    timestamp: new Date().toISOString(),
    url,
    platform,
  };
  
  await saveLog(logEntry);
  
  // Also send to API if available
  try {
    await logActivity(logEntry);
  } catch (error) {
    console.log('Error sending log to API:', error);
  }
};

/**
 * Save a log entry to AsyncStorage
 * @param logEntry The log entry to save
 */
const saveLog = async (logEntry: any): Promise<void> => {
  try {
    // Get existing logs
    const existingLogsJson = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    
    // Add new log entry at the beginning
    existingLogs.unshift(logEntry);
    
    // Trim logs if they exceed maximum
    if (existingLogs.length > MAX_LOG_ENTRIES) {
      existingLogs.length = MAX_LOG_ENTRIES;
    }
    
    // Save logs back to storage
    await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

/**
 * Get all activity logs
 * @returns {Promise<any[]>} All logs
 */
export const getActivityLogs = async (): Promise<any[]> => {
  try {
    const logsJson = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return [];
  }
};

/**
 * Clear all activity logs
 */
export const clearActivityLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOG_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing logs:', error);
  }
};