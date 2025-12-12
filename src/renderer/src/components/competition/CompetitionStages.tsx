import { JSX, useState, useMemo } from "react";
import { useGameStore } from "@renderer/state/gameStore";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import GroupStageTable from "../GroupStageTable";
import FlagCard from "../FlagCard";
import { getCompetitionDrawDate, getFixtureSuffixForCompetition, getGroupDisplayOptions, getMonthName, getRoundNameByCompetition } from "../../../../utils/CompetitionFormatUtils";

interface CompetitionStagesProps {
  competitionId: number;
  year: number;
  getRoundTypeByCompetition?: (competitionId: number, competitionType: number, roundId: number) => string;
}

export default function CompetitionStages({ 
  competitionId, 
  year,
  getRoundTypeByCompetition 
}: CompetitionStagesProps): JSX.Element {
    const { getCompetitionYearData, getCompetitionGroupStandings, fixtures, nations, getCompetitionById  } = useGameStore();
  const [selectedRound, setSelectedRound] = useState<number>(0);

  const yearData = useMemo(() => {
    return getCompetitionYearData(competitionId, year);
  }, [competitionId, year, getCompetitionYearData]);

  // Get available rounds from groups FOR THIS SPECIFIC YEAR
  const availableRounds = useMemo(() => {
    if (!yearData) return [];
    const rounds = new Set<number>();
    fixtures.forEach((fixture) => {
      if(fixture.date) {
        const fixtDate = new Date(fixture.date);
        if(year == fixtDate.getFullYear())
          rounds.add(fixture.roundID);
      }
    });
    return Array.from(rounds).sort((a, b) => a - b);
  }, [yearData, year]);

  const currentRound = availableRounds[selectedRound] || availableRounds[0];
  const competition = getCompetitionById(competitionId);
  const drawDate = getCompetitionDrawDate(competitionId, competition?.competitionType, year);

  // Determine round type
  const roundType = useMemo(() => {
    if (!getRoundTypeByCompetition || !currentRound) return "GROUPSTAGEREG";
    return getRoundTypeByCompetition(competitionId, competition!.competitionType, currentRound);
  }, [getRoundTypeByCompetition, competitionId, currentRound]);

  // Get groups for selected round (only for group stage rounds)
  const roundGroups = useMemo(() => {
    if (!yearData || availableRounds.length === 0) return [];
    if (roundType !== "GROUPSTAGEREG" && roundType !== "GROUPSTAGEHA") return [];
    
    const groupsInRound = new Set<number>();
    
    yearData.groups.forEach((teams, groupId) => {
      // Check if this group has teams in the current round AND current year
      if (teams.some(t => t.roundID === currentRound && t.year === year)) {
        groupsInRound.add(groupId);
      }
    });
    
    return Array.from(groupsInRound).sort((a, b) => a - b);
  }, [yearData, selectedRound, availableRounds, currentRound, roundType, year]);

  // Get fixtures for knockout/home-away rounds
  const roundFixtures = useMemo(() => {
    if (roundType !== "KNOCKOUT" && roundType !== "HOMEAWAY") return [];
    
    return Array.from(fixtures.values())
      .filter(f => f.competitionID === competitionId && f.roundID === currentRound)
      .sort((a, b) => a.id - b.id);
  }, [fixtures, competitionId, currentRound, roundType]);

  if (!yearData || availableRounds.length === 0) {
    return (
      <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide mb-4 flex items-center justify-between">
          <span>STAGES</span>
        </h2>
        <p className="text-gray-500 text-sm text-center py-8">
          Competition to be drawn on<br />
          {getMonthName(drawDate.month)} {drawDate.day}, {drawDate.year}
          </p>
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
              {getRoundNameByCompetition(competition!.id, competition!.competitionType, round)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {/* Group Stage Display */}
        {(roundType === "GROUPSTAGEREG" || roundType === "GROUPSTAGEHA") && (
          <>
            {roundGroups.map(groupId => {
              // Filter standings to only include teams from the current round
              const allStandings = getCompetitionGroupStandings(competitionId, year, groupId);
              const roundStandings = allStandings.filter(team => team.roundID === currentRound);
              
              return (
                <GroupStageTable
                  key={`${currentRound}-${groupId}`}
                  standings={roundStandings}
                  viewMode="compressed"
                  displayOptions={getGroupDisplayOptions(competitionId, competition?.competitionType, currentRound)}
                  groupLabel={getFixtureSuffixForCompetition(competitionId, competition!.competitionType, currentRound, groupId)}
                />
              );
            })}
          </>
        )}

        {/* Knockout Display */}
        {roundType === "KNOCKOUT" && (
          <div className="space-y-0 divide-y divide-gray-800">
            {roundFixtures.length > 0 ? (
              roundFixtures.map((fixture) => {
                const team1 = nations.find(n => n.id === fixture.team1ID);
                const team2 = nations.find(n => n.id === fixture.team2ID);
                
                return (
                  <div key={fixture.id} className="py-3">
                    <div className="text-xs text-gray-500 mb-2">Fixture</div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      {/* Team 1 */}
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-200">{team1?.name || "TBD"}</span>
                        {team1 && (
                          <FlagCard
                            countryName={team1.abbrev}
                            cssClasses="w-6 h-4 object-cover:text-lg"
                          />
                        )}
                      </div>
                      
                      {/* Center - VS or Scoreline */}
                      <div className="flex items-center justify-center min-w-[80px]">
                        {fixture.scoreline ? (
                          <span className="text-cyan-400 font-semibold">{fixture.scoreline}</span>
                        ) : (
                          <span className="text-gray-400">vs</span>
                        )}
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex items-center gap-2">
                        {team2 && (
                          <FlagCard
                            countryName={team2.abbrev}
                            cssClasses="w-6 h-4 object-cover:text-lg"
                          />
                        )}
                        <span className="text-gray-200">{team2?.name || "TBD"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No fixtures in this round</p>
            )}
          </div>
        )}

        {/* Home-Away Display */}
        {roundType === "HOMEAWAY" && (
          <div className="space-y-0 divide-y divide-gray-800">
            {roundFixtures.length > 0 ? (
              (() => {
                // Group fixtures by pairs (assuming they're ordered correctly)
                const pairs: typeof roundFixtures[] = [];
                for (let i = 0; i < roundFixtures.length; i += 2) {
                  pairs.push([roundFixtures[i], roundFixtures[i + 1]].filter(Boolean));
                }
                
                return pairs.map((pair, idx) => {
                  const fixture1 = pair[0];
                  const fixture2 = pair[1];
                  
                  // Assume fixture1 is home for team1, fixture2 is home for team2
                  const team1 = nations.find(n => n.id === fixture1?.team1ID);
                  const team2 = nations.find(n => n.id === fixture1?.team2ID);
                  
                  // Calculate aggregate if both legs played
                  let aggregateScore = "";
                  if (fixture1?.scoreline && fixture2?.scoreline) {
                    const [f1t1, f1t2] = fixture1.scoreline.split('-').map(Number);
                    const [f2t2, f2t1] = fixture2.scoreline.split('-').map(Number);
                    const team1Total = f1t1 + f2t1;
                    const team2Total = f1t2 + f2t2;
                    aggregateScore = `${team1Total} - ${team2Total}`;
                  }
                  
                  return (
                    <div key={fixture1?.id || idx} className="py-3">
                      <div className="text-xs text-gray-500 mb-2">Fixture</div>
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Team 1 */}
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-200">{team1?.name || "TBD"}</span>
                          {team1 && (
                            <FlagCard
                              countryName={team1.abbrev}
                              cssClasses="w-6 h-4 object-cover:text-lg"
                            />
                          )}
                        </div>
                        
                        {/* Center - Aggregate and leg scores */}
                        <div className="flex flex-col items-center min-w-[100px]">
                          {aggregateScore ? (
                            <>
                              <span className="text-cyan-400 font-semibold text-base">{aggregateScore}</span>
                              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                {fixture1?.scoreline && <div>{fixture1.scoreline}</div>}
                                {fixture2?.scoreline && <div>{fixture2.scoreline}</div>}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">vs</span>
                          )}
                        </div>
                        
                        {/* Team 2 */}
                        <div className="flex items-center gap-2">
                          {team2 && (
                            <FlagCard
                              countryName={team2.abbrev}
                              cssClasses="w-6 h-4 object-cover:text-lg"
                            />
                          )}
                          <span className="text-gray-200">{team2?.name || "TBD"}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No fixtures in this round</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}