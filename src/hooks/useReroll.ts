"use client";
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { activateRerollPerk, markQuestionPlayed, setBackupQuestions, consumeBackupQuestion } from '@/store/gameSlice';
import { gamesAPI } from '@/lib/api';
import { Question } from '@/types/game';
import { logger } from '@/lib/utils/logger';

/**
 * useReroll
 * - Pops the next question from backupQuestions
 * - Replaces the current displayed question (navigates)
 * - Marks reroll as used for that team
 * - Auto-refills 4 backup questions if the list is empty
 */
export function useReroll(gameId: number | string, currentQuestion?: Question | null) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    currentTeam,
    teams,
    rerollPerkUsed,
    perksLocked,
    backupQuestions,
    playedQuestions,
    questions: boardQuestions,
  } = useAppSelector((s) => s.game);

  const fetchAndSetBackups = useCallback(async () => {
    try {
      const gid = Number(gameId);
      if (!Number.isFinite(gid)) return [] as Question[];
      const extras = await gamesAPI.prefetchOutsideBoard(gid, 4);
      const existingIds = new Set(boardQuestions.map(q => q.id));
      const filtered: Question[] = Array.isArray(extras)
        ? extras.filter((q) => (
            q && typeof q.id === 'number' &&
            q.id !== (currentQuestion?.id ?? -1) &&
            !playedQuestions.includes(q.id) &&
            !existingIds.has(q.id)
          ))
        : [];
      dispatch(setBackupQuestions(filtered));
      return filtered;
    } catch (e) {
      logger.warn('Failed to prefetch backup questions:', e);
      dispatch(setBackupQuestions([]));
      return [] as Question[];
    }
  }, [dispatch, gameId, currentQuestion?.id, playedQuestions, boardQuestions]);

  const reroll = useCallback(async (teamId: number) => {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    const isTeamsTurn = teamIndex === (currentTeam - 1);
    if (!isTeamsTurn || perksLocked) return;
    if (rerollPerkUsed[teamId]) return;

    // Filter backup questions to exclude already played ones
    const availableBackups = backupQuestions.filter(q => !playedQuestions.includes(q.id));
    
    if (availableBackups.length === 0) {
      logger.warn('No backup questions available for reroll');
      return;
    }

    const next = availableBackups[0];
    if (!next) return;

    // Mark reroll perk as used for this team
    dispatch(activateRerollPerk({ teamId }));
    
    // Mark current question as played
    if (currentQuestion?.id) {
      dispatch(markQuestionPlayed(currentQuestion.id));
    }
    
    // Consume the backup question from Redux list
    dispatch(consumeBackupQuestion());
    
    // Mark the new question as played to avoid reusing it
    dispatch(markQuestionPlayed(next.id));

    // Navigate to the new question
    router.push(`/game/${gameId}/question/${next.id}`);
  }, [teams, currentTeam, perksLocked, rerollPerkUsed, backupQuestions, playedQuestions, dispatch, currentQuestion?.id, router, gameId]);

  return { reroll, fetchAndSetBackups };
}
