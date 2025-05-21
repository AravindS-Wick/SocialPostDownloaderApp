import { configureStore } from '@reduxjs/toolkit';
import downloadReducer from './slices/downloadSlice';
import authReducer from './slices/authSlice';
import historyReducer from './slices/historySlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    download: downloadReducer,
    auth: authReducer,
    history: historyReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;