import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import gameReducer from './gameSlice';
import authReducer from './authSlice';

const gamePersistConfig = {
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

const authPersistConfig = {
  key: 'trivia-spirit-auth',
  storage,
  whitelist: ['token', 'user'],
};

const persistedGameReducer = persistReducer(gamePersistConfig, gameReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    game: persistedGameReducer,
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
      },
    }),
});

export const persistor = persistStore(store);

/**
 * Listen for game end actions and purge persisted storage
 * Keeps questions/playedQuestions in memory during active game (for reload resilience)
 * but wipes them from localStorage after game ends (for cleanup)
 */
let purgeScheduled = false;

store.subscribe(() => {
  const state = store.getState();
  const gameState = state.game;
  
  // When game becomes inactive (endGame/resetGame), schedule purge (with guard to prevent infinite loop)
  if (!gameState.isGameActive && gameState.gameId === null && !purgeScheduled) {
    purgeScheduled = true;
    // Defer purge to avoid re-triggering during rehydration
    setTimeout(() => {
      persistor.purge();
      purgeScheduled = false;
    }, 0);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
