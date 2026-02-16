import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BatchItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number | null;
  platform: string;
  selected: boolean;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
}

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  availableResolutions: string[];
  downloadType: 'video' | 'audio' | 'image';
  downloadId: string | null;
  error: string | null;
  batchItems: BatchItem[];
  batchMode: boolean;
}

const initialState: DownloadState = {
  isDownloading: false,
  progress: 0,
  availableResolutions: [],
  downloadType: 'video',
  downloadId: null,
  error: null,
  batchItems: [],
  batchMode: false,
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
    setBatchItems: (state, action: PayloadAction<BatchItem[]>) => {
      state.batchItems = action.payload;
      state.batchMode = action.payload.length > 0;
    },
    appendBatchItems: (state, action: PayloadAction<BatchItem[]>) => {
      // Deduplicate by id before appending
      const existingIds = new Set(state.batchItems.map(i => i.id));
      const newItems = action.payload.filter(i => !existingIds.has(i.id));
      state.batchItems.push(...newItems);
      state.batchMode = state.batchItems.length > 0;
    },
    toggleBatchItemSelection: (state, action: PayloadAction<string>) => {
      const item = state.batchItems.find(i => i.id === action.payload);
      if (item) item.selected = !item.selected;
    },
    selectAllBatchItems: (state) => {
      state.batchItems.forEach(i => { i.selected = true; });
    },
    deselectAllBatchItems: (state) => {
      state.batchItems.forEach(i => { i.selected = false; });
    },
    setBatchItemStatus: (state, action: PayloadAction<{ id: string; status: BatchItem['status']; progress?: number }>) => {
      const item = state.batchItems.find(i => i.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
        if (action.payload.progress !== undefined) item.progress = action.payload.progress;
      }
    },
    resetBatchState: (state) => {
      state.batchItems = [];
      state.batchMode = false;
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
  setBatchItems,
  appendBatchItems,
  toggleBatchItemSelection,
  selectAllBatchItems,
  deselectAllBatchItems,
  setBatchItemStatus,
  resetBatchState,
} = downloadSlice.actions;

export default downloadSlice.reducer;