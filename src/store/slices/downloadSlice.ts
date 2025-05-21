import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  availableResolutions: string[];
  downloadType: 'video' | 'audio' | 'image';
  downloadId: string | null;
  error: string | null;
}

const initialState: DownloadState = {
  isDownloading: false,
  progress: 0,
  availableResolutions: [],
  downloadType: 'video',
  downloadId: null,
  error: null,
};

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    setIsDownloading: (state, action: PayloadAction<boolean>) => {
      state.isDownloading = action.payload;
      if (!action.payload) {
        state.progress = 0;
      }
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setAvailableResolutions: (state, action: PayloadAction<string[]>) => {
      state.availableResolutions = action.payload;
    },
    setDownloadType: (state, action: PayloadAction<'video' | 'audio' | 'image'>) => {
      state.downloadType = action.payload;
    },
    setDownloadId: (state, action: PayloadAction<string | null>) => {
      state.downloadId = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetDownloadState: (state) => {
      state.isDownloading = false;
      state.progress = 0;
      state.downloadId = null;
      state.error = null;
    },
  },
});

export const {
  setIsDownloading,
  setProgress,
  setAvailableResolutions,
  setDownloadType,
  setDownloadId,
  setError,
  resetDownloadState,
} = downloadSlice.actions;

export default downloadSlice.reducer;