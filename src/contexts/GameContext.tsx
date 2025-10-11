'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Game, Question, Team } from '@/types/game';

interface GameContextType {
  state: GameState;
  setCurrentGame: (game: Game) => void;
  setCurrentQuestion: (question: Question) => void;
  setCurrentTeamIndex: (index: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  updateTeamScore: (teamId: number, points: number) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  currentGame: undefined,
  currentTeamIndex: 0,
  currentQuestion: undefined,
  questionsRemaining: 0,
  phase: 'setup',
};

type GameAction =
  | { type: 'SET_CURRENT_GAME'; payload: Game }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question }
  | { type: 'SET_CURRENT_TEAM_INDEX'; payload: number }
  | { type: 'SET_PHASE'; payload: GameState['phase'] }
  | { type: 'UPDATE_TEAM_SCORE'; payload: { teamId: number; points: number } }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CURRENT_GAME':
      return {
        ...state,
        currentGame: action.payload,
        phase: 'board',
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
        phase: 'question',
      };
    case 'SET_CURRENT_TEAM_INDEX':
      return {
        ...state,
        currentTeamIndex: action.payload,
      };
    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      };
    case 'UPDATE_TEAM_SCORE':
      if (!state.currentGame) return state;
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          teams: state.currentGame.teams.map(team =>
            team.id === action.payload.teamId
              ? { ...team, score: team.score + action.payload.points }
              : team
          ),
        },
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setCurrentGame = (game: Game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
  };

  const setCurrentQuestion = (question: Question) => {
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: question });
  };

  const setCurrentTeamIndex = (index: number) => {
    dispatch({ type: 'SET_CURRENT_TEAM_INDEX', payload: index });
  };

  const setPhase = (phase: GameState['phase']) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  };

  const updateTeamScore = (teamId: number, points: number) => {
    dispatch({ type: 'UPDATE_TEAM_SCORE', payload: { teamId, points } });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        setCurrentGame,
        setCurrentQuestion,
        setCurrentTeamIndex,
        setPhase,
        updateTeamScore,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}