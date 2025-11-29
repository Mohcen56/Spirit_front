'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Play, History } from 'lucide-react';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useHeader } from '@/contexts/HeaderContext';

export default function HomePage() {
  const { setHeader } = useHeader();
  const { user, isLoading } = useAuthGate({ redirectIfGuest: '/login' });

  useEffect(() => {
    setHeader({ title: "", backHref: "/" });
  }, [setHeader]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-custom-bg flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-custom-bg">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Trivia Spirit
            </h2>
            <p className="text-xl text-gray-600">
              Test your knowledge and have fun with your friends
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2   gap-6">
            {/* Start New Game */}
            <Link href="/categories">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">New Game</h3>
                  <p className="text-gray-600 text-sm">Start a new game and choose question categories</p>
                </div>
              </div>
            </Link>

     

            {/* Game History */}
            <Link href="/history">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <History className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">your games </h3>
                  <p className="text-gray-600 text-sm">Your previous games If you keep playing them</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
        </div>
      </main>
    </div>
  );
}
