'use client';
import Image from 'next/image';
import React from 'react';
import { ArrowRight,  } from 'lucide-react';

interface GameHeaderProps {
  onBackToBoard: () => void;
  currentTeamTurn: number;
  onTeamTurnChange: () => void;
  onEndGame?: () => void;
}

export default function GameHeader({ onBackToBoard, currentTeamTurn, onTeamTurnChange, onEndGame }: GameHeaderProps) {
  return (
    <header className="bg-slate-800/90 backdrop-blur-sm max-w-screen">
      <div className="container mx-auto px-3 py-3 max-w-screen">
        <div className="flex items-center justify-between">
             <div className="flex p-0 ">
                <Image
                  src="/logo/mylogo.svg"
                  alt="Trivia Logo"
                  width={50}
                  height={50}
                  className="mx-auto"
                />
             
              </div>
          {/* Left side - Team turn indicator with dice roll */}
          <button
            onClick={onTeamTurnChange}
            className=" text-white px-4 py-2 rounded-4xl -ml-95 flex items-center border-2 border-white text-sm transition-colors"
          >
            <span>🎲</span>
            <span className="hidden sm:inline ml-2">Team Turn: Team {currentTeamTurn}</span>
          </button>

          {/* Center title */}
          <div className="text-white text-xl font-bold">
            New Game
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={onEndGame}
              className=" text-white px-4 py-2 rounded-xl  border-2 border-white flex items-center   transition-colors text-sm"
            >
              
              <span className="hidden sm:inline mr-2">End the Game</span>
               <span >🏆</span>
            </button>
            <button
              onClick={onBackToBoard}
              className=" text-white px-4 py-2 rounded-xl  border-2 border-white flex items-center  transition-colors text-sm"
            >
              
              <span className="hidden sm:inline mr-2">Exit</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}