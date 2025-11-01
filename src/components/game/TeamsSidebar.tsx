import React from 'react';
import Image from 'next/image';

interface Team {
  id: number;
  name: string;
  avatar?: string;
}

interface TeamsSidebarProps {
  teams: Team[];
  currentTeam: number;
  doublePerkActiveTeamId: number | null;
  doublePerkUsed: Record<number, boolean>;
  rerollPerkUsed: Record<number, boolean>;
  onActivateDouble: (teamId: number) => void;
  onActivateReroll: (teamId: number) => void;
  onShowChoices: (teamId: number) => void;
}

export default function TeamsSidebar({
  teams,
  currentTeam,
  doublePerkActiveTeamId,
  doublePerkUsed,
  rerollPerkUsed,
  onActivateDouble,
  onActivateReroll,
  onShowChoices,
}: TeamsSidebarProps) {
  return (
    <div className="w-full lg:w-80 px-2 flex justify-center">
      <div className="flex lg:flex-col gap-1 justify-center items-stretch w-full">
        {teams.slice(0, 4).map((team, index) => {
          const isTurn = teams.findIndex(t => t.id === team.id) === currentTeam - 1;

          return (
            <div key={team.id} className="mt-1">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-2 flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {team.avatar ? (
                    <Image
                      src={`/avatars/${team.avatar}.jpeg`}
                      alt={team.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="font-bold text-lg">{index + 1}</span>
                  )}
                </div>

                {/* Team Info */}
                <div>
                  <div className="font-bold mb-1">{team.name}</div>
                  <div className="flex space-x-2">
                    {/* Double Perk */}
                    <button
                      onClick={() => onActivateDouble(team.id)}
                      disabled={
                        !!doublePerkUsed[team.id] ||
                        doublePerkActiveTeamId !== null ||
                        !isTurn
                      }
                      title="Activate Double Points"
                      className={`p-1 rounded border text-sm ${
                        doublePerkActiveTeamId === team.id
                          ? 'bg-green-500 border-green-600'
                          : 'bg-white/20 border-white/30 hover:bg-white/30'
                      } disabled:opacity-50`}
                    >
                      🔥
                    </button>

                    {/* Reroll */}
                    <button
                      onClick={() => onActivateReroll(team.id)}
                      disabled={!!rerollPerkUsed[team.id] || !isTurn}
                      title="Reroll Question"
                      className="p-1 rounded border text-sm bg-white/20 border-white/30 hover:bg-white/30 disabled:opacity-50"
                    >
                      🔁
                    </button>

                    {/* Show Choices */}
                    <button
                      onClick={() => onShowChoices(team.id)}
                      disabled={!isTurn}
                      title="Show Choices"
                      className="p-1 rounded border text-sm bg-white/20 border-white/30 hover:bg-white/30 disabled:opacity-50"
                    >
                      💡
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
