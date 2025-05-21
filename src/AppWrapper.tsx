import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider, DefaultTheme, adaptNavigationTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { setupFolders } from './services/storage';
import { checkAndRequestPermissions } from './services/permissions';
import { requestNotificationPermissions } from './services/notifications';
import { lightTheme, darkTheme } from './themes';

// Adapt the navigation theme to react-native-paper
const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
});

const AppWrapper = () => {
  // Initialize app services
  useEffect(() => {
    const initApp = async () => {
      // Request necessary permissions
      await checkAndRequestPermissions();
      
      // Setup storage folders
      await setupFolders();
      
      // Request notification permissions
      await requestNotificationPermissions();
    };
    
    initApp();
  }, []);

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={lightTheme}>
        <SafeAreaProvider>
          <NavigationContainer theme={LightTheme}>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default AppWrapper;
