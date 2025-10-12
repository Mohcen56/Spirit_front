import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  currentTeam: number;
  gameId: string | null;
  totalTeams: number;
  isGameActive: boolean;
}

const initialState: GameState = {
  currentTeam: 1,
  gameId: null,
  totalTeams: 2,
  isGameActive: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<{ gameId: string; totalTeams: number }>) => {
      const { gameId, totalTeams } = action.payload;
      state.gameId = gameId;
      state.totalTeams = totalTeams;
      state.isGameActive = true;
      // Pick random team to start (1 or 2, or up to totalTeams)
      state.currentTeam = Math.floor(Math.random() * totalTeams) + 1;
    },
    switchToNextTeam: (state) => {
      if (state.isGameActive) {
        state.currentTeam = (state.currentTeam % state.totalTeams) + 1;
      }
    },
    setCurrentTeam: (state, action: PayloadAction<number>) => {
      if (state.isGameActive && action.payload >= 1 && action.payload <= state.totalTeams) {
        state.currentTeam = action.payload;
      }
    },
    endGame: (state) => {
      state.isGameActive = false;
      state.gameId = null;
      state.currentTeam = 1;
      state.totalTeams = 2;
    },
  },
});

export const { startGame, switchToNextTeam, setCurrentTeam, endGame } = gameSlice.actions;
export default gameSlice.reducer;