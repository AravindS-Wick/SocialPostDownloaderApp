import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DownloadHistoryItem } from '../../types';

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
    removeFromHistory: (state, action: PayloadAction<string>) => {
      state.downloads = state.downloads.filter((item) => item.id !== action.payload);
    },
    clearHistory: (state) => {
      state.downloads = [];
    },
  },
});

export const { addDownloadToHistory, removeFromHistory, clearHistory } = historySlice.actions;

export default historySlice.reducer;