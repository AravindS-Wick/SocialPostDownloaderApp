import { DefaultTheme } from 'react-native-paper';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a6da7',
    accent: '#f56565',
    background: '#f7f7f7',
    surface: '#ffffff',
    text: '#333333',
    placeholder: '#888888',
    card: '#ffffff',
    border: '#e0e0e0',
  },
};

export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5b89c7',
    accent: '#ff8c8c',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#f0f0f0',
    placeholder: '#aaaaaa',
    card: '#2a2a2a',
    border: '#444444',
  },
};

export default { lightTheme, darkTheme };