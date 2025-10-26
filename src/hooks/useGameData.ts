import { useState, useEffect } from 'react';
import { gameAPI } from '@/lib/api';
import { Game, Question, Team } from '@/types/game';

// Optional: a type for combined game data
export interface GameWithDetails extends Game {
  teams: Team[];
  availableQuestions: Question[];
}

export function useGameData(gameId: string | number) {
  const [game, setGame] = useState<GameWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    let mounted = true;

    const loadGame = async () => {
      setIsLoading(true);
      try {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        if (isNaN(numericId)) throw new Error('Invalid game ID');

        // Fetch game details and questions in parallel
        const [gameData, questions] = await Promise.all([
          gameAPI.getGame(numericId),
          gameAPI.getAvailableQuestions(numericId)
        ]);

        if (mounted) {
          setGame({
            ...gameData,
            teams: gameData.teams || [],
            availableQuestions: questions || [],
          });
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Failed to load game data';
          setError(message);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadGame();

    return () => {
      mounted = false;
    };
  }, [gameId]);

  return { game, isLoading, error };
}
