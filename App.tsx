import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { setupFolders } from './src/services/storage';
import { checkAndRequestPermissions } from './src/services/permissions';
import { useEffect } from 'react';

export default function App() {
  // Initialize app services
  useEffect(() => {
    const initApp = async () => {
      // Request necessary permissions
      await checkAndRequestPermissions();
      
      // Setup storage folders
      await setupFolders();
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
