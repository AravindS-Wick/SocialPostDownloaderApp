import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03A9F4',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#B00020',
    text: '#212121',
    onBackground: '#212121',
    onSurface: '#212121',
  },
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196F3',
    secondary: '#03A9F4',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    text: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
  },
};
