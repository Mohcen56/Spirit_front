'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api';
import { Team, Question as QuestionType } from '@/types/game';
import Image from 'next/image';
import AnswerDisplay from '@/components/AnswerDisplay';
import TeamSelector from '@/components/TeamSelector';
import GameCard from '@/components/GameCard';
import GameHeader from '@/components/GameHeader';
import ChoicesDialog from '@/components/ChoicesDialog';
import { getFullImageUrl } from '@/lib/imageUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { switchToNextTeam, endGame, awardPoints, activateDoublePerk, clearActivePerk, activateRerollPerk } from '@/store/gameSlice';
import { Loader } from 'lucide-react';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const questionId = parseInt(params.questionId as string);
  
  const dispatch = useAppDispatch();
  const { currentTeam } = useAppSelector(state => state.game);
  const { doublePerkActiveTeamId, doublePerkUsed } = useAppSelector(state => state.game);
  const { rerollPerkUsed } = useAppSelector(state => state.game);
  
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [awardError, setAwardError] = useState('');
  const [awardSuccess, setAwardSuccess] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0); // Chronometer instead of countdown
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<'question' | 'answer' | 'teamSelector'>('question');
  const [isChronoRunning, setIsChronoRunning] = useState(false);
  
  // Choices dialog state
  const [isChoicesDialogOpen, setIsChoicesDialogOpen] = useState(false);
  const [selectedQuestionForChoices, setSelectedQuestionForChoices] = useState<QuestionType | null>(null);
  
  // Enhanced turn tracking - save turn history and team turn data during game
  const [turnHistory, setTurnHistory] = useState<Array<{
    teamId: number;
    teamName: string;
    questionId: number;
    timestamp: number;
    duration?: number;
  }>>([]);
  const [teamTurnData, setTeamTurnData] = useState<Record<number, {
    totalTurns: number;
    totalTime: number;
    averageTime: number;
    lastTurnTimestamp: number;
  }>>({});

  // Load turn history and team turn data from localStorage when component mounts
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(`game-${gameId}-turn-history`);
      if (savedHistory) {
        setTurnHistory(JSON.parse(savedHistory));
      }
      
      const savedTeamData = localStorage.getItem(`game-${gameId}-team-turn-data`);
      if (savedTeamData) {
        setTeamTurnData(JSON.parse(savedTeamData));
      }
    } catch (e) {
      console.warn('Failed to load turn data from localStorage:', e);
    }
  }, [gameId]);
  
  // Save turn history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`game-${gameId}-turn-history`, JSON.stringify(turnHistory));
    } catch (e) {
      console.warn('Failed to save turn history to localStorage:', e);
    }
  }, [turnHistory, gameId]);
  
  // Save team turn data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`game-${gameId}-team-turn-data`, JSON.stringify(teamTurnData));
    } catch (e) {
      console.warn('Failed to save team turn data to localStorage:', e);
    }
  }, [teamTurnData, gameId]);

  // Chronometer effect - starts when question loads
  useEffect(() => {
    if (!isLoading && question && currentView === 'question' && isChronoRunning) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, question, currentView, isChronoRunning]);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        if (!questionId || isNaN(questionId)) {
          throw new Error('Invalid question ID');
        }

        // Get questions from the game to find this specific question
        const numericGameId = parseInt(gameId);
        const questions = await gameAPI.getAvailableQuestions(numericGameId);
        console.log('Available questions:', questions);
        console.log('Looking for question ID:', questionId);
        console.log('Available question IDs:', questions.map(q => q.id));
        
        let selectedQuestion = questions.find(q => q.id === questionId);
        
        if (!selectedQuestion) {
          console.warn('Question not found in available questions, trying direct fetch...');
          console.warn('Requested question ID:', questionId, 'Type:', typeof questionId);
          console.warn('Available question IDs:', questions.map(q => `${q.id} (${typeof q.id})`));
          
          try {
            // Fallback: try to fetch the question directly
            selectedQuestion = await gameAPI.selectQuestion(questionId);
            console.log('Successfully fetched question directly:', selectedQuestion);
            
            // Check if this question was already played in this game
            const gameDetails = await gameAPI.getGame(numericGameId);
            const isAlreadyPlayed = gameDetails.played_questions?.some(
              (pq) => pq.question.id === questionId
            );
            
            if (isAlreadyPlayed) {
              throw new Error('This question has already been answered in this game');
            }
          } catch (directFetchError) {
            console.error('Failed to fetch question directly:', directFetchError);
            const errorMessage = directFetchError instanceof Error ? 
              directFetchError.message : 
              'Question not found or already answered';
            throw new Error(errorMessage);
          }
        }

        setQuestion(selectedQuestion);
        // Fetch teams for this game
        const gameDetails = await gameAPI.getGame(numericGameId);
        console.log('Game details loaded:', gameDetails);
        console.log('Teams from game details:', gameDetails.teams);
        setTeams(gameDetails.teams || []);
        
        // Start chronometer when question is loaded
        setIsChronoRunning(true);
      } catch (error) {
        console.error('Error loading question:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error loading question';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (questionId) {
      loadQuestion();
    }
  }, [questionId, gameId]);

  const handleShowAnswer = () => {
    setCurrentView('answer');
    setIsChronoRunning(false); // Stop chronometer when showing answer
  };

  const handleShowQuestion = () => {
    setCurrentView('question');
    // Optionally restart chronometer when going back to question
  };

  const handleShowTeamSelector = () => {
    console.log('handleShowTeamSelector called');
    console.log('Before - currentView:', currentView);
    setCurrentView('teamSelector');
    console.log('After - Setting currentView to teamSelector');
  };

  const handleBackToAnswer = () => {
    console.log('handleBackToAnswer called');
    setCurrentView('answer');
  };

  const toggleChronometer = () => {
    setIsChronoRunning(!isChronoRunning);
  };

  const handleTeamTurnChange = () => {
    // Change to next team (manual change - no turn tracking needed)
    dispatch(switchToNextTeam());
    // Clear any lingering active perk so next team can use theirs
    dispatch(clearActivePerk());
    // Reset timer for new team's turn
    setElapsedTime(0);
  };

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  // Award points to a team (or none) - ULTRA FAST
  const handleAwardPoints = async (teamId: number | null) => {
    setAwardError('');
    setAwardSuccess('');
    
    try {
      const numericGameId = parseInt(gameId);
      
      // Start API call in background while showing immediate success
      const apiPromise = gameAPI.awardQuestion(numericGameId, questionId, teamId);
      
      // Show success immediately for better UX
      setAwardSuccess('Points awarded!');

      // Update local Redux score immediately when a team is selected
      if (teamId && question) {
        // Check if double points perk is active for this team
        const isDouble = doublePerkActiveTeamId === teamId;
        const delta = isDouble ? question.points * 2 : question.points;
        dispatch(awardPoints({ teamId, delta }));
        // Clear active perk after it has been applied
        if (isDouble) {
          dispatch(clearActivePerk());
        }
      }
      
      // Record the current turn in history before changing teams
      const currentTeamData = teams.find(t => t.id === currentTeam) || teams[currentTeam - 1];
      const timestamp = Date.now();
      
      if (currentTeamData && question) {
        const turnDuration = elapsedTime; // Use elapsed time as turn duration
        
        setTurnHistory(prev => [...prev, {
          teamId: currentTeamData.id,
          teamName: currentTeamData.name,
          questionId: question.id,
          timestamp,
          duration: turnDuration
        }]);
        
        // Update team turn statistics
        setTeamTurnData(prev => {
          const currentData = prev[currentTeamData.id] || {
            totalTurns: 0,
            totalTime: 0,
            averageTime: 0,
            lastTurnTimestamp: 0
          };
          
          const newTotalTurns = currentData.totalTurns + 1;
          const newTotalTime = currentData.totalTime + turnDuration;
          const newAverageTime = newTotalTime / newTotalTurns;
          
          return {
            ...prev,
            [currentTeamData.id]: {
              totalTurns: newTotalTurns,
              totalTime: newTotalTime,
              averageTime: newAverageTime,
              lastTurnTimestamp: timestamp
            }
          };
        });
      }
      
  // Advance to next team's turn and reset timer
    // Always clear any active perk at the end of a question
    dispatch(clearActivePerk());
    dispatch(switchToNextTeam());
      setElapsedTime(0);
      
      // Navigate immediately without waiting
      router.push(`/game/${gameId}/question`);
      
      // Let API call complete in background
      await apiPromise;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while awarding points';
      console.error('Award error:', errorMessage);
      setAwardError(errorMessage);
      // Don't navigate if there's an error
    }
  };

  const handleBackToBoard = () => {
    router.push(`/game/${gameId}/question`);
  };

  const handleEndGame = () => {
    dispatch(endGame());
    router.push(`/game/${gameId}/results`);
  };

  const handleShowChoices = () => {
    // Show choices for the current question
    if (question) {
      setSelectedQuestionForChoices(question);
      setIsChoicesDialogOpen(true);
    }
  };

  const handleCloseChoicesDialog = () => {
    setIsChoicesDialogOpen(false);
    setSelectedQuestionForChoices(null);
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={handleBackToBoard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Back to Game Board
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <GameHeader 
        onBackToBoard={handleBackToBoard}
        currentTeamTurn={currentTeam}
        onTeamTurnChange={handleTeamTurnChange}
        onEndGame={handleEndGame}
      />

      {/* Main Game Layout */}
      <main className="container max-w-screen mt-2 mx-auto px-2 flex-1 flex items-center">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-2 max-w-screen mx-auto w-full ">
          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {currentView === 'question' ? (
              <div className="relative">
                <GameCard question={question}>
                  {/* Center - Timer */}
                  <div className="absolute -top-6 left-1/2  transform -translate-x-1/2 
                                  bg-slate-800 text-white px-6 py-2 lg:px-8 rounded-full flex items-center space-x-3">
                    <button 
                      onClick={toggleChronometer}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <span className="text-lg">{isChronoRunning ? '⏸️' : '▶️'}</span>
                    </button>
                    <span className="text-xl font-mono font-bold">{formatTime(elapsedTime)}</span>
                    <button 
                      onClick={() => {setElapsedTime(0); setIsChronoRunning(false);}}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <span className="text-lg">↻</span>
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="text-center mb-8 mt-6">
                    <h1 className="text-gray-800 text-2xl md:text-3xl font-bold leading-relaxed" dir="ltr">
                      {question.text}
                    </h1>
                  </div>

                  {/* Question Image */}
                  {question.image && (
                    <div className="mb-8">
                      <div className="relative max-w-2xl mx-auto rounded-xl overflow-hidden">
                        <Image
                          src={getFullImageUrl(question.image) || ''}
                          alt="Question image"
                          width={800}
                          height={400}
                          className="w-full h-59 object-contain mx-auto"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  {/* Answer Button */}
                   <div className="absolute -bottom-6 left-26 transform -translate-x-1/2">
                    <button
                      onClick={handleShowAnswer}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl  shadow-lg transition-all duration-200 text-lg"
                    >
                      Answer
                    </button>
                  </div>
                </GameCard>
              </div>
            ) : currentView === 'teamSelector' ? (
              /* Team Selection Component */
              <TeamSelector
                question={question}
                teams={teams}
                onAwardPoints={handleAwardPoints}
                onBackToAnswer={handleBackToAnswer}
                awardError={awardError}
                awardSuccess={awardSuccess}
              />
            ) : currentView === 'answer' ? (
              /* Answer Display Component */
              <AnswerDisplay 
                question={question} 
                onShowQuestion={handleShowQuestion}
                onShowTeamSelector={handleShowTeamSelector}
              />
            ) : null}
          </div>

          {/* Teams - Bottom on mobile, Right sidebar on desktop */}
          <div className="w-full lg:w-80 px-2 flex justify-center ">
            <div className="flex  lg:flex-col gap-1 lg:gap-1 justify-center items-stretch max-w-2xl lg:max-w-none w-full">
              {teams.slice(0, 4).map((team, index) => (
                <div key={team.id} className=" mt-1 lg:max-w-none lg:mb-0">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-2 lg:p-4 flex flex-col lg:flex-row items-center lg:space-x-4 space-y-1 lg:space-y-0">
                    {/* Team Avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-17 lg:h-17 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {team.avatar ? (
                        <Image
                          src={`/avatars/${team.avatar}.jpeg`}
                          alt={team.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-white text-base sm:text-lg font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Team Info */}
                    <div className=" flex-col items-center lg:ml-3 lg:items-start">
                      <div className="font-bold text-base sm:text-lg sm:text-center justify-content-center mb-1">Team {index + 1}</div>
                    

                    {/* Team Actions */}
                     <div className="flex flex-row space-x-1 sm:space-x-2 justify-center lg:justify-start">
                      {/* Double Points Perk */}
                      <button
                        onClick={() => dispatch(activateDoublePerk({ teamId: team.id }))}
                        disabled={!!doublePerkUsed[team.id] || doublePerkActiveTeamId !== null || (teams.findIndex(t => t.id === team.id) !== (currentTeam - 1))}
                        title={
                          doublePerkUsed[team.id]
                            ? 'Perk already used'
                            : doublePerkActiveTeamId !== null
                              ? 'Another perk is active'
                              : (teams.findIndex(t => t.id === team.id) !== (currentTeam - 1))
                                ? "You can only activate on your team's turn"
                                : 'Use Double Points once'
                        }
                        className={`p-1 sm:p-2 rounded transition-colors border text-xs sm:text-base ${doublePerkActiveTeamId === team.id ? 'bg-green-500 text-white border-green-600' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'} disabled:opacity-50`}
                      >
                        <span>📞</span>
                      </button>
                      {/* Reroll Question Perk */}
                      <button
                        onClick={async () => {
                          const teamIndex = teams.findIndex(t => t.id === team.id);
                          const isTeamsTurn = teamIndex === (currentTeam - 1);
                          if (!isTeamsTurn || rerollPerkUsed[team.id]) return;
                          // Mark perk as used in Redux
                          dispatch(activateRerollPerk({ teamId: team.id }));
                          try {
                            // Fetch a random question regardless of category
                            const numericGameId = parseInt(gameId);
                            const available = await gameAPI.getAvailableQuestions(numericGameId);
                            const pool = available.filter(q => q.id !== question?.id);
                            if (pool.length === 0) return;
                            const random = pool[Math.floor(Math.random() * pool.length)];
                            router.push(`/game/${gameId}/question/${random.id}`);
                          } catch (e) {
                            console.warn('Failed to reroll question:', e);
                          }
                        }}
                        disabled={!!rerollPerkUsed[team.id] || (teams.findIndex(t => t.id === team.id) !== (currentTeam - 1))}
                        title={
                          rerollPerkUsed[team.id]
                            ? 'Reroll already used'
                            : (teams.findIndex(t => t.id === team.id) !== (currentTeam - 1))
                              ? "You can only reroll on your team's turn"
                              : 'Change to a random new question'
                        }
                        className={`p-1 sm:p-2 rounded transition-colors border text-xs sm:text-base ${rerollPerkUsed[team.id] ? 'bg-gray-400 text-white border-gray-500' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'} disabled:opacity-50`}
                      >
                        <span>📞</span>
                      </button>
                      <button
                        onClick={handleShowChoices}
                        disabled={!!rerollPerkUsed[team.id] || (teams.findIndex(t => t.id === team.id) !== (currentTeam - 1))}
                        title={
                          rerollPerkUsed[team.id]
                            ? 'Reroll already used'
                            : (teams.findIndex(t => t.id === team.id) !== (currentTeam - 1))
                              ? "You can only reroll on your team's turn"
                              : 'Change to a random new question'
                        }
                        className={`p-1 sm:p-2 rounded transition-colors border text-xs sm:text-base ${rerollPerkUsed[team.id] ? 'bg-gray-400 text-white border-gray-500' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'} disabled:opacity-50`}
                      >
                        <span>📞</span>
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Choices Dialog */}
      {selectedQuestionForChoices && (
        <ChoicesDialog
          open={isChoicesDialogOpen}
          onClose={handleCloseChoicesDialog}
         
          choices={[
            selectedQuestionForChoices.answer,
            selectedQuestionForChoices.choice_2 || '',
            selectedQuestionForChoices.choice_3 || '',
            selectedQuestionForChoices.choice_4 || ''
          ]}
        />
      )}
    </div>
  );
}