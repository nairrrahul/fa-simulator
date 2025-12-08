import { JSX } from "react";
import { Fixture } from "src/common/gameState.interfaces";
import { useGameStore } from "@renderer/state/gameStore";
import FlagCard from "../FlagCard";
import { CalendarIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface NextFixtureCardProps {
  fixture: Fixture | null;
  currentNationId: number;
}

export default function NextFixtureCard({ fixture, currentNationId }: NextFixtureCardProps): JSX.Element {
  const { nations } = useGameStore();

  const getOpponentAbbrev = () => {
    if (!fixture) return null;
    const opponentId = fixture.team1ID === currentNationId ? fixture.team2ID : fixture.team1ID;
    const opponent = nations.find(n => n.id === opponentId);
    return opponent?.abbrev || null;
  };

  const getCurrentNationAbbrev = () => {
    const nation = nations.find(n => n.id === currentNationId);
    return nation?.abbrev || "???";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const opponentAbbrev = getOpponentAbbrev();
  const currentAbbrev = getCurrentNationAbbrev();

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      {/* Header with View Fixtures button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Next Match
        </h2>
        <button className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <span>VIEW FIXTURES</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Date */}
      {fixture && fixture.date && (
        <div className="flex items-center gap-2 text-cyan-400 mb-4">
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{formatDate(fixture.date)}</span>
        </div>
      )}

      {/* Fixture Display */}
      <div className="flex items-center justify-center gap-6 py-4">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          <FlagCard 
            countryName={currentAbbrev} 
            cssClasses="w-16 h-12 object-cover:text-4xl" 
          />
        </div>

        {/* VS */}
        <div className="text-2xl font-bold text-gray-500">
          VS
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center">
          {opponentAbbrev ? (
            <FlagCard 
              countryName={opponentAbbrev} 
              cssClasses="w-16 h-12 object-cover:text-4xl" 
            />
          ) : (
            <div className="w-16 h-12 bg-[#1E1E25] border-2 border-dashed border-gray-600 rounded flex items-center justify-center">
              <span className="text-2xl text-gray-600">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}