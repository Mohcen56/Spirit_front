import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Team, Question } from '@/types/game';

interface GameState {
  currentTeam: number;
  gameId: string | null;
  totalTeams: number;
  isGameActive: boolean;
  teams: Team[];
  doublePerkActiveTeamId: number | null;
  doublePerkUsed: Record<number, boolean>;
  rerollPerkUsed: Record<number, boolean>;
  questions: Question[];
  playedQuestions: number[];
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
  questions: [],
  playedQuestions: [],
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
      state.currentTeam = Math.floor(Math.random() * Math.max(totalTeams, 1)) + 1;
    },
    switchToNextTeam: (state) => {
      if (state.isGameActive && state.totalTeams > 0) {
        state.currentTeam = (state.currentTeam % state.totalTeams) + 1;
      }
    },
    setCurrentTeam: (state, action: PayloadAction<number>) => {
      if (state.isGameActive && action.payload >= 1 && action.payload <= state.totalTeams) {
        state.currentTeam = action.payload;
      }
    },
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload.map((team) => ({ ...team, score: team.score ?? 0 }));
      state.totalTeams = action.payload.length || state.totalTeams;
      for (const team of action.payload) {
        if (state.doublePerkUsed[team.id] === undefined) {
          state.doublePerkUsed[team.id] = false;
        }
        if (state.rerollPerkUsed[team.id] === undefined) {
          state.rerollPerkUsed[team.id] = false;
        }
      }
    },
    awardPoints: (state, action: PayloadAction<{ teamId: number; delta: number }>) => {
      const { teamId, delta } = action.payload;
      const team = state.teams.find((t) => t.id === teamId);
      if (team) {
        const nextScore = (team.score ?? 0) + delta;
        team.score = Math.max(0, nextScore);
      }
    },
    setTeamScore: (state, action: PayloadAction<{ teamId: number; score: number }>) => {
      const { teamId, score } = action.payload;
      const team = state.teams.find((t) => t.id === teamId);
      if (team) {
        team.score = Math.max(0, score);
      }
    },
    resetScores: (state) => {
      state.teams = state.teams.map((team) => ({ ...team, score: 0 }));
    },
    endGame: (state) => {
      state.isGameActive = false;
      state.gameId = null;
      state.currentTeam = 1;
      state.totalTeams = 2;
      state.doublePerkActiveTeamId = null;
    },
    activateDoublePerk: (state, action: PayloadAction<{ teamId: number }>) => {
      const { teamId } = action.payload;
      const currentIndex = Math.max(0, state.currentTeam - 1);
      const currentTurnTeamId = state.teams[currentIndex]?.id;
      const isTeamsTurn = currentTurnTeamId === teamId;
      if (isTeamsTurn && !state.doublePerkUsed[teamId] && state.doublePerkActiveTeamId === null) {
        state.doublePerkActiveTeamId = teamId;
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
      const currentIndex = Math.max(0, state.currentTeam - 1);
      const currentTurnTeamId = state.teams[currentIndex]?.id;
      const isTeamsTurn = currentTurnTeamId === teamId;
      if (isTeamsTurn && !state.rerollPerkUsed[teamId]) {
        state.rerollPerkUsed[teamId] = true;
      }
    },
    setGameQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.playedQuestions = [];
    },
    markQuestionPlayed: (state, action: PayloadAction<number>) => {
      const questionId = action.payload;
      if (!state.playedQuestions.includes(questionId)) {
        state.playedQuestions.push(questionId);
      }
    },
    resetGame: (state) => {
      state.currentTeam = 1;
      state.gameId = null;
      state.totalTeams = 2;
      state.isGameActive = false;
      state.teams = [];
      state.doublePerkActiveTeamId = null;
      state.doublePerkUsed = {};
      state.rerollPerkUsed = {};
      state.questions = [];
      state.playedQuestions = [];
    },
  },
});

export const {
  startGame,
  switchToNextTeam,
  setCurrentTeam,
  setTeams,
  awardPoints,
  setTeamScore,
  resetScores,
  endGame,
  activateDoublePerk,
  clearActivePerk,
  resetPerks,
  activateRerollPerk,
  setGameQuestions,
  markQuestionPlayed,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
