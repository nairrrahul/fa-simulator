import { JSX, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import CompetitionStages from "@renderer/components/competition/CompetitionStages";
import CompetitionFixtures from "@renderer/components/competition/CompetitionFixtures";
import CompetitionPastWinners from "@renderer/components/competition/CompetitionPastWinners";
import CompetitionPlayerStats from "@renderer/components/competition/CompetitionPlayerStats";
import CompetitionQualifiedTeams from "@renderer/components/competition/CompetitionQualifiedTeams";

export default function CompetitionFinalsPage(): JSX.Element {
  const { competitionId, year } = useParams<{ competitionId: string; year: string }>();
  const navigate = useNavigate();
  const { competitions, nations, getCompetitionYearData, getCompetitionHosts } = useGameStore();

  const competition = useMemo(() => {
    return competitions.get(parseInt(competitionId || "0"));
  }, [competitions, competitionId]);

  const competitionYear = parseInt(year || "0");

  const yearData = useMemo(() => {
    if (!competition) return null;
    return getCompetitionYearData(competition.id, competitionYear);
  }, [competition, competitionYear, getCompetitionYearData]);

  const hosts = useMemo(() => {
    if (!competition) return [];
    const hostIDs = getCompetitionHosts(competition.id, competitionYear);
    return hostIDs.map(id => nations.find(n => n.id === id)).filter(Boolean);
  }, [competition, competitionYear, getCompetitionHosts, nations]);

  const hostsText = useMemo(() => {
    if (hosts.length === 0) return "";
    if (hosts.length === 1) return hosts[0]?.name || "";
    if (hosts.length === 2) return `${hosts[0]?.name} & ${hosts[1]?.name}`;
    return hosts.map(h => h?.name).join(", ");
  }, [hosts]);

  if (!competition || !yearData) {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
        <h1 className="text-4xl font-bold text-gray-100 mb-2">
          {competition.name} {competitionYear}
        </h1>
        {hostsText && (
          <p className="text-lg text-gray-400">
            Hosts: {hostsText}
          </p>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Stages */}
        <div className="lg:col-span-1">
          <CompetitionStages
            competitionId={competition.id}
            year={competitionYear}
          />
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-1 space-y-4">
          <CompetitionFixtures
            competitionId={competition.id}
            year={competitionYear}
          />
          <CompetitionPlayerStats />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-4">
          <CompetitionPastWinners competitionId={competition.id} />
          <CompetitionQualifiedTeams
            competitionId={competition.id}
            year={competitionYear}
          />
        </div>
      </div>
    </div>
  );
}