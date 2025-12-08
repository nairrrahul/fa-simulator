import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Fixture, Nation } from "src/common/gameState.interfaces";
import { useGameStore } from "@renderer/state/gameStore";
import FlagCard from "./FlagCard";

interface FixtureRowProps {
  fixture: Fixture;
  opponent: Nation | null;
  outcomeForNation: number | null;
}

export default function FixtureRow({ fixture, opponent, outcomeForNation }: FixtureRowProps): JSX.Element {
  const navigate = useNavigate();
  const { getCompetitionById } = useGameStore();
  
  const competition = fixture.competitionID != null ? getCompetitionById(fixture.competitionID) : null;

  const getOutcomeColor = (outcome: number | null) => {
    switch (outcome) {
      case 0: return "bg-green-500";      // Win
      case 1: return "bg-red-500";        // Loss
      case 2: return "bg-yellow-500";     // Draw
      case 3: return "bg-orange-500";     // Penalty Loss
      case 4: return "bg-green-400";      // Penalty Win (lighter green)
      default: return "bg-transparent";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const handleOpponentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (opponent) {
      navigate(`/nation/${opponent.id}`);
    }
  };

  return (
    <div className="grid grid-cols-[200px_1fr_150px_200px] gap-4 px-6 py-4 hover:bg-[#1A1A22] transition-colors border-b border-gray-800 last:border-b-0">
      {/* Date */}
      <div className="text-gray-300 text-sm">
        {fixture.date && formatDate(fixture.date)}
      </div>

      {/* Opposition */}
      <div className="flex items-center gap-3">
        {opponent ? (
          <>
            <FlagCard
              countryName={opponent.abbrev}
              cssClasses="w-8 h-6 object-cover:text-2xl"
            />
            <span 
              onClick={handleOpponentClick}
              className="text-gray-200 hover:text-blue-400 cursor-pointer transition-colors"
            >
              {opponent.name}
            </span>
          </>
        ) : (
          <span className="text-gray-500">Unknown</span>
        )}
      </div>

      {/* Result */}
      <div className="flex items-center gap-2">
        {fixture.scoreline ? (
          <>
            <div className={`w-3 h-3 rounded-full ${getOutcomeColor(outcomeForNation)}`} />
            <span className="text-gray-200 font-medium">{fixture.scoreline}</span>
          </>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </div>

      {/* Competition */}
      <div className="text-gray-400 text-sm">
        {competition ? competition.name : "Friendly"}
      </div>
    </div>
  );
}