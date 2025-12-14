import { JSX, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import FlagCard from "@renderer/components/FlagCard";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface TeamDivisionHistory {
  teamId: number;
  teamName: string;
  teamAbbrev: string;
  currentDivision: number;
  history: Record<string, number | null>;
}

export default function CompetitionNLDivisionHistoryPage(): JSX.Element {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { 
    competitions, 
    nations, 
    nlDivisions, 
    getActiveOrUpcomingYearsForCompetition,
    gameDate 
  } = useGameStore();

  const competition = useMemo(() => {
    return competitions.get(parseInt(competitionId || "0"));
  }, [competitions, competitionId]);

  const { seasons, teamHistories } = useMemo(() => {
    if (!competition || !nlDivisions) {
      return { seasons: [], teamHistories: [] };
    }

    const compNlData = nlDivisions.get(competition.id);
    if (!compNlData) {
      return { seasons: [], teamHistories: [] };
    }

    const years = Array.from(compNlData.keys()).sort();
    const seasonStrings = years.map(y => `${y % 100}/${(y + 1) % 100}`);
    const latestYear = Math.max(...years);

    const histories: Map<number, TeamDivisionHistory> = new Map();

    for (const nation of nations) {
      histories.set(nation.id, {
        teamId: nation.id,
        teamName: nation.name,
        teamAbbrev: nation.abbrev,
        currentDivision: 0,
        history: {},
      });
    }

    years.forEach((year, i) => {
      const yearData = compNlData.get(year);
      if (!yearData) return;

      yearData.forEach((divisionData, division) => {
        divisionData.teams.forEach(teamId => {
          const teamHistory = histories.get(teamId);
          if (teamHistory) {
            teamHistory.history[seasonStrings[i]] = division;
            if (year === latestYear) {
              teamHistory.currentDivision = division;
            }
          }
        });
      });
    });

    const filteredAndSorted = Array.from(histories.values())
      .filter(h => h.currentDivision > 0)
      .sort((a, b) => a.currentDivision - b.currentDivision);

    return { seasons: seasonStrings, teamHistories: filteredAndSorted };
  }, [competition, nlDivisions, nations]);

  const handleBackToCompetition = () => {
    if (!competition) return;
    
    const activeYears = getActiveOrUpcomingYearsForCompetition(competition.id);
    if (activeYears.length === 0) return;
    
    // Find the year closest to the current game date
    const closestYear = activeYears.reduce((prev, curr) => 
      Math.abs(curr - gameDate.year) < Math.abs(prev - gameDate.year) ? curr : prev
    );

    navigate(`/competition/nations-league/${competition.id}/${closestYear}`);
  };

  const getDivisionClass = (division: number | null): string => {
    if (division === null) return "bg-gray-700/50 text-gray-400 border border-gray-600";
    switch (division) {
      case 1: return "bg-green-500/40 text-green-100 border border-green-700/50";
      case 2: return "bg-blue-500/40 text-blue-100 border border-blue-700/50";
      case 3: return "bg-yellow-500/40 text-yellow-100 border border-yellow-700/50";
      case 4: return "bg-red-500/40 text-red-100 border border-red-700/50";
      default: return "bg-gray-500/40 text-gray-100 border border-gray-600/50";
    }
  };

  if (!competition) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Competition not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
            {competition.name} Division History
          </h1>
          <p className="text-gray-400">All-time division status for each nation</p>
        </div>
        <button
          onClick={handleBackToCompetition}
          className="flex items-center gap-2 px-4 py-2 bg-[#13131A] hover:bg-[#1A1A22] border border-gray-700 rounded-lg text-gray-300 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Competition</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#13131A] border border-gray-700 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1A1A22]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Team
              </th>
              {seasons.map(season => (
                <th key={season} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {season}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {teamHistories.map(team => (
              <tr key={team.teamId} className="hover:bg-[#1A1A22] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => navigate(`/nation/${team.teamId}`)} className="flex items-center gap-3 text-sm text-gray-100 hover:text-cyan-400">
                    <FlagCard countryName={team.teamAbbrev} cssClasses="w-6 h-4 object-cover:text-lg" />
                    {team.teamName}
                  </button>
                </td>
                {seasons.map(season => {
                  const division = team.history[season] || null;
                  return (
                    <td key={season} className="whitespace-nowrap text-center">
                      <div className={`w-10 h-10 mx-auto flex items-center justify-center rounded-md text-sm font-bold ${getDivisionClass(division)}`}>
                        {division || "-"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
