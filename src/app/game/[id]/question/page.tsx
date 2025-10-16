'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api';
import { Game, Team, Question } from '@/types/game';
import Image from 'next/image';
import GameHeader from '@/components/GameHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { startGame, switchToNextTeam, endGame, setTeams, awardPoints } from '@/store/gameSlice';

interface GameWithDetails extends Game {
  teams: Team[];
  availableQuestions: Question[];
}

interface QuestionSlot {
  points: number;
  question: Question;
  isSolved: boolean;
  index: number;
}

export default function GameBoardPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const dispatch = useAppDispatch();
  const { currentTeam, isGameActive, gameId: currentGameId, teams: liveTeams } = useAppSelector(state => state.game);
  
  const [game, setGame] = useState<GameWithDetails | null>(null);
  const [error, setError] = useState('');

  // Initialize game in Redux when component mounts and game data is loaded
  useEffect(() => {
    if (game && (!isGameActive || currentGameId !== gameId)) {
      dispatch(startGame({ 
        gameId: gameId, 
        totalTeams: game.teams.length 
      }));
    }
  }, [game, gameId, isGameActive, currentGameId, dispatch]);

  // Handle team turn change
  const handleTeamTurnChange = () => {
    dispatch(switchToNextTeam());
  };

  // Handle back to board (navigate to home or games list)
  const handleBackToBoard = () => {
    router.push('/');
  };

  // Handle ending the game
  const handleEndGame = () => {
    dispatch(endGame());
    router.push(`/game/${gameId}/results`);
  };

  // Local score updates via Redux only
  const updateTeamScore = (teamId: number, increment: number) => {
    dispatch(awardPoints({ teamId, delta: increment }));
  };

  useEffect(() => {
    let mounted = true; // Track if component is still mounted
    let loadingTimer: NodeJS.Timeout;
    
    const loadGame = async () => {
      if (!gameId || gameId === 'undefined') {
        if (mounted) {
          setError('Invalid game ID');
        }
        return;
      }
      
      // Add a small delay to batch multiple rapid calls
      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(async () => {
        if (!mounted) return;
        
        try {
          const numericGameId = parseInt(gameId);
          if (isNaN(numericGameId)) {
            throw new Error('Game ID must be a number');
          }
          
          console.log(`Loading game ${numericGameId}...`);
          
          // Load game details and questions in parallel but only once
          const [gameData, questions] = await Promise.all([
            gameAPI.getGame(numericGameId),
            gameAPI.getAvailableQuestions(numericGameId)
          ]);
          
          if (!mounted) return; // Don't update state if component unmounted
          
          const teams = gameData.teams || [];
          
          setGame({
            ...gameData,
            teams,
            availableQuestions: questions,
          });

          // Sync teams to Redux for live scoring.
          // Preserve existing scores if we already have them in Redux.
          const mergedTeams = teams.map((t: Team) => {
            const existing = liveTeams.find(et => et.id === t.id);
            return { ...t, score: existing?.score ?? t.score ?? 0 };
          });
          if (liveTeams.length === 0) {
            dispatch(setTeams(mergedTeams));
          } else {
            // Only update if the roster changed (e.g., avatar/name updates), keep scores
            const rosterChanged =
              mergedTeams.length !== liveTeams.length ||
              mergedTeams.some((t, i) => t.id !== liveTeams[i]?.id || t.name !== liveTeams[i]?.name || t.avatar !== liveTeams[i]?.avatar);
            if (rosterChanged) {
              dispatch(setTeams(mergedTeams));
            }
          }
          
          console.log('Game loaded successfully:', {
            gameId: numericGameId,
            teamsCount: teams.length,
            questionsCount: questions.length,
            categoriesCount: gameData.categories.length
          });
          
        } catch (error) {
          if (mounted) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Failed to load game: ${errorMessage}`);
          }
        } finally {
          // No loading state to update
        }
      }, 200); // Increased debounce to 200ms for better batching
    };
    
    loadGame();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
      clearTimeout(loadingTimer);
    };
  }, [gameId, dispatch, liveTeams]);

  // Organize questions by category (memoized to prevent recalculation)
  const organizeQuestionsByCategory = React.useMemo(() => {
    if (!game) return {};
    const organized: Record<number, Question[]> = {};
    
    // Initialize categories
    game.categories.forEach(category => {
      organized[category.id] = [];
    });
    
    // Group questions by category
    game.availableQuestions.forEach(question => {
      const questionCategoryId = question.category?.id;
      if (questionCategoryId && organized[questionCategoryId]) {
        organized[questionCategoryId].push(question);
      }
    });
    
    // Sort questions within each category by points
    Object.keys(organized).forEach(categoryId => {
      organized[parseInt(categoryId)].sort((a, b) => a.points - b.points);
    });
    
    console.log('Questions organized by category:', organized);
    return organized;
  }, [game]);

  // Create question grid for a category using only backend-returned questions
  const createQuestionGrid = (categoryId: number): QuestionSlot[] => {
    const categoryQuestions = organizeQuestionsByCategory[categoryId] || [];
    console.log(`Category ${categoryId} questions:`, categoryQuestions);
    console.log(`Category ${categoryId} question count: ${categoryQuestions.length}`);
    
    // Backend should already limit to 6 questions, but add safety check
    if (categoryQuestions.length > 6) {
      console.warn(`Category ${categoryId} has more than 6 questions (${categoryQuestions.length}), this should not happen!`);
    }
    
    // Sort by points descending (harder questions first)
    const sortedQuestions = categoryQuestions.sort((a: Question, b: Question) => b.points - a.points);
    
    console.log(`Category ${categoryId} after sorting:`, sortedQuestions.length, 'questions');
    
    return sortedQuestions.map((question: Question, index: number): QuestionSlot => ({
      points: question.points,
      question: question,
      isSolved: false, // Since these are available questions, they're not solved
      index
    }));
  };

  // Handle question select
  const handleQuestionSelect = (question: Question) => {
    router.push(`/game/${gameId}/question/${question.id}`);
  };

  // Track image load errors to avoid retrying failed images
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (error) {
    return (
      <div className="min-h-screen bg-custom-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <div className="text-gray-600 text-sm mb-4">Game ID: {gameId}</div>
          <div className="space-x-4 space-x-reverse">
            <button
              onClick={() => router.push('/create-game')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded"
            >
              Create New Game
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    // Show empty game board while loading
    return (
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <GameHeader 
          onBackToBoard={handleBackToBoard}
          currentTeamTurn={currentTeam}
          onTeamTurnChange={handleTeamTurnChange}
          onEndGame={handleEndGame}
        />

        {/* Game Board - Shows loading skeleton */}
        <main className="flex-1 p-4 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
          <div className="h-full grid grid-cols-3 md:grid-cols-6 gap-3">
            {/* Show skeleton loaders for categories */}
            {Array.from({length: 6}).map((_, index) => (
              <div key={index} className="h-full flex flex-col">
                {/* Category skeleton */}
                <div className="relative h-24 md:h-32 w-full rounded-xl overflow-hidden border-4 border-white shadow mb-3 flex-shrink-0 bg-gray-200 animate-pulse">
                  <div className="absolute bottom-0 left-0 w-full bg-gray-300 py-1 text-center">
                    <span className="text-gray-500 text-xs md:text-sm font-bold">Loading...</span>
                  </div>
                </div>
                
                {/* Question slots skeleton */}
                <div className="flex-1 flex flex-col gap-1 md:gap-2">
                  {Array.from({length: 6}).map((_, qIndex) => (
                    <div
                      key={qIndex}
                      className="flex-1 bg-gray-200 animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer skeleton */}
        <footer className="bg-gradient-to-r from-amber-400 to-orange-400 py-2 md:py-3 flex items-center justify-center gap-3 md:gap-4 border-t-4 border-amber-500 h-16 md:h-25 flex-shrink-0">
          <div className="text-gray-600 text-sm">Loading teams...</div>
        </footer>
      </div>
    );
  }

  function handleImageError(name: string): void {
    setImageErrors(prev => ({ ...prev, [name]: true }));
  }

  function hasImageError(name: string): boolean {
    return !!imageErrors[name];
  }

return (
  <div className="h-screen flex flex-col bg-white overflow-hidden">
    {/* Header */}
    <GameHeader 
      onBackToBoard={handleBackToBoard}
      currentTeamTurn={currentTeam}
      onTeamTurnChange={handleTeamTurnChange}
      onEndGame={handleEndGame}
    />

    {/* Game Board - Takes remaining height */}
    <main className="flex-1 p-2 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      <div className="h-full grid grid-cols-3 md:grid-cols-6 gap-3">
        {game.categories.map((category) => (
          <div key={category.id} className="h-full flex flex-col">
            
            {/* Category image + name - Fixed height */}
            <div className="relative h-24 md:h-48 w-full rounded-xl overflow-hidden border-4 border-white shadow mb-3 flex-shrink-0">
              {category.image && !hasImageError(category.name) ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(category.name)}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xl md:text-2xl">🎯</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 md:h-10 w-full bg-black/70 py-1 text-center">
                <span className="text-white text-xs md:text-lg font-bold">{category.name}</span>
              </div>
            </div>

            {/* Questions - Takes remaining height */}
            <div className="flex-1 flex flex-col gap-1 md:gap-2">
              {createQuestionGrid(category.id).map((slot: QuestionSlot) => (
                <button
                  key={`${category.id}-${slot.question.id}`}
                  onClick={() => slot.question && handleQuestionSelect(slot.question)}
                  disabled={slot.isSolved || !slot.question}
                  className={`
                    flex-1 font-bold text-sm md:text-lg rounded-lg shadow transition flex items-center justify-center
                    ${slot.isSolved || !slot.question 
                      ? 'bg-[#8a95ab] text-[#5a6578] opacity-60 cursor-not-allowed' 
                      : 'bg-[#bcc2d3] text-[#34446b] hover:bg-[#cfd6e1] cursor-pointer'
                    }
                  `}
                >
                  {slot.points}
                </button>
              ))}
              {/* Add empty slots if less than 6 questions to maintain consistent height */}
              {Array.from({length: Math.max(0, 6 - createQuestionGrid(category.id).length)}).map((_, index) => (
                <div
                  key={`empty-${category.id}-${index}`}
                  className="flex-1 bg-[#8a95ab] opacity-30 rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>

    {/* Footer / Scoreboard - Fixed height (uses Redux liveTeams) */}
    <footer className="bg-gradient-to-r from-amber-400 to-orange-400 py-2 md:py-3 flex items-center justify-center gap-3 md:gap-4 border-t-4 border-amber-500 h-16 md:h-20 flex-shrink-0">
      {liveTeams && liveTeams.length > 0 ? (
        liveTeams.map((team) => (
          <div key={team.id} className="flex items-center bg-orange-200/95 rounded-2xl px-3 md:px-4 py-1.5 md:py-1 shadow-md border border-orange-300" dir="ltr">
            {/* Team Avatar */}
            <div className="w-8 h-8 md:w-15 md:h-15 rounded-full bg-white flex items-center justify-center overflow-hidden mr-2 md:mr-3 border-2 border-orange-300">
              <Image 
                src={`/avatars/${team.avatar}.jpeg`} 
                alt={team.name} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
                unoptimized
              />
            </div>
            
            {/* Team Name */}
            <span className="text-orange-900 font-bold text-xs md:text-sm mr-2 md:mr-3 min-w-[50px] md:min-w-[60px]">
              {team.name}
            </span>
            
            {/* Score Controls Row */}
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => updateTeamScore(team.id, -100)}
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-md w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-200 shadow-sm"
              >
                -
              </button>
              <span className="text-orange-900 font-extrabold text-base md:text-xl min-w-[35px] md:min-w-[50px] text-center">
                {team.score ?? 0}
              </span>
              <button 
                onClick={() => updateTeamScore(team.id, 100)}
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-md w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-200 shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-white text-sm bg-red-500/20 border border-red-400 rounded-xl p-4">
          <p className="text-red-600">No teams added to this game</p>
        </div>
      )}
    </footer>
  </div>
);  
}
