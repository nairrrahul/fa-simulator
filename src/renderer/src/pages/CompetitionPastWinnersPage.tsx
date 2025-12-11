import { JSX, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import FlagCard from "@renderer/components/FlagCard";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CompetitionPastWinnersPage(): JSX.Element {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { 
    competitions, 
    nations, 
    getCompetitionHistory, 
    getAvailableYearsForCompetition,
    getCompetitionHosts,
    gameDate 
  } = useGameStore();

  const competition = useMemo(() => {
    return competitions.get(parseInt(competitionId || "0"));
  }, [competitions, competitionId]);

  const history = useMemo(() => {
    if (!competition) return [];
    return getCompetitionHistory(competition.id);
  }, [competition, getCompetitionHistory]);

  const handleBackToCompetition = () => {
    if (!competition) return;
    
    // Find closest year to current game year, rounding down
    const availableYears = getAvailableYearsForCompetition(competition.id)
      .filter(y => y >= 2026);
    
    if (availableYears.length === 0) return;
    
    const currentYear = gameDate.year;
    const closestYear = availableYears
      .filter(y => y <= currentYear)
      .sort((a, b) => b - a)[0] || availableYears.sort((a, b) => a - b)[0];
    
    navigate(`/competition/finals/${competition.id}/${closestYear}`);
  };

  const getNation = (nationId: number | null) => {
    if (nationId === null) return null;
    return nations.find(n => n.id === nationId);
  };

  const getHostsForYear = (year: number) => {
    if (!competition) return [];
    const hostIds = getCompetitionHosts(competition.id, year);;
    return hostIds.map(id => nations.find(n => n.id === id)).filter(Boolean);
  };

  const canLinkToYear = (year: number) => {
    return year >= 2026;
  };

  if (!competition) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-2xl text-gray-400">Competition not found</p>
          <button
            onClick={() => navigate("/competition-search")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
            {competition.name} History
          </h1>
          <p className="text-gray-400">Complete history of all editions</p>
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
      <div className="bg-[#13131A] border border-gray-700 rounded-lg overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-[#1A1A22] border-b border-gray-700">
          <div className="text-sm font-semibold text-gray-400 uppercase">Year</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Hosts</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Winner</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Runner-Up</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Third Place</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Fourth Place</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Golden Ball</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Golden Boot</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-gray-800">
          {history.length > 0 ? (
            history.map((snapshot) => {
              const winner = getNation(snapshot.firstID);
              const runnerUp = getNation(snapshot.secondID);
              const third = getNation(snapshot.thirdID);
              const fourth = getNation(snapshot.fourthID);
              const hosts = getHostsForYear(snapshot.year);

              return (
                <div
                  key={`${snapshot.competitionID}-${snapshot.year}`}
                  className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-[#1A1A22] transition-colors"
                >
                  {/* Year */}
                  <div className="text-gray-200">
                    {canLinkToYear(snapshot.year) ? (
                      <button
                        onClick={() => navigate(`/competition/finals/${competition.id}/${snapshot.year}`)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {snapshot.year}
                      </button>
                    ) : (
                      <span>{snapshot.year}</span>
                    )}
                  </div>

                  {/* Hosts */}
                  <div className="space-y-1">
                    {hosts.map((host) => (
                      <button
                        key={host?.id}
                        onClick={() => navigate(`/nation/${host?.id}`)}
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-gray-200 text-sm"
                      >
                        {host && (
                          <>
                            <FlagCard
                              countryName={host.abbrev}
                              cssClasses="w-6 h-4 object-cover:text-lg"
                            />
                            <span>{host.name}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Winner */}
                  <div>
                    {winner && (
                      <button
                        onClick={() => navigate(`/nation/${winner.id}`)}
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-gray-200 text-sm"
                      >
                        <FlagCard
                          countryName={winner.abbrev}
                          cssClasses="w-6 h-4 object-cover:text-lg"
                        />
                        <span>{winner.name}</span>
                      </button>
                    )}
                  </div>

                  {/* Runner-Up */}
                  <div>
                    {runnerUp && (
                      <button
                        onClick={() => navigate(`/nation/${runnerUp.id}`)}
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-gray-200 text-sm"
                      >
                        <FlagCard
                          countryName={runnerUp.abbrev}
                          cssClasses="w-6 h-4 object-cover:text-lg"
                        />
                        <span>{runnerUp.name}</span>
                      </button>
                    )}
                  </div>

                  {/* Third Place */}
                  <div>
                    {third && (
                      <button
                        onClick={() => navigate(`/nation/${third.id}`)}
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-gray-200 text-sm"
                      >
                        <FlagCard
                          countryName={third.abbrev}
                          cssClasses="w-6 h-4 object-cover:text-lg"
                        />
                        <span>{third.name}</span>
                      </button>
                    )}
                  </div>

                  {/* Fourth Place */}
                  <div>
                    {fourth && (
                      <button
                        onClick={() => navigate(`/nation/${fourth.id}`)}
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-gray-200 text-sm"
                      >
                        <FlagCard
                          countryName={fourth.abbrev}
                          cssClasses="w-6 h-4 object-cover:text-lg"
                        />
                        <span>{fourth.name}</span>
                      </button>
                    )}
                  </div>

                  {/* Golden Ball - Placeholder for player */}
                  <div className="text-gray-500 text-sm">
                    {snapshot.goldenBallPlayerID ? "Player TBD" : ""}
                  </div>

                  {/* Golden Boot - Placeholder for player */}
                  <div className="text-gray-500 text-sm">
                    {snapshot.goldenBootPlayerID ? "Player TBD" : ""}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-gray-400">
              No historical data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}