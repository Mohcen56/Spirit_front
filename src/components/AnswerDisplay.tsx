'use client';

import React from 'react';
import { Question } from '@/types/game';
import { RotateCcw, Users } from 'lucide-react';
import Image from 'next/image';
import { getFullImageUrl } from '@/lib/imageUtils';
import GameCard from './GameCard';

interface AnswerDisplayProps {
  question: Question;
  onShowQuestion: () => void;
  onShowTeamSelector: () => void;
}

export default function AnswerDisplay({ question, onShowQuestion, onShowTeamSelector }: AnswerDisplayProps) {
  return (
    <GameCard question={question}>
      {/* Answer Text */}
      <div className="text-center mb-8">
        <h1 className="text-gray-800 text-2xl md:text-3xl font-bold leading-relaxed">
          {question.answer_ar || question.answer}
        </h1>
      </div>
      
      {/* Answer Image if available */}
      {question.answer_image && (
        <div className="mb-8">
          <div className="relative max-w-lg mx-auto rounded-xl overflow-hidden">
           <Image
              src={getFullImageUrl(question.answer_image) || ''}
             alt="Answer image"
             width={800}
             height={400}
             className="w-full h-59 object-contain mx-auto"
             unoptimized
           />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute -bottom-6 -right-15 transform -translate-x-1/2">
        {/* Back to Question Button */}
        <button
          onClick={onShowQuestion}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors text-lg font-bold"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Show Question</span>
        </button>
</div>

      {/* Team Selector Button */}
      <div className="absolute -bottom-6 left-30 transform -translate-x-1/2">
        <button
          onClick={onShowTeamSelector}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors font-bold text-lg"
        >
          <Users className="h-4 w-4" />
          <span>Who Answered?</span>
        </button>
      </div>
    </GameCard>
  );
}