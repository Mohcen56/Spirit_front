import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Team } from '@/types/game';

interface GameState {
  currentTeam: number;
  gameId: string | null;
  totalTeams: number;
  isGameActive: boolean;
  teams: Team[]; // keep live team scores locally during the game
  // Perk state: one-time double points per team
  doublePerkActiveTeamId: number | null;
  doublePerkUsed: Record<number, boolean>;
  // Perk state: one-time reroll/change-question per team
  rerollPerkUsed: Record<number, boolean>;
}

const initialState: GameState = {
  currentTeam: 1,
  gameId: null,
  totalTeams: 2,
  isGameActive: false,
  teams: [],
  doublePerkActiveTeamId: null,
  doublePerkUsed: {},
  rerollPerkUsed: {},
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
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload.map(t => ({ ...t, score: t.score ?? 0 }));
      state.totalTeams = action.payload.length || state.totalTeams;
      // Initialize perk usage for any new teams
      for (const t of action.payload) {
        if (state.doublePerkUsed[t.id] === undefined) {
          state.doublePerkUsed[t.id] = false;
        }
        if (state.rerollPerkUsed[t.id] === undefined) {
          state.rerollPerkUsed[t.id] = false;
        }
      }
    },
    awardPoints: (
      state,
      action: PayloadAction<{ teamId: number; delta: number }>
    ) => {
      const { teamId, delta } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        const next = (team.score ?? 0) + delta;
        team.score = Math.max(0, next);
      }
    },
    setTeamScore: (
      state,
      action: PayloadAction<{ teamId: number; score: number }>
    ) => {
      const { teamId, score } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      if (team) team.score = Math.max(0, score);
    },
    resetScores: (state) => {
      state.teams = state.teams.map(t => ({ ...t, score: 0 }));
    },
    endGame: (state) => {
      state.isGameActive = false;
      state.gameId = null;
      state.currentTeam = 1;
      state.totalTeams = 2;
      // Keep teams so results page can show final scores.
      // Teams will be replaced on the next game start/load.
      state.doublePerkActiveTeamId = null;
    },
    activateDoublePerk: (state, action: PayloadAction<{ teamId: number }>) => {
      const { teamId } = action.payload;
      // Determine which team is currently on turn (by index in teams array)
      const currentIdx = Math.max(0, state.currentTeam - 1);
      const currentTurnTeamId = state.teams[currentIdx]?.id;
      const isTeamsTurn = currentTurnTeamId === teamId;
      // Allow only if this team hasn't used it, none currently active, and it's this team's turn
      if (isTeamsTurn && !state.doublePerkUsed[teamId] && state.doublePerkActiveTeamId === null) {
        state.doublePerkActiveTeamId = teamId;
        // Consume immediately (benefit applies only if they get points next)
        state.doublePerkUsed[teamId] = true;
      }
    },
    clearActivePerk: (state) => {
      state.doublePerkActiveTeamId = null;
    },
    resetPerks: (state) => {
      state.doublePerkActiveTeamId = null;
      state.doublePerkUsed = {};
      state.rerollPerkUsed = {};
    },
    activateRerollPerk: (state, action: PayloadAction<{ teamId: number }>) => {
      const { teamId } = action.payload;
      const currentIdx = Math.max(0, state.currentTeam - 1);
      const currentTurnTeamId = state.teams[currentIdx]?.id;
      const isTeamsTurn = currentTurnTeamId === teamId;
      if (isTeamsTurn && !state.rerollPerkUsed[teamId]) {
        state.rerollPerkUsed[teamId] = true;
      }
    },
    resetGame: () => initialState,
  },
});

export const { startGame, switchToNextTeam, setCurrentTeam, setTeams, awardPoints, setTeamScore, resetScores, endGame, activateDoublePerk, clearActivePerk, resetPerks, activateRerollPerk, resetGame } = gameSlice.actions;
export default gameSlice.reducer;