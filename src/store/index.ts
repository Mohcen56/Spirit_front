import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import gameReducer from './gameSlice';

const persistConfig = {
  key: 'trivia-spirit-game',
  storage,
  whitelist: [
    'currentTeam',
    'gameId',
    'totalTeams',
    'isGameActive',
    'teams',
    'doublePerkActiveTeamId',
    'doublePerkUsed',
    'rerollPerkUsed',
    'questions',
    'playedQuestions',
  ],
};

const persistedGameReducer = persistReducer(persistConfig, gameReducer);

export const store = configureStore({
  reducer: {
    game: persistedGameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
