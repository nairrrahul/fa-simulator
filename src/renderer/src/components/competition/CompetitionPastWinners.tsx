import { JSX, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import FlagCard from "../FlagCard";

interface CompetitionPastWinnersProps {
  competitionId: number;
}

export default function CompetitionPastWinners({ competitionId }: CompetitionPastWinnersProps): JSX.Element {
  const navigate = useNavigate();
  const { getCompetitionHistory, nations } = useGameStore();

  const winners = useMemo(() => {
    const history = getCompetitionHistory(competitionId);
    return history.map(snapshot => {
      const winner = nations.find(n => n.id === snapshot.firstID);
      return {
        year: snapshot.year,
        winner
      };
    });
  }, [competitionId, getCompetitionHistory, nations]);

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <h2 
        onClick={() => navigate(`/competition/past-winners/${competitionId}`)}
        className="text-lg font-semibold text-cyan-400 uppercase tracking-wide mb-4 cursor-pointer hover:text-cyan-300 transition-colors"
      >
        PAST WINNERS <ChevronRightIcon className="w-4 h-4 inline" />
      </h2>
      
      {winners.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-hidden">
          {winners.map(({ year, winner }) => (
            <div
              key={year}
              className="flex items-center justify-between px-3 py-2 hover:bg-[#1E1E25] rounded transition-colors"
            >
              <div className="flex items-center gap-3">
                {winner && (
                  <FlagCard
                    countryName={winner.abbrev}
                    cssClasses="w-8 h-6 object-cover:text-2xl"
                  />
                )}
                <span className="text-gray-200">{winner?.name || "Unknown"}</span>
              </div>
              <span className="text-gray-400 text-sm">{year}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">No past winners</p>
      )}
    </div>
  );
}