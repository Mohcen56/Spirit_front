'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { logger } from '@/lib/utils/logger';
import { useParams, useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api';
import {  Question as QuestionType } from '@/types/game';
import Image from 'next/image';
import AnswerDisplay from '@/components/game/AnswerDisplay';
import TeamSelector from '@/components/game/TeamSelector';
import GameCard from '@/components/game/GameCard';
import GameHeader from '@/components/game/GameHeader';
import ChoicesDialog from '@/components/game/ChoicesDialog';
import TeamsSidebar from '@/components/game/TeamsSidebar';
import { getFullImageUrl } from '@/lib/utils/imageUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { switchToNextTeam, awardPoints, clearActivePerk, setGameQuestions, setBackupQuestions, markQuestionPlayed, endGame, activateChoicesPerk, lockPerks, unlockPerks, setRerollBuffer } from '@/store/gameSlice';
import { Loader, Play, Pause, RotateCcw } from 'lucide-react';
import { useGameData } from '@/hooks/useGameData';
import { useSyncTeams } from '@/hooks/useSyncTeams';
import { consumeBackupQuestion } from '@/store/gameSlice';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const questionId = parseInt(params.questionId as string);
  
  const dispatch = useAppDispatch();
  const {
    currentTeam,
    doublePerkActiveTeamId,
    doublePerkUsed,
  rerollPerkUsed,
  choicesPerkUsed,
  perksLocked,
  rerollBuffer,
    questions,
    playedQuestions,
    teams: liveTeams,
  } = useAppSelector((state) => state.game);
  const [awardError, setAwardError] = useState('');
  const [awardSuccess, setAwardSuccess] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0); // Chronometer instead of countdown
  const [currentView, setCurrentView] = useState<'question' | 'answer' | 'teamSelector'>('question');
  const [isChronoRunning, setIsChronoRunning] = useState(true); // Start automatically
  // Choices dialog state
  const [isChoicesDialogOpen, setIsChoicesDialogOpen] = useState(false);
  const [selectedQuestionForChoices, setSelectedQuestionForChoices] = useState<QuestionType | null>(null);
  const [questionImageStatus, setQuestionImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
   // 🎯 Fetch game + available questions
  const { game, isLoading, error } = useGameData(gameId);

  // 🔁 Sync teams with Redux (live scoring)
  useSyncTeams(game?.teams, liveTeams);
  useEffect(() => {
    if (questions.length > 0) return;

    const numericGameId = Number(gameId);
    if (!Number.isFinite(numericGameId)) return;

    let cancelled = false;

    const loadQuestions = async () => {
      try {
        const data = await gameAPI.getAvailableQuestions(numericGameId);
        if (!cancelled) {
          dispatch(setGameQuestions(data));
          // Prefetch extra outside-board questions for fast reroll
          const extras = await gameAPI.prefetchOutsideBoard(numericGameId, 4);
          if (Array.isArray(extras) && extras.length) {
            const existingIds = new Set(data.map((q: any) => q.id));
            const filtered = extras.filter((q: any) => 
              q && 
              typeof q.id === 'number' && 
              !existingIds.has(q.id) &&
              !playedQuestions.includes(q.id)
            );
            dispatch(setBackupQuestions(filtered));
          }
        }
      } catch (err) {
        logger.exception(err, { where: 'game.[id].question.[questionId].loadAvailable' });
      }
    };

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [dispatch, gameId, questions.length, playedQuestions]);



  // 🧩 Get the selected question
  // Allow resolving rerolled (backup) questions not on board
  const backupQuestions = useAppSelector(s => s.game.backupQuestions);
  const question = questions.find((q) => q.id === questionId) || backupQuestions.find(q => q.id === questionId);

  useEffect(() => {
    if (question?.image) {
      setQuestionImageStatus('loading');
    } else {
      setQuestionImageStatus('idle');
    }
  }, [question?.id, question?.image]);

  const teams = useMemo(() => (liveTeams.length > 0 ? liveTeams : (game?.teams || [])), [liveTeams, game?.teams]);


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
      logger.warn('Failed to load turn data from localStorage:', e);
    }
  }, [gameId]);
  
  // Save turn history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`game-${gameId}-turn-history`, JSON.stringify(turnHistory));
    } catch (e) {
      logger.warn('Failed to save turn history to localStorage:', e);
    }
  }, [turnHistory, gameId]);
  
  // Save team turn data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`game-${gameId}-team-turn-data`, JSON.stringify(teamTurnData));
    } catch (e) {
      logger.warn('Failed to save team turn data to localStorage:', e);
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



  const handleShowAnswer = () => {
    setCurrentView('answer');
    setIsChronoRunning(false); // Stop chronometer when showing answer
  };

  const handleShowQuestion = () => {
    setCurrentView('question');
    // Optionally restart chronometer when going back to question
  };

  const handleShowTeamSelector = () => {
    setCurrentView('teamSelector');
  };

  const handleBackToAnswer = () => {
    logger.log('handleBackToAnswer called');
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
      if (!question) {
        throw new Error('Question not found');
      }

      setAwardSuccess('Points awarded!');

      if (teamId && question) {
        const isDouble = doublePerkActiveTeamId === teamId;
        const delta = isDouble ? question.points * 2 : question.points;
        dispatch(awardPoints({ teamId, delta }));
        if (isDouble) {
          dispatch(clearActivePerk());
        }
      }

      if (!playedQuestions.includes(question.id)) {
        dispatch(markQuestionPlayed(question.id));
      }
      // If this was a backup (outside-board) question sitting at front, consume it now
      const backupHead = backupQuestions[0];
      if (backupHead && backupHead.id === question.id) {
        dispatch(consumeBackupQuestion());
      }
      
      const currentTeamData = teams.find(t => t.id === currentTeam) || teams[currentTeam - 1];
      const timestamp = Date.now();
      
      if (currentTeamData) {
        const turnDuration = elapsedTime;
        
        setTurnHistory(prev => [...prev, {
          teamId: currentTeamData.id,
          teamName: currentTeamData.name,
          questionId: question.id,
          timestamp,
          duration: turnDuration
        }]);
        
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
      
      dispatch(clearActivePerk());
      dispatch(switchToNextTeam());
      setElapsedTime(0);
      
      router.push(`/game/${gameId}/question`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while awarding points';
      logger.exception(errorMessage, { where: 'game.[id].question.[questionId].award' });
      setAwardError(errorMessage);
    }
  };

  const handleBackToBoard = () => {
    router.push(`/game/${gameId}/question`);
  };

  const handleEndGame = async () => {
    try {
      const numericGameId = Number(gameId);
      if (Number.isFinite(numericGameId)) {
        await gameAPI.finishRound(numericGameId, playedQuestions);
      }
    } catch (error) {
      logger.exception(error, { where: 'game.[id].question.[questionId].finishRound' });
      setAwardError('Failed to sync played questions, please try again.');
      return;
    }

    dispatch(endGame());
    router.push(`/game/${gameId}/results`);
  };

  const handleShowChoices = () => {
    // Show choices for the current question
    if (question) {
      setSelectedQuestionForChoices(question);
      setIsChoicesDialogOpen(true);
      // Mark choices perk as used for current team (single-use)
      const teamObj = teams[currentTeam - 1];
      if (teamObj) {
        dispatch(activateChoicesPerk({ teamId: teamObj.id }));
      }
    }
  };

  // Randomize choices so correct answer isn't always first
  const shuffledChoices = React.useMemo(() => {
    if (!selectedQuestionForChoices) return [];
    const choices = [
      selectedQuestionForChoices.answer,
      selectedQuestionForChoices.choice_2 || '',
      selectedQuestionForChoices.choice_3 || '',
      selectedQuestionForChoices.choice_4 || ''
    ].filter(c => c.trim());
    // Fisher-Yates shuffle
    const shuffled = [...choices];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [selectedQuestionForChoices]);

  const handleCloseChoicesDialog = () => {
    setIsChoicesDialogOpen(false);
    setSelectedQuestionForChoices(null);
  };

  // Lock / unlock perks when view changes (perks disabled on answer & teamSelector)
  useEffect(() => {
    if (currentView === 'question') {
      if (perksLocked) dispatch(unlockPerks());
    } else {
      if (!perksLocked) dispatch(lockPerks());
    }
  }, [currentView, dispatch, perksLocked]);

  // Populate reroll buffer (one queued question per team) after questions load
  useEffect(() => {
    if (!questions.length || !teams.length) return;
    const entries: Array<{ teamId: number; questionId: number | null }> = [];
    const playableIds = questions
      .filter(q => !playedQuestions.includes(q.id) && q.id !== questionId)
      .map(q => q.id);
    if (!playableIds.length) return;
    for (const t of teams) {
      if (rerollBuffer[t.id] == null) {
        // pick a random question id from remaining pool
        const remaining = playableIds.filter(id => id !== rerollBuffer[t.id]);
        if (remaining.length) {
          const picked = remaining[Math.floor(Math.random() * remaining.length)];
          entries.push({ teamId: t.id, questionId: picked });
        }
      }
    }
    if (entries.length) {
      dispatch(setRerollBuffer({ entries }));
    }
  }, [questions, teams, playedQuestions, rerollBuffer, questionId, dispatch]);

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

  const shouldCenterQuestionText = questionImageStatus !== 'loaded';
  const showQuestionImage = Boolean(question.image) && questionImageStatus !== 'error';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <GameHeader 
        onBackToBoard={handleBackToBoard}
        currentTeamTurn={currentTeam}
        onTeamTurnChange={handleTeamTurnChange}
        onEndGame={handleEndGame}
        teams={liveTeams}
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
                      aria-label={isChronoRunning ? "Pause timer" : "Start timer"}
                    >
                      {isChronoRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <span className="text-xl font-mono font-bold">{formatTime(elapsedTime)}</span>
                    <button 
                      onClick={() => {setElapsedTime(0); setIsChronoRunning(false);}}
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="Reset timer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <div
                    className={`text-center mb-8 mt-6 ${shouldCenterQuestionText ? 'flex min-h-[18rem] items-center justify-center' : ''}`}
                  >
                    <h1 className="select-none text-gray-800 text-2xl md:text-3xl font-bold leading-relaxed" dir="ltr">
                      {question.text}
                    </h1>
                  </div>

                  {/* Question Image */}
                  {showQuestionImage && (
                    <div className="">
                      <div className=" items-center justify-center relative max-w-2xl mx-auto rounded-xl overflow-hidden">
                        <Image
                          src={getFullImageUrl(question.image) || ''}
                          alt="Question image"
                          width={800}
                          height={400}
                          className="w-full max-h-40 md:max-h-75 object-contain mx-auto"
                          unoptimized
                          onLoadingComplete={() => setQuestionImageStatus('loaded')}
                          onError={() => setQuestionImageStatus('error')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Answer Button */}
                   <div className="absolute -bottom-6 left-26 transform -translate-x-1/2">
                    <button
                      onClick={handleShowAnswer}
                      className="bg-brown-800 hover:bg-brown-700 text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-xl  shadow-lg transition-all duration-200 text-md"
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

          {/* Teams Sidebar */}
          <TeamsSidebar
            teams={teams}
            currentTeam={currentTeam}
            doublePerkActiveTeamId={doublePerkActiveTeamId}
            doublePerkUsed={doublePerkUsed}
            rerollPerkUsed={rerollPerkUsed}
            choicesPerkUsed={choicesPerkUsed}
            perksLocked={perksLocked}
            rerollBuffer={rerollBuffer}
            gameId={gameId}
            question={question}
            questions={questions}
            playedQuestions={playedQuestions}
            onShowChoices={handleShowChoices}
          />
        </div>
      </main>

      {/* Choices Dialog */}
      {selectedQuestionForChoices && (
        <ChoicesDialog
          open={isChoicesDialogOpen}
          onClose={handleCloseChoicesDialog}
          choices={shuffledChoices}
        />
      )}
    </div>
  );
}
