import { JSX, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import confederationsData from '../../../data/confederations.json' with { type: 'json' };
import NationHeader from "@renderer/components/nation/NationHeader";
import NextFixtureCard from "@renderer/components/nation/NextFixtureCard";
import WorldRankingCard from "@renderer/components/nation/WorldRankingCard";
import PlayersCard from "@renderer/components/nation/PlayersCard";
import CompetitionsCard from "@renderer/components/nation/CompetitionsCard";
import NavigationCard from "@renderer/components/nation/NavigationCard";

const CONFEDERATIONS = confederationsData as Record<string, { name: string; continent: string }>;

export default function NationOverviewPage(): JSX.Element {
  const { nationId } = useParams<{ nationId: string }>();
  const navigate = useNavigate();
  const { nations, getUpcomingFixturesByNation, getCompetitionsByConfederation } = useGameStore();

  const nation = useMemo(() => {
    return nations.find(n => n.id === parseInt(nationId || "0"));
  }, [nations, nationId]);

  // Get confederation info
  const confederationInfo = useMemo(() => {
    if (!nation) return null;
    const confederation = CONFEDERATIONS[nation.confederationID.toString()];
    return confederation ? `${confederation.name} (${confederation.continent})` : "Unknown";
  }, [nation]);

  // Get next fixture
  const nextFixture = useMemo(() => {
    if (!nation) return null;
    const upcomingFixtures = getUpcomingFixturesByNation(nation.id);
    // Sort by date and get the earliest one
    const sorted = upcomingFixtures
      .filter(f => f.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    return sorted[0] || null;
  }, [nation, getUpcomingFixturesByNation]);

  // Calculate world ranking
  const worldRanking = useMemo(() => {
    if (!nation) return 0;
    const sortedNations = [...nations].sort((a, b) => b.rankingPts - a.rankingPts);
    return sortedNations.findIndex(n => n.id === nation.id) + 1;
  }, [nation, nations]);

  // Get competitions for confederation
  const confederationCompetitions = useMemo(() => {
    if (!nation) return [];
    return getCompetitionsByConfederation(nation.confederationID);
  }, [nation, getCompetitionsByConfederation]);

  if (!nation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-2xl text-gray-400">Nation not found</p>
          <button
            onClick={() => navigate("/nation-search")}
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
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <NationHeader
            nation={nation}
            confederationInfo={confederationInfo || ""}
          />
        </div>
        <div className="space-y-4">
          <NextFixtureCard
            fixture={nextFixture}
            currentNationId={nation.id}
          />
          <WorldRankingCard
            ranking={worldRanking}
            totalNations={nations.length}
            onNavigate={() => navigate("/rankings")}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PlayersCard />
        <CompetitionsCard competitions={confederationCompetitions} />
        <NavigationCard />
      </div>
    </div>
  );
}