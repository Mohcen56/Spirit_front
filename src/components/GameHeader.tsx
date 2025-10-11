'use client';

import React from 'react';
import { ArrowRight,  } from 'lucide-react';

interface GameHeaderProps {
  onBackToBoard: () => void;
  currentTeamTurn: number;
  onTeamTurnChange: () => void;
}

export default function GameHeader({ onBackToBoard, currentTeamTurn, onTeamTurnChange }: GameHeaderProps) {
  return (
    <header className="bg-slate-800/90 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToBoard}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Exit</span>
            </button>
            <button className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm">
              <span>🏆</span>
              <span>End the Game</span>
            </button>
            
          </div>

          {/* Center title */}
          <div className="text-white text-xl font-bold">
            New Game
          </div>

          {/* Right side - Team role indicator */}
          <button
            onClick={onTeamTurnChange}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
          >
            <span>🎲</span>
            <span>Team {currentTeamTurn} Turn</span>
          </button>
        </div>
      </div>
    </header>
  );
}