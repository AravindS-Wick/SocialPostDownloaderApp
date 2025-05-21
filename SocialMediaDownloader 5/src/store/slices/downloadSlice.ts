import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DownloadState {
  url: string;
  platform: string | null;
  downloadType: 'video' | 'audio' | 'image';
  resolution: string | null;
  isDownloading: boolean;
  progress: number;
  availableResolutions: string[];
}

const initialState: DownloadState = {
  url: '',
  platform: null,
  downloadType: 'video',
  resolution: null,
  isDownloading: false,
  progress: 0,
  availableResolutions: [],
};

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    setUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
    },
    setPlatform: (state, action: PayloadAction<string>) => {
      state.platform = action.payload;
    },
    setDownloadType: (state, action: PayloadAction<'video' | 'audio' | 'image'>) => {
      state.downloadType = action.payload;
    },
    setResolution: (state, action: PayloadAction<string>) => {
      state.resolution = action.payload;
    },
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
    resetDownload: (state) => {
      state.url = '';
      state.platform = null;
      state.resolution = null;
      state.isDownloading = false;
      state.progress = 0;
      state.availableResolutions = [];
    },
  },
});

export const {
  setUrl,
  setPlatform,
  setDownloadType,
  setResolution,
  setIsDownloading,
  setProgress,
  setAvailableResolutions,
  resetDownload,
} = downloadSlice.actions;

export default downloadSlice.reducer;