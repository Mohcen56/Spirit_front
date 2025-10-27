'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api/index';
import { Game, Category, Team } from '@/types/game';
import Header from '@/components/Header';

export default function GamePage() {
  const { id } = useParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGame = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        console.log('Loading game with ID:', id);
        
        const gameData = await gameAPI.getGame(Number(id));
        console.log('Game loaded:', gameData);
        setGame(gameData);
      } catch (error) {
        console.error('Error loading game:', error);
        setError('Failed to load game');
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [id]);

  const handleStartGame = () => {
    if (game) {
      router.push(`/game/${game.id}/question`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eastern-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-800 text-xl">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-eastern-blue-50 flex items-center justify-center">
        <div className="text-center bg-eastern-blue-100 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-primary-200">
          <h1 className="text-2xl font-bold text-primary-800 mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/categories')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-eastern-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800 mb-4">Game not found</h1>
          <button
            onClick={() => router.push('/categories')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eastern-blue-50">
     {/* Header */}
          <Header
           title="Starting the Game"
           backHref="/categories"
           
         />

      <div className="container mx-auto px-4 py-8">
        {/* Game ID */}
        <div className="text-center mb-8">
          <p className="text-primary-600">Game #{game.id}</p>
        </div>

        {/* Game Info */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-eastern-blue-100 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-primary-200 mb-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-6 text-center">Game Information</h2>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Categories:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {game.categories.map((category: Category) => (
                  <div
                    key={category.id}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-primary-200 shadow-md"
                  >
                    <span className="text-primary-800 font-medium">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams */}
            {game.teams && game.teams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary-800 mb-3">Teams:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {game.teams.map((team: Team) => (
                    <div
                      key={team.id}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center border border-primary-200 shadow-md"
                    >
                      <span className="text-primary-800 font-medium">{team.name}</span>
                      <span className="text-amber-600 font-bold">{team.score || 0} points</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game Mode */}
            <div className="text-center mb-6">
              <p className="text-primary-600">
                Game Mode: <span className="text-amber-600 font-semibold">{game.mode}</span>
              </p>
            </div>

            {/* Start Game Button */}
            <div className="text-center">
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-green-500 to-primary-600 hover:from-green-600 hover:to-primary-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🎮 Start Game
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <button
              onClick={() => router.push('/categories')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
            >
              Create New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}