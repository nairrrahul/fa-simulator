import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { CompetitionGroup } from "src/common/gameState.interfaces";
import { useGameStore } from "@renderer/state/gameStore";
import FlagCard from "./FlagCard";

interface GroupStageTableProps {
  standings: CompetitionGroup[];
  viewMode?: "compressed" | "normal";
  displayOptions?: Record<string, string | undefined>;
  groupLabel?: string;
}

export default function GroupStageTable({ 
  standings, 
  viewMode = "compressed",
  displayOptions = {},
  groupLabel 
}: GroupStageTableProps): JSX.Element {
  const navigate = useNavigate();
  const { nations } = useGameStore();

  const getPositionHighlight = (position: number): string => {
    const positionStr = position.toString();
    const color = displayOptions[positionStr];
    
    if (!color) return "";
    
    switch (color) {
      case "green": return "bg-green-900/20";
      case "yellow": return "bg-yellow-900/20";
      case "red": return "bg-red-900/20";
      default: return "";
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Group Header */}
      {groupLabel && (
        <div className="bg-[#1E1E25] px-3 py-2 border-b border-gray-700">
          <span className="text-sm font-semibold text-gray-300">{groupLabel}</span>
        </div>
      )}

      {/* Table Header */}
      <div className={`grid ${
        viewMode === "compressed" 
          ? "grid-cols-[minmax(30px,5%)_1fr_minmax(40px,8%)_minmax(35px,6%)_minmax(35px,6%)_minmax(35px,6%)_minmax(45px,8%)]"
          : "grid-cols-[minmax(30px,4%)_1fr_minmax(35px,5%)_minmax(40px,7%)_minmax(35px,5%)_minmax(35px,5%)_minmax(35px,5%)_minmax(35px,5%)_minmax(35px,5%)_minmax(45px,7%)]"
      } gap-2 px-3 py-2 bg-[#1A1A22] border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase`}>
        <div className="text-center">#</div>
        <div>Team</div>
        {viewMode === "normal" && <div className="text-center">P</div>}
        <div className="text-center">Pts</div>
        <div className="text-center">W</div>
        <div className="text-center">D</div>
        <div className="text-center">L</div>
        {viewMode === "normal" && <div className="text-center">GF</div>}
        {viewMode === "normal" && <div className="text-center">GA</div>}
        <div className="text-center">GD</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-800">
        {standings.map((team, idx) => {
          const nation = nations.find(n => n.id === team.teamID);
          const points = team.wins * 3 + team.draws;
          const gd = team.goalsFor - team.goalsAgainst;
          const position = idx + 1;
          const highlight = getPositionHighlight(position);

          return (
            <div
              key={team.teamID}
              className={`grid ${
                viewMode === "compressed"
                  ? "grid-cols-[minmax(30px,5%)_1fr_minmax(40px,8%)_minmax(35px,6%)_minmax(35px,6%)_minmax(35px,6%)_minmax(45px,8%)]"
                  : "grid-cols-[minmax(30px,4%)_1fr_minmax(35px,5%)_minmax(40px,7%)_minmax(35px,5%)_minmax(35px,5%)_minmax(35px,5%)_minmax(35px,5%)_minmax(35px,5%)_minmax(45px,7%)]"
              } gap-2 px-3 py-2 hover:bg-[#1A1A22] transition-colors text-sm ${highlight}`}
            >
              {/* Position */}
              <div className="text-gray-400 text-center">{position}</div>

              {/* Team Name with Flag */}
              <div className="flex items-center gap-2 min-w-0">
                {nation && (
                  <>
                    <FlagCard
                      countryName={nation.abbrev}
                      cssClasses="w-6 h-4 object-cover:text-lg flex-shrink-0"
                    />
                    <button
                      onClick={() => navigate(`/nation/${nation.id}`)}
                      className="text-gray-200 hover:text-cyan-400 transition-colors truncate"
                    >
                      {nation.name}
                    </button>
                  </>
                )}
              </div>

              {/* Games Played (normal view only) */}
              {viewMode === "normal" && (
                <div className="text-center text-gray-300">{team.gamesPlayed}</div>
              )}

              {/* Points */}
              <div className="text-center text-gray-200 font-semibold">{points}</div>

              {/* Wins */}
              <div className="text-center text-gray-300">{team.wins}</div>

              {/* Draws */}
              <div className="text-center text-gray-300">{team.draws}</div>

              {/* Losses */}
              <div className="text-center text-gray-300">{team.losses}</div>

              {/* Goals For (normal view only) */}
              {viewMode === "normal" && (
                <div className="text-center text-gray-300">{team.goalsFor}</div>
              )}

              {/* Goals Against (normal view only) */}
              {viewMode === "normal" && (
                <div className="text-center text-gray-300">{team.goalsAgainst}</div>
              )}

              {/* Goal Difference */}
              <div className={`text-center font-medium ${
                gd > 0 ? "text-green-400" : gd < 0 ? "text-red-400" : "text-gray-300"
              }`}>
                {gd > 0 ? `+${gd}` : gd}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}