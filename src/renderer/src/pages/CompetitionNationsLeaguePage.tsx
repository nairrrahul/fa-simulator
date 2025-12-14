import { JSX, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import CompetitionStages from "@renderer/components/competition/CompetitionStages";
import CompetitionFixtures from "@renderer/components/competition/CompetitionFixtures";
import CompetitionPastWinners from "@renderer/components/competition/CompetitionPastWinners";
import CompetitionPlayerStats from "@renderer/components/competition/CompetitionPlayerStats";
import CompetitionNLDivisions from "@renderer/components/competition/CompetitionNLDivisions";
import { getRoundTypeByCompetition } from "../../../utils/CompetitionFormatUtils";

export default function CompetitionNationsLeaguePage(): JSX.Element {
  const { competitionId, year } = useParams<{ competitionId: string; year: string }>();
  const navigate = useNavigate();
  const { competitions } = useGameStore();

  const competition = useMemo(() => {
    return competitions.get(parseInt(competitionId || "0"));
  }, [competitions, competitionId]);

  const competitionYear = parseInt(year || "0");

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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
        <h1 className="text-4xl font-bold text-gray-100 mb-2">
          {competition.name} {competitionYear}/{(competitionYear + 1).toString().slice(-2)}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Stages */}
        <div className="lg:col-span-1">
          <CompetitionStages
            competitionId={competition.id}
            year={competitionYear}
            getRoundTypeByCompetition={getRoundTypeByCompetition}
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
          <CompetitionNLDivisions
            competitionId={competition.id}
            year={competitionYear}
          />
        </div>
      </div>
    </div>
  );
}