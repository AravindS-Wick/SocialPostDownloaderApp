
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { lightTheme, darkTheme } from './themes';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: MD3LightTheme,
  reactNavigationDark: darkTheme,
});

const AppContent = () => {
  const isDarkMode = useSelector((state) => state.settings?.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function AppWrapper() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <AppContent />
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
