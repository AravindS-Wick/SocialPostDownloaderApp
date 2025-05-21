import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  token: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  connectedPlatforms: string[];
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  connectedPlatforms: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.connectedPlatforms = [];
    },
    connectPlatform: (state, action: PayloadAction<string>) => {
      if (!state.connectedPlatforms.includes(action.payload)) {
        state.connectedPlatforms.push(action.payload);
      }
    },
    disconnectPlatform: (state, action: PayloadAction<string>) => {
      state.connectedPlatforms = state.connectedPlatforms.filter(
        (platform) => platform !== action.payload
      );
    },
  },
});

export const { setUser, logout, connectPlatform, disconnectPlatform } = authSlice.actions;

export default authSlice.reducer;