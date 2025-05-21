import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { RootState } from './store';
import { lightTheme, darkTheme } from './styles/theme';
import AppNavigator from './navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppWrapper() {
  const [appIsReady, setAppIsReady] = useState(false);
  const isDarkMode = useSelector((state: RootState) => state.settings.isDarkMode);

  // Initialize app and load resources
  useEffect(() => {
    async function prepare() {
      try {
        // Load resources, check permissions, etc.
        // Add initialization logic here such as:
        // - Check for storage permissions
        // - Load cached downloads
        // - Restore user settings
        
        // Artificial delay for splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  // Select theme based on user preference
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <NavigationContainer theme={theme as any}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});