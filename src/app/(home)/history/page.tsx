'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gamesAPI } from '@/lib/api';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useHeader } from '@/contexts/HeaderContext';
import { Clock, Play } from 'lucide-react';
import Image from 'next/image';
import { useImageError } from '@/hooks/useImageError';

interface GameCategory {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  is_premium: boolean;
}

interface GameHistory {
  id: number;
  mode: string;
  date_played: string;
  categories: GameCategory[];
}

export default function HistoryPage() {
  const router = useRouter();
  const { setHeader } = useHeader();
  const { user, isLoading } = useAuthGate({ redirectIfGuest: '/login' });
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { handleError: handleImageError, hasError: hasImageError } = useImageError<string>();

  useEffect(() => {
    setHeader({ title: 'Game History', backHref: '/dashboard' });
  }, [setHeader]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await gamesAPI.getRecentGames();
        setGames(data);
      } catch (err) {
        console.error('Error fetching game history:', err);
        setError('Failed to load game history');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGames();
    }
  }, [user]);

  const handlePlayAgain = (categories: GameCategory[]) => {
    // Store selected category IDs in localStorage
    const categoryIds = categories.map(cat => cat.id);
    localStorage.setItem('selectedCategories', JSON.stringify(categoryIds));
    
    // Navigate to teams page to start a new game
    router.push('/teams');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-custom-bg flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eastern-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-gray-800 text-center">{error}</p>
            </div>
          )}

          {games.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
              <div className="text-gray-400 mb-4">
                <Clock className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Games Yet</h3>
              <p className="text-gray-600 mb-6">Start your first game to see it here!</p>
              <button
                onClick={() => router.push('/categories')}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Start New Game
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-eastern-blue-400 text-white px-8 py-2 mb-4 rounded-full shadow-lg">
                  <h2 className="lg:text-2xl font-bold text-center">
                    Your Recent Games
                  </h2>
                </div>
              </div>

              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-eastern-blue-100 backdrop-blur-md rounded-2xl p-6 mb-8 border border-primary-200 shadow-lg"
                >
                  {/* Game Header */}
                  <div className="relative flex justify-between items-center -mt-11 mb-6">
                    <div className="bg-eastern-blue-700 text-white px-6 py-2 rounded-full shadow-md">
                      <h3 className="lg:text-xl font-bold text-center flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {formatDate(game.date_played)}
                      </h3>
                    </div>
                    <div className="text-primary-600 text-sm bg-primary-50 px-3 py-1 rounded-full">
                      {game.categories.length} categories
                    </div>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {game.categories.map((category) => (
                      <div
                        key={category.id}
                        className="relative w-full aspect-[4/5] overflow-hidden border-5 border-eastern-blue-500 rounded-4xl"
                      >
                        {/* Top Section - Category Image */}
                        <div className="relative h-[80%]">
                          <div className="h-full w-full">
                            {category.image_url && !hasImageError(category.name) ? (
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                loading="lazy"
                                quality={85}
                                onError={() => handleImageError(category.name)}
                                unoptimized={category.image_url.includes('r2.dev')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-eastern-blue-200 to-eastern-blue-300">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-3">
                                  {category.name.charAt(0)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Section - Category Name */}
                        <div className="relative h-[21%] bg-gradient-to-br from-eastern-blue-500 to-eastern-blue-700 flex items-center justify-center p-4">
                          <h3 className="text-white items-center font-bold text-sm lg:text-lg text-center leading-tight">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Play Again Button */}
                  <div className="text-center">
                    <button
                      onClick={() => handlePlayAgain(game.categories)}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                    >
                      <Play className="h-5 w-5" />
                      <span>Play Again with Same Categories</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
