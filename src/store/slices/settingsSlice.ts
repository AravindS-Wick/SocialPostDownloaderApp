import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type QualityPreference = 'best' | '1080p' | '720p' | '480p' | '360p' | 'manual';

export interface SettingsState {
  notificationsEnabled: boolean;
  downloadQualityAuto: boolean;
  qualityPreference: QualityPreference;
  saveToGallery: boolean;
  darkMode: boolean;
  downloadPath: string;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  downloadQualityAuto: true,
  qualityPreference: 'best',
  saveToGallery: true,
  darkMode: false,
  downloadPath: 'SocialSaver',
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
    setQualityPreference: (state, action: PayloadAction<QualityPreference>) => {
      state.qualityPreference = action.payload;
      // Sync the legacy boolean: 'manual' means user picks each time
      state.downloadQualityAuto = action.payload !== 'manual';
    },
    toggleSaveToGallery: (state) => {
      state.saveToGallery = !state.saveToGallery;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDownloadPath: (state, action: PayloadAction<string>) => {
      const sanitized = action.payload.replace(/[/\\:*?"<>|]/g, '').trim();
      state.downloadPath = sanitized || 'SocialSaver';
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
    resetSettings: () => initialState,
  },
});

export const {
  toggleNotifications,
  toggleDownloadQualityAuto,
  setQualityPreference,
  toggleSaveToGallery,
  toggleDarkMode,
  setDownloadPath,
  updateSettings,
  resetSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;
