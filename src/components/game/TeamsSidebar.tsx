'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { activateDoublePerk, activateRerollPerk, markQuestionPlayed, consumeRerollBuffer } from '@/store/gameSlice';
import { gamesAPI } from '@/lib/api';
import { Question as QuestionType, Team } from '@/types/game';

interface TeamsSidebarProps {
  teams: Team[];
  currentTeam: number;
  doublePerkActiveTeamId: number | null;
  doublePerkUsed: Record<number, boolean>;
  rerollPerkUsed: Record<number, boolean>;
  choicesPerkUsed?: Record<number, boolean>;
  perksLocked?: boolean;
  rerollBuffer?: Record<number, number | null>;
  gameId: string;
  question: QuestionType | null;
  questions: QuestionType[];
  playedQuestions: number[];
  onShowChoices: () => void;
}

export default function TeamsSidebar({
  teams,
  currentTeam,
  doublePerkActiveTeamId,
  doublePerkUsed,
  rerollPerkUsed,
  choicesPerkUsed,
  perksLocked,
  rerollBuffer,
  gameId,
  question,
  questions,
  playedQuestions,
  onShowChoices,
}: TeamsSidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // prevent unused warnings for optional legacy props
  void questions; void playedQuestions;

  const isPerkDisabled = (teamId: number, extra?: boolean) => {
    const isTeamsTurn = teams.findIndex(t => t.id === teamId) === (currentTeam - 1);
    return !!(perksLocked || !isTeamsTurn || extra);
  };

  const handleReroll = async (teamId: number) => {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    const isTeamsTurn = teamIndex === (currentTeam - 1);
    
    if (!isTeamsTurn || rerollPerkUsed[teamId]) return;
    
    // Mark perk as used in Redux
    dispatch(activateRerollPerk({ teamId }));
    // 1. Try buffered reroll first
    if (rerollBuffer && rerollBuffer[teamId]) {
      const bufferedId = rerollBuffer[teamId];
      if (bufferedId && question) {
        dispatch(markQuestionPlayed(question.id));
        dispatch(consumeRerollBuffer({ teamId }));
        router.push(`/game/${gameId}/question/${bufferedId}`);
        return;
      }
    }

    // 2. Fallback to backend reroll
    try {
      if (!question) return;
      // Mark current as played locally for UI responsiveness
      dispatch(markQuestionPlayed(question.id));
      // Ask backend for a new question and navigate
      const newQ = await gamesAPI.rerollQuestion(Number(gameId), question.id);
      if (newQ && newQ.id) {
        router.push(`/game/${gameId}/question/${newQ.id}`);
      }
    } catch (e) {
      console.warn('Failed to reroll question:', e);
    }
  };

  return (
    <div className="w-full lg:w-80 px-2 flex justify-center">
      <div className="flex lg:flex-col gap-1 lg:gap-1 justify-center items-stretch max-w-2xl lg:max-w-none w-full">
        {teams.slice(0, 4).map((team, index) => {
          const isTeamsTurn = teams.findIndex(t => t.id === team.id) === (currentTeam - 1);
          return (
            <div key={team.id} className="mt-1 lg:max-w-none lg:mb-0">
              <div className="bg-brown-800  border-brown-900 text-white rounded-xl p-2 lg:p-4 flex flex-col lg:flex-row items-center lg:space-x-4 space-y-1 lg:space-y-0">
                {/* Team Avatar */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-17 lg:h-17 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {team.avatar ? (
                    <Image
                      src={`/avatars/${team.avatar}.png`}
                      alt={team.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white text-base sm:text-lg font-bold">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Team Info */}
                <div className="flex-col items-center lg:ml-3 lg:items-start">
                  <div className="font-bold text-base sm:text-lg sm:text-center justify-content-center mb-2">
                    {team.name}
                  </div>

                  {/* Team Actions */}
                  <div className="flex flex-row space-x-1 sm:space-x-2 justify-center lg:justify-start">
                    {/* Double Points Perk */}
                    <button
                      onClick={() => dispatch(activateDoublePerk({ teamId: team.id }))}
                      disabled={
                        !!doublePerkUsed[team.id] ||
                        doublePerkActiveTeamId !== null ||
                        isPerkDisabled(team.id)
                      }
                      title={
                        doublePerkUsed[team.id]
                          ? 'Perk already used'
                          : doublePerkActiveTeamId !== null
                            ? 'Another perk is active'
                            : !isTeamsTurn
                              ? "You can only activate on your team's turn"
                              : 'Use Double Points once'
                      }
                      className={`p-1 sm:p-2 rounded-md transition-colors border text-xs sm:text-base ${
                        doublePerkActiveTeamId === team.id
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-brown-900 hover:bg-white/30 text-white border-white/30'
                      } disabled:opacity-50`}
                    >
                      <Image src="/icons/Untitled design.svg" alt="multiplier icon" width={25} height={25} className="w-5 h-5" />
                    </button>

                    {/* Reroll Question Perk */}
                    <button
                      onClick={() => handleReroll(team.id)}
                      disabled={!!rerollPerkUsed[team.id] || isPerkDisabled(team.id)}
                      title={
                        rerollPerkUsed[team.id]
                          ? 'Reroll already used'
                          : !isTeamsTurn
                            ? "You can only reroll on your team's turn"
                            : 'Change to a random new question'
                      }
                      className={`p-1 sm:p-2 rounded-md transition-colors border text-xs sm:text-base ${
                        rerollPerkUsed[team.id]
                          ? 'bg-gray-400 text-white border-gray-500'
                          : 'bg-brown-900 hover:bg-white/30 text-white border-white/30'
                      } disabled:opacity-50`}
                    >
                      <Image src="/icons/arrow-change.svg" alt="refresh icon" width={25} height={25} className="w-5 h-5" />
                    </button>

                    {/* Show Choices Button */}
                    <button
                      onClick={onShowChoices}
                      disabled={(choicesPerkUsed?.[team.id] ?? false) || isPerkDisabled(team.id)}
                      title={
                        rerollPerkUsed[team.id]
                          ? 'Reroll already used'
                          : !isTeamsTurn
                            ? "You can only use on your team's turn"
                            : 'Show answer choices'
                      }
                      className={`p-1 sm:p-2 rounded-md transition-colors border text-xs sm:text-base ${
                        rerollPerkUsed[team.id]
                          ? 'bg-gray-400 text-white border-gray-500'
                          : 'bg-brown-900 hover:bg-white/30 text-white border-white/30'
                      } disabled:opacity-50`}
                    >
                      <Image src="/icons/clover-48-regular.svg" alt="multiplier icon" width={25} height={25} className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
