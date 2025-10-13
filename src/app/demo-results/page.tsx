'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function DemoResultsPage() {
  return (
    <div className="min-h-screen bg-custom-bg flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Demo Results Page</h1>
        <p className="text-gray-600 mb-8">
          This is a demo link to test the end game results page. In a real game, this would show automatically when the game ends.
        </p>
        
        <div className="space-y-4">
          <Link href="/game/1/results">
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200 hover:bg-white/90 transition-all duration-200 transform hover:scale-105 cursor-pointer group shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-800">View Sample Game Results</span>
              </div>
            </div>
          </Link>
          
          <Link href="/">
            <div className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors">
              Back to Home
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}