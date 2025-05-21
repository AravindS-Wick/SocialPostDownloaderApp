import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import App from '../App';

// Mock necessary modules
jest.mock('expo-linking', () => ({
  useURL: jest.fn(() => null),
  createURL: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://document/',
  cacheDirectory: 'file://cache/',
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: true })),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file://test.mp4' })),
  })),
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  createAssetAsync: jest.fn(() => Promise.resolve({ id: '123' })),
  getAlbumsAsync: jest.fn(() => Promise.resolve([])),
  createAlbumAsync: jest.fn(() => Promise.resolve({ id: 'album1' })),
  addAssetsToAlbumAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Test the main App component
describe('App', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(toJSON()).not.toBeNull();
  });
});
