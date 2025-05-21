import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  platform: string;
  type: 'video' | 'audio' | 'image';
  quality: string;
  createdAt: string;
  fileSize?: string;
  filePath?: string;
}

interface HistoryState {
  downloads: DownloadHistoryItem[];
}

const initialState: HistoryState = {
  downloads: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addDownloadToHistory: (state, action: PayloadAction<DownloadHistoryItem>) => {
      state.downloads.unshift(action.payload);
    },
    removeDownloadFromHistory: (state, action: PayloadAction<string>) => {
      state.downloads = state.downloads.filter(
        (download) => download.id !== action.payload
      );
    },
    clearHistory: (state) => {
      state.downloads = [];
    },
  },
});

export const {
  addDownloadToHistory,
  removeDownloadFromHistory,
  clearHistory,
} = historySlice.actions;

export default historySlice.reducer;