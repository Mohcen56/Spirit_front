'use client';

import React from 'react';
import { Question } from '@/types/game';

interface GameCardProps {
  question: Question;
  children: React.ReactNode;
}

export default function GameCard({ question, children }: GameCardProps) {
  return (
    <div className="relative">
      {/* Main Card */}
      <div className="bg-white rounded-3xl mt-4 p-3 shadow-2xl border-4 border-blue-400 relative">
        
        {/* === Floating Labels on the border === */}
        {/* Left - Category */}
        <div className="absolute -top-5 left-6 bg-slate-700 text-white px-4 py-1 rounded-md text-sm font-medium">
          {question.category?.name || 'Category'}
        </div>

        {/* Right - Points */}
        <div className="absolute -top-5 right-6 bg-amber-600 text-white px-4 py-1 rounded-md text-sm font-bold">
          {question.points} Points
        </div>

        {/* Content */}
        <div className="mt-6 h-100">
          {children}
        </div>

      </div>
    </div>
  );
}