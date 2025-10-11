'use client';

import React, { useState } from 'react';
import { gameAPI } from '@/lib/api/index';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGameCreation = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing game creation...');
      
      // First test: Get categories
      const categories = await gameAPI.getCategories();
      console.log('Categories:', categories);
      setResult(prev => prev + `✅ Categories loaded: ${categories.length} found\n`);
      
      if (categories.length > 0) {
        // Second test: Create a game
        const game = await gameAPI.startGame(
          [categories[0].id],
          [{ name: 'Test Team', avatar: '' }]
        );
        console.log('Created game:', game);
        setResult(prev => prev + `✅ Game created with ID: ${game.id} (type: ${typeof game.id})\n`);
        setResult(prev => prev + `Game data: ${JSON.stringify(game, null, 2)}\n`);
        
        // Third test: Try to fetch the created game
        if (game.id) {
          const fetchedGame = await gameAPI.getGame(game.id);
          console.log('Fetched game:', fetchedGame);
          setResult(prev => prev + `✅ Game fetched successfully: ${fetchedGame.id}\n`);
        } else {
          setResult(prev => prev + `❌ Game created but no ID returned\n`);
        }
      } else {
        setResult(prev => prev + `❌ No categories available\n`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Game API Test</h1>
        
        <button 
          onClick={testGameCreation}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Game Creation & Fetching'}
        </button>
        
        {result && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test Results:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}