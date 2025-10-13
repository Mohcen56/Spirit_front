'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api';
import { Game, Team } from '@/types/game';
import Image from 'next/image';
import { Trophy, Medal, Award, Home, RotateCcw } from 'lucide-react';

export default function GameResultsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGameResults = async () => {
      if (!gameId) return;
      
      try {
        setIsLoading(true);
        console.log('Loading game results for ID:', gameId);
        
        const gameData = await gameAPI.getGame(Number(gameId));
        console.log('Game results loaded:', gameData);
        
        setGame(gameData);
        
        // Sort teams by score in descending order
        const sortedTeams = [...(gameData.teams || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
        setTeams(sortedTeams);
        
      } catch (error) {
        console.error('Error loading game results:', error);
        setError('Failed to load game results');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameResults();
  }, [gameId]);

  const handlePlayAgain = () => {
    router.push('/');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{position}</span>;
    }
  };

  const getRankText = (position: number) => {
    switch (position) {
      case 1:
        return "1st Place";
      case 2:
        return "2nd Place";
      case 3:
        return "3rd Place";
      default:
        return `${position}th Place`;
    }
  };

  const getTeamCardColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-500";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-br from-amber-400 to-amber-500";
      default:
        return "bg-gradient-to-br from-blue-400 to-blue-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-800 text-xl">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={handleBackHome}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Scattered geometric shapes */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-pink-400 rounded-full opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-cyan-400 transform rotate-45 opacity-60"></div>
        <div className="absolute bottom-32 left-20 w-8 h-4 bg-green-400 opacity-60"></div>
        <div className="absolute top-60 left-1/4 w-3 h-3 bg-purple-400 transform rotate-45 opacity-60"></div>
        <div className="absolute bottom-40 right-1/4 w-5 h-5 bg-blue-400 rounded-full opacity-60"></div>
        <div className="absolute top-32 right-1/3 w-4 h-8 bg-yellow-400 opacity-60"></div>
        <div className="absolute bottom-60 left-1/3 w-6 h-3 bg-red-400 transform rotate-12 opacity-60"></div>
        <div className="absolute top-80 right-10 w-3 h-6 bg-indigo-400 opacity-60"></div>
        
        {/* More scattered shapes */}
        <div className="absolute top-16 left-1/2 w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-20 left-10 w-4 h-4 bg-teal-400 transform rotate-45 opacity-60"></div>
        <div className="absolute top-96 right-1/2 w-3 h-3 bg-lime-400 opacity-60"></div>
        <div className="absolute bottom-80 right-16 w-5 h-2 bg-rose-400 opacity-60"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            🎉 Game Over! 🎉
          </h1>
          <p className="text-xl text-gray-600">Final Scores</p>
        </div>

        {/* Results Grid */}
        <div className="max-w-4xl mx-auto">
          {/* Winner Spotlight - First Place */}
          {teams.length > 0 && (
            <div className="mb-8">
              <div className={`${getTeamCardColor(1)} rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white`}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <Trophy className="h-16 w-16 text-yellow-600" />
                  </div>
                  
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                      {teams[0].avatar ? (
                        <Image
                          src={`/avatars/${teams[0].avatar}.jpeg`}
                          alt={`${teams[0].name} avatar`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-2xl text-gray-600">👥</span>
                        </div>
                      )}
                    </div>
                    {/* Winner ribbon */}
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      🏆
                    </div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {teams[0].name}
                  </h2>
                  <p className="text-white text-lg mb-2">{getRankText(1)}</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    {teams[0].score || 0} points
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Other Teams */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.slice(1).map((team, index) => {
              const position = index + 2; // +2 because we start from 2nd place
              return (
                <div
                  key={team.id}
                  className={`${getTeamCardColor(position)} rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300 border-4 border-white`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">
                      {getRankIcon(position)}
                    </div>
                    
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                        {team.avatar ? (
                          <Image
                            src={`/avatars/${team.avatar}.jpeg`}
                            alt={`${team.name} avatar`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-lg text-gray-600">👥</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">
                      {team.name}
                    </h3>
                    <p className="text-white text-sm mb-2">{getRankText(position)}</p>
                    <p className="text-2xl font-bold text-white">
                      {team.score || 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button
            onClick={handlePlayAgain}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Play Again
          </button>
          <button
            onClick={handleBackHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
        </div>

        {/* Game Info */}
        {game && (
          <div className="text-center mt-8 text-gray-600">
            <p className="text-sm">
              Game played on {new Date(game.date_played).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}