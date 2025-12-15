import { JSX } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { Competition } from "src/common/gameState.interfaces";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";

interface CompetitionsCardProps {
  competitions: Competition[];
}

export default function CompetitionsCard({ competitions }: CompetitionsCardProps): JSX.Element {
  const navigate = useNavigate();
  const { getActiveOrUpcomingYearsForCompetition, gameDate } = useGameStore();

  const handleCompetitionClick = (competition: Competition) => {
    const availableYears = getActiveOrUpcomingYearsForCompetition(competition.id);
    if (availableYears.length === 0) return;

    const closestYear = availableYears.reduce((prev, curr) => 
      Math.abs(curr - gameDate.year) < Math.abs(prev - gameDate.year) ? curr : prev
    );

    if (competition.competitionType === 0) {
      navigate(`/competition/finals/${competition.id}/${closestYear}`);
    } else if (competition.competitionType === 2) {
      navigate(`/competition/nations-league/${competition.id}/${closestYear}`);
    }
  };

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700 h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
        <TrophyIcon className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
          Confederation Competitions
        </h2>
      </div>
      
      <div className="space-y-2">
        {competitions.length > 0 ? (
          competitions.map((competition) => {
            const canNavigate = competition.competitionType === 0 || competition.competitionType === 2;
            return (
              <button
                key={competition.id}
                onClick={() => canNavigate && handleCompetitionClick(competition)}
                className={`w-full text-left px-4 py-3 bg-[#1E1E25] border border-gray-700 rounded-lg text-gray-200 text-sm font-medium ${
                  canNavigate ? 'hover:bg-[#2A2A35] transition-colors cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
                disabled={!canNavigate}
              >
                {competition.name}
              </button>
            )
          })
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <p className="text-sm">No competitions available</p>
          </div>
        )}
      </div>
    </div>
  );
}