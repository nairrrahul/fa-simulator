import { JSX, useState, useMemo } from "react";
import { useGameStore } from "@renderer/state/gameStore";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface CompetitionStagesProps {
  competitionId: number;
  year: number;
}

export default function CompetitionStages({ competitionId, year }: CompetitionStagesProps): JSX.Element {
  const { getCompetitionYearData, getCompetitionGroupStandings, nations } = useGameStore();
  const [selectedRound, setSelectedRound] = useState<number>(0);

  const yearData = useMemo(() => {
    return getCompetitionYearData(competitionId, year);
  }, [competitionId, year, getCompetitionYearData]);

  // Get available rounds from groups
  const availableRounds = useMemo(() => {
    if (!yearData) return [];
    const rounds = new Set<number>();
    yearData.groups.forEach((teams) => {
      teams.forEach(team => rounds.add(team.roundID));
    });
    return Array.from(rounds).sort((a, b) => a - b);
  }, [yearData]);

  // Get groups for selected round
  const roundGroups = useMemo(() => {
    if (!yearData || availableRounds.length === 0) return [];
    const round = availableRounds[selectedRound] || availableRounds[0];
    const groupsInRound = new Set<number>();
    
    yearData.groups.forEach((teams, groupId) => {
      if (teams.some(t => t.roundID === round)) {
        groupsInRound.add(groupId);
      }
    });
    
    return Array.from(groupsInRound).sort((a, b) => a - b);
  }, [yearData, selectedRound, availableRounds]);

  if (!yearData || availableRounds.length === 0) {
    return (
      <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide mb-4 flex items-center justify-between">
          <span>STAGES</span>
        </h2>
        <p className="text-gray-500 text-sm text-center py-8">No stage data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide cursor-pointer hover:text-cyan-300 transition-colors">
          STAGES <ChevronRightIcon className="w-4 h-4 inline" />
        </h2>
        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(parseInt(e.target.value))}
          className="px-3 py-1.5 bg-[#1E1E25] border border-gray-600 rounded text-gray-200 text-sm focus:outline-none focus:border-cyan-500"
        >
          {availableRounds.map((round, idx) => (
            <option key={round} value={idx}>
              Round {round}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {roundGroups.map(groupId => {
          const standings = getCompetitionGroupStandings(competitionId, year, groupId);
          
          return (
            <div key={groupId} className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-[#1E1E25] px-3 py-2 border-b border-gray-700">
                <span className="text-sm font-semibold text-gray-300">GROUP {groupId}</span>
              </div>
              <div className="divide-y divide-gray-800">
                {standings.map((team, idx) => {
                  const nation = nations.find(n => n.id === team.teamID);
                  const points = team.wins * 3 + team.draws;
                  const gd = team.goalsFor - team.goalsAgainst;
                  
                  return (
                    <div
                      key={team.teamID}
                      className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-2 hover:bg-[#1A1A22] transition-colors text-sm"
                    >
                      <span className="text-gray-400 w-6">{idx + 1}</span>
                      <span className="text-gray-200">{nation?.name || "Unknown"}</span>
                      <span className="text-gray-300 font-medium">{points}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}