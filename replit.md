# Social Media Downloader Application Overview

## User Preferences
```
Preferred communication style: Simple, everyday language.
```

## Overview

Social Media Downloader is a React Native application built with Expo that enables users to download videos, images, and audio from various social media platforms like YouTube, Instagram, Twitter, TikTok, and Facebook. The app provides a user-friendly interface for entering URLs, selecting download quality, and managing downloaded content.

## System Architecture

### Frontend Architecture
- **React Native + Expo**: The application is built using React Native through the Expo framework, allowing for cross-platform (iOS, Android, Web) development.
- **State Management**: Redux (Redux Toolkit) is used for centralized state management.
- **Navigation**: React Navigation handles the routing between screens with a bottom tab layout for main navigation and stack navigation for detail screens.
- **UI Framework**: React Native Paper provides pre-built UI components with theming support.
- **Theme System**: Supports both light and dark themes through React Native Paper's theming system.

### Backend Integration
- The app is designed to work with a backend service that handles the actual media extraction and processing.
- API calls are made using Axios to communicate with the backend.
- Mock API implementations are currently in place for development/demonstration purposes.

### Storage
- **Local Storage**: AsyncStorage is used for persisting user preferences and download history.
- **File System**: Expo FileSystem manages downloading and storing media files.
- **Media Library**: Expo MediaLibrary is used to save downloaded content to the user's device gallery.

### Authentication
- Basic authentication system is in place but currently bypassed for easier development.
- Token-based authentication is set up for future implementation.

## Key Components

### Screens
1. **MainScreen**: Entry point with URL input and platform selection
2. **DownloadScreen**: Where users select download options and quality
3. **HistoryScreen**: Shows past downloads
4. **SettingsScreen**: User preferences and app configuration

### Services
1. **DownloadService**: Handles media information extraction and downloading
2. **API Service**: Communication with backend
3. **Notifications**: Manages push notifications for download status
4. **Permissions**: Handles device permission requests
5. **Storage**: Manages file storage and media library integration
6. **Logger**: Tracks user activity and errors

### State Management
The Redux store is organized into these slices:
1. **authSlice**: User authentication state
2. **downloadSlice**: Download progress and options
3. **historySlice**: Download history
4. **settingsSlice**: App settings and preferences

## Data Flow

1. **URL Entry**: User enters a social media URL on MainScreen
2. **Platform Detection**: App automatically detects the social media platform from the URL
3. **Media Information Retrieval**: API requests metadata about the media (available formats, qualities)
4. **Download Options**: User selects preferred format and quality
5. **Download Process**: Content is downloaded with progress tracking
6. **Storage**: Downloaded content is saved to device
7. **History Logging**: Download is recorded in history

## External Dependencies

### Core Dependencies
- `expo`: Main framework for React Native development
- `react-navigation`: Navigation solution
- `@reduxjs/toolkit` & `react-redux`: State management
- `axios`: HTTP client for API calls
- `react-native-paper`: Material Design components
- `@react-native-async-storage/async-storage`: Persistent storage

### Media & File Handling
- `expo-file-system`: File manipulation
- `expo-media-library`: Access to device media library
- `expo-notifications`: Push notifications

### UI Enhancements
- `react-native-gesture-handler`: Touch gesture handling
- `react-native-safe-area-context`: Safe area rendering
- `expo-linear-gradient`: Gradient UI elements
- `@expo/vector-icons`: Icon library

## Deployment Strategy

### Mobile Deployment
- The app can be built for iOS and Android using Expo's build service or EAS (Expo Application Services).
- App Store and Play Store distribution would require setting up the appropriate developer accounts.

### Web Deployment
- The app supports web deployment through Expo's web platform.
- The current Replit configuration runs the web version on port 5000.
- The web version has certain limitations in terms of file system access compared to mobile.

### Development Environment
- For local development, the app can be run using Expo CLI.
- For Replit, the app is configured to run in web mode with appropriate port configuration.

## Project Structure Notes

- `/src`: Contains all source code
  - `/components`: Reusable UI components
  - `/screens`: Main application screens
  - `/services`: Service modules for API, downloading, etc.
  - `/store`: Redux store setup and slices
  - `/styles`: Theme definitions and global styles
  - `/types`: TypeScript type definitions
  - `/utils`: Utility functions

## Development Guidelines

1. **State Management**: Use Redux for global state, local state for component-specific concerns
2. **Permissions**: Always check permissions before accessing device features
3. **Error Handling**: Implement proper error handling for API calls and file operations
4. **Theme Compatibility**: Ensure all UI components respect the selected theme
5. **Platform Differences**: Account for platform differences (iOS/Android/Web) especially for file system operations