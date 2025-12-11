import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

export interface AuthState {
  token: string | null;
  user: any | null;
  isLoaded: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isLoaded: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token?: string | null; user?: any | null }>) => {
      state.token = action.payload.token ?? null;
      state.user = action.payload.user ?? null;
      state.isLoaded = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoaded = true;
    },
    markLoaded: (state) => {
      state.isLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: AnyAction) => {
      const payload = action.payload as { auth?: Partial<AuthState> } | undefined;
      if (payload && payload.auth) {
        state.token = payload.auth.token ?? state.token;
        state.user = payload.auth.user ?? state.user;
      }
      state.isLoaded = true;
    });
  },
});

export const { setCredentials, logout, markLoaded } = authSlice.actions;
export default authSlice.reducer;
