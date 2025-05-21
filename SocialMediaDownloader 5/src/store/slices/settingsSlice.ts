import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  isDarkMode: boolean;
  allowAgeRestricted: boolean;
  autoDownload: boolean;
  notificationsEnabled: boolean;
  saveLocation: string;
}

const initialState: SettingsState = {
  isDarkMode: false,
  allowAgeRestricted: false,
  autoDownload: false,
  notificationsEnabled: true,
  saveLocation: 'downloads',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleAllowAgeRestricted: (state) => {
      state.allowAgeRestricted = !state.allowAgeRestricted;
    },
    setAllowAgeRestricted: (state, action: PayloadAction<boolean>) => {
      state.allowAgeRestricted = action.payload;
    },
    toggleAutoDownload: (state) => {
      state.autoDownload = !state.autoDownload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    setSaveLocation: (state, action: PayloadAction<string>) => {
      state.saveLocation = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleAllowAgeRestricted,
  setAllowAgeRestricted,
  toggleAutoDownload,
  toggleNotifications,
  setSaveLocation,
} = settingsSlice.actions;

export default settingsSlice.reducer;