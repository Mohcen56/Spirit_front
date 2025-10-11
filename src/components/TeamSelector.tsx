'use client';

import React, { useState } from 'react';
import { Team, Question } from '@/types/game';
import { Users, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import GameCard from './GameCard';

interface TeamSelectorProps {
  question: Question;
  teams: Team[];
  onAwardPoints: (teamId: number | null) => Promise<void>;
  onBackToAnswer?: () => void;
  awardError: string;
  awardSuccess: string;
}

export default function TeamSelector({ 
  question,
  teams, 
  onAwardPoints, 
  onBackToAnswer,
  awardError, 
  awardSuccess 
}: TeamSelectorProps) {
  const [clickedTeamId, setClickedTeamId] = useState<number | null | 'none'>(null);

  const handleTeamClick = async (teamId: number | null) => {
    setClickedTeamId(teamId === null ? 'none' : teamId);
    await onAwardPoints(teamId);
  };

  return (
    <GameCard question={question}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-gray-800 text-2xl md:text-3xl font-bold mb-2">Who answered the question?</h2>
        <p className="text-gray-600 text-lg">Select the team that answered correctly or choose &quot;No one&quot;</p>
      </div>

      {/* Team Selection Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => handleTeamClick(team.id)}
            className={`group transition-all duration-200 transform hover:scale-105 relative ${
              clickedTeamId === team.id 
                ? 'bg-green-500 scale-105' 
                : 'bg-slate-600 hover:bg-slate-700'
            } rounded-2xl p-6 text-white shadow-lg border-4 border-white h-20 flex items-center justify-start space-x-4`}
          >
            {/* Team Avatar - Circular */}
            <div className="flex-shrink-0">
              <div className="w-15 h-15 rounded-full flex items-center justify-center overflow-hidden   shadow-md">
                {team.avatar ? (
                  <Image
                    src={`/avatars/${team.avatar}.jpeg`}
                    alt={team.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                ) : (
                  <Users className="h-8 w-8 text-slate-600" />
                )}
              </div>
            </div>

            {/* Team Name */}
            <div className="flex-1 text-center">
              <h3 className="font-bold text-xl text-white">
                {team.name}
              </h3>
            </div>

            {/* Success indicator */}
            {clickedTeamId === team.id && (
              <div className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            )}
          </button>
        ))}

        {/* No One Answered Button - Same rectangular style */}
        <button
          onClick={() => handleTeamClick(null)}
          className={`group transition-all duration-200 transform hover:scale-105 relative ${
            clickedTeamId === 'none'
              ? 'bg-green-500 scale-105'
              : 'bg-slate-600 hover:bg-slate-700'
          } rounded-2xl p-6 text-white shadow-lg border-4 border-white h-20 flex items-center justify-center col-span-1 md:col-span-2`}
        >
          {/* No Answer Icon - Circular with sad face */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-15 h-15 rounded-full bg-white/90 flex items-center justify-center border-3 border-white shadow-md">
              <span className="text-2xl">😞</span>
            </div>
          </div>

          {/* No Answer Text */}
          <div className="flex-1 text-center">
            <h3 className="font-bold text-xl text-white">
            no one answered
            </h3>
          </div>

          {/* Success indicator */}
          {clickedTeamId === 'none' && (
            <div className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          )}
        </button>
      </div>

        {/* Status Messages */}
        {(awardError || awardSuccess) && (
          <div className="text-center">
            {awardError && (
              <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 mb-2">
                <p className="text-red-600 text-lg">{awardError}</p>
              </div>
            )}
            {awardSuccess && (
              <div className="bg-green-500/20 border border-green-400 rounded-xl p-4 mb-0 flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-600 text-lg">{awardSuccess}</p>
              </div>
            )}
          </div>
        )}

        {/* Back to Answer Button */}
        {onBackToAnswer && (
          <div className=" relative flex justify-left -mt-3">
            <button
              onClick={onBackToAnswer}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Answer</span>
            </button>
          </div>
        )}
    </GameCard>
  );
}