import 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { setupFolders } from './src/services/storage';
import { requestPermissionsWithPrompt } from './src/services/permissions';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function App() {
  // Initialize app services
  useEffect(() => {
    const initApp = async () => {
      try {
        // Setup storage folders first
        await setupFolders();
        
        // Request permissions with user-friendly prompt - ONLY ONCE at startup
        if (Platform.OS === 'android') {
          // Give a small delay to let the app fully load
          setTimeout(async () => {
            const granted = await requestPermissionsWithPrompt();
            if (granted) {
              console.log('✅ Media library permissions granted at startup');
            } else {
              console.log('⚠️ Media library permissions denied - files will be saved to app directory only');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
      }
    };
    
    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
