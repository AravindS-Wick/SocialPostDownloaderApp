import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  notificationsEnabled: boolean;
  downloadQualityAuto: boolean;
  saveToGallery: boolean;
  darkMode: boolean;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  downloadQualityAuto: true,
  saveToGallery: true,
  darkMode: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleDownloadQualityAuto: (state) => {
      state.downloadQualityAuto = !state.downloadQualityAuto;
    },
    toggleSaveToGallery: (state) => {
      state.saveToGallery = !state.saveToGallery;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const { 
  toggleNotifications, 
  toggleDownloadQualityAuto, 
  toggleSaveToGallery, 
  toggleDarkMode,
  updateSettings,
  resetSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;