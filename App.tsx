import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type RootState } from './src/store';
import AppNavigator, { RootStackParamList } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { setupFolders } from './src/services/storage';
import { requestPermissionsWithPrompt } from './src/services/permissions';
import { useShareIntentSafe } from './src/hooks/useShareIntentSafe';
import { Platform } from 'react-native';
import { lightTheme, darkTheme, navigationThemes } from './src/themes';

const URL_PATTERN = /https?:\/\/[^\s]+/i;

function AppContent() {
  const isDarkMode = useSelector((state: RootState) => state.settings?.darkMode ?? false);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? navigationThemes.DarkTheme : navigationThemes.LightTheme;
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const isNavigationReady = useRef(false);
  const pendingSharedUrl = useRef<string | null>(null);

  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentSafe();

  const navigateToHomeWithUrl = useCallback((url: string) => {
    if (isNavigationReady.current && navigationRef.current) {
      // Add timestamp to force React Navigation to treat this as new params
      // even if the same URL is shared twice
      navigationRef.current.navigate('Main', {
        screen: 'Home',
        params: { redownloadUrl: url, _ts: Date.now() },
      } as any);
    } else {
      pendingSharedUrl.current = url;
    }
  }, []);

  // Handle incoming share intents
  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      const sharedText = shareIntent.text || shareIntent.webUrl || '';
      const match = sharedText.match(URL_PATTERN);
      if (match) {
        navigateToHomeWithUrl(match[0]);
      }
      resetShareIntent();
    }
  }, [hasShareIntent, shareIntent, navigateToHomeWithUrl, resetShareIntent]);

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

  const handleNavigationReady = () => {
    isNavigationReady.current = true;
    if (pendingSharedUrl.current) {
      navigateToHomeWithUrl(pendingSharedUrl.current);
      pendingSharedUrl.current = null;
    }
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer
        ref={navigationRef}
        theme={navTheme}
        onReady={handleNavigationReady}
      >
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
