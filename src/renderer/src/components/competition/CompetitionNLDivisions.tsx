import { JSX, useMemo } from "react";
import { useGameStore } from "@renderer/state/gameStore";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import FlagCard from "../FlagCard";

interface CompetitionNLDivisionsProps {
  competitionId: number;
  year: number;
}

export default function CompetitionNLDivisions({ competitionId, year }: CompetitionNLDivisionsProps): JSX.Element {
  const { getNLDivisions, nations } = useGameStore();

  const divisions = useMemo(() => {
    const divMap = getNLDivisions(competitionId, year);
    if (!divMap) return [];
    
    // Convert to array and sort by division number
    return Array.from(divMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([divNum, divData]) => ({
        divisionNumber: divNum,
        teams: divData.teams.map(teamId => nations.find(n => n.id === teamId)).filter(Boolean)
      }));
  }, [competitionId, year, getNLDivisions, nations]);

  const getDivisionName = (divNum: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `League ${letters[divNum - 1] || divNum}`;
  };

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <h2 
        className="text-lg font-semibold text-cyan-400 uppercase tracking-wide mb-4 cursor-pointer hover:text-cyan-300 transition-colors"
      >
        Division Overview <ChevronRightIcon className="w-4 h-4 inline" />
      </h2>
      
      {divisions.length > 0 ? (
        <div className="space-y-4">
          {divisions.map(({ divisionNumber, teams }) => (
            <div key={divisionNumber} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Division Header */}
              <div className="bg-[#1E1E25] px-3 py-2 border-b border-gray-700">
                <span className="text-sm font-semibold text-gray-300">
                  {getDivisionName(divisionNumber)}
                </span>
              </div>
              
              {/* Team Flags Grid */}
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => (
                    team && (
                      <div
                        key={team.id}
                        className="group relative"
                        title={team.name}
                      >
                        <FlagCard
                          countryName={team.abbrev}
                          cssClasses="w-8 h-6 object-cover:text-2xl"
                        />
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">No division data available</p>
      )}
    </div>
  );
}