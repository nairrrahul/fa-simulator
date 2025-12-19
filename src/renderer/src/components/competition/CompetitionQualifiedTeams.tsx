import { JSX, useMemo } from "react";
import { useGameStore } from "@renderer/state/gameStore";
import FlagCard from "../FlagCard";

interface CompetitionQualifiedTeamsProps {
  competitionId: number;
  year: number;
}

export default function CompetitionQualifiedTeams({ competitionId, year }: CompetitionQualifiedTeamsProps): JSX.Element {
  const { getCompetitionYearData, nations } = useGameStore();

  //this page is only used on finals competitions, so we will only want teams in round 1
  const qualifiedTeams = useMemo(() => {
    const yearData = getCompetitionYearData(competitionId, year);
    if (!yearData) return [];
    
    return yearData.qualifiedTeams[1]
      .map(teamId => nations.find(n => n.id === teamId))
      .filter(Boolean)
      .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
  }, [competitionId, year, getCompetitionYearData, nations]);

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide mb-4">
        Qualified Teams
      </h2>
      
      {qualifiedTeams.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {qualifiedTeams.map((team) => (
            <div
              key={team?.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#1E1E25] rounded transition-colors"
            >
              {team && (
                <>
                  <FlagCard
                    countryName={team.abbrev}
                    cssClasses="w-8 h-6 object-cover:text-2xl"
                  />
                  <span className="text-gray-200">{team.name}</span>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">No qualified teams</p>
      )}
    </div>
  );
}