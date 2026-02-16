import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type RootState } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { setupFolders } from './src/services/storage';
import { requestPermissionsWithPrompt } from './src/services/permissions';
import { Platform } from 'react-native';
import { lightTheme, darkTheme, navigationThemes } from './src/themes';

function AppContent() {
  const isDarkMode = useSelector((state: RootState) => state.settings?.darkMode ?? false);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? navigationThemes.DarkTheme : navigationThemes.LightTheme;

  useEffect(() => {
    const initApp = async () => {
      try {
        await setupFolders();

        if (Platform.OS === 'android') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const granted = await requestPermissionsWithPrompt();
          if (!granted) {
            console.log('Media library permissions denied - files will be saved to app directory only');
          }
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };

    initApp();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
