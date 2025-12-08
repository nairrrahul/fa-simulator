import { JSX, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import { Fixture } from "src/common/gameState.interfaces";
import FlagCard from "@renderer/components/FlagCard";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function NationFixturesPage(): JSX.Element {
  const { nationId } = useParams<{ nationId: string }>();
  const navigate = useNavigate();
  const { nations, fixtures, competitions, getFixturesByNation } = useGameStore();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [sortAscending, setSortAscending] = useState(true);

  const nation = useMemo(() => {
    return nations.find(n => n.id === parseInt(nationId || "0"));
  }, [nations, nationId]);

  // Get all fixtures for the nation
  const nationFixtures = useMemo(() => {
    if (!nation) return [];
    return getFixturesByNation(nation.id);
  }, [nation, getFixturesByNation]);

  // Get fixtures for selected year
  const yearFixtures = useMemo(() => {
    return nationFixtures.filter(f => {
      if (!f.date) return false;
      const fixtureYear = new Date(f.date).getFullYear();
      return fixtureYear === selectedYear;
    });
  }, [nationFixtures, selectedYear]);

  // Sort fixtures by date
  const sortedFixtures = useMemo(() => {
    const sorted = [...yearFixtures].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortAscending ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [yearFixtures, sortAscending]);

  // Group fixtures by month
  const fixturesByMonth = useMemo(() => {
    const grouped: { [key: string]: Fixture[] } = {};
    sortedFixtures.forEach(fixture => {
      if (!fixture.date) return;
      const date = new Date(fixture.date);
      const monthKey = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(fixture);
    });
    return grouped;
  }, [sortedFixtures]);

  // Check if there are fixtures in adjacent years
  const hasNextYear = useMemo(() => {
    return nationFixtures.some(f => {
      if (!f.date) return false;
      return new Date(f.date).getFullYear() === selectedYear + 1;
    });
  }, [nationFixtures, selectedYear]);

  const hasPrevYear = useMemo(() => {
    return nationFixtures.some(f => {
      if (!f.date) return false;
      return new Date(f.date).getFullYear() === selectedYear - 1;
    });
  }, [nationFixtures, selectedYear]);

  const getOpponent = (fixture: Fixture) => {
    if (!nation) return null;
    const opponentId = fixture.team1ID === nation.id ? fixture.team2ID : fixture.team1ID;
    return nations.find(n => n.id === opponentId);
  };

  const getCompetitionById = (compID: number) => {
    return [...competitions.values()].find(cmp => cmp.id == compID);
  }

  const getOutcomeColor = (outcome: number | null) => {
    switch (outcome) {
      case 0: return "bg-green-500"; // Win
      case 1: return "bg-red-500";   // Loss
      case 2: return "bg-gray-500";  // Draw
      case 3: return "bg-orange-500"; // Penalty Loss
      default: return "bg-transparent";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  if (!nation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-2xl text-gray-400">Nation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/nation/${nationId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#13131A] hover:bg-[#1A1A22] border border-gray-700 rounded-lg text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Nation</span>
          </button>
          <h2 className="text-3xl font-bold text-gray-100">
            Fixtures
          </h2>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-3 bg-[#13131A] border border-gray-700 rounded-lg px-4 py-2">
          <button
            onClick={() => setSelectedYear(prev => prev - 1)}
            disabled={!hasPrevYear}
            className={`p-1 rounded transition-colors ${
              hasPrevYear
                ? "text-gray-300 hover:bg-[#1A1A22]"
                : "text-gray-600 cursor-not-allowed"
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-gray-100 font-medium min-w-[100px] text-center">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear(prev => prev + 1)}
            disabled={!hasNextYear}
            className={`p-1 rounded transition-colors ${
              hasNextYear
                ? "text-gray-300 hover:bg-[#1A1A22]"
                : "text-gray-600 cursor-not-allowed"
            }`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fixtures Table */}
      <div className="bg-[#13131A] border border-gray-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[200px_1fr_150px_200px] gap-4 px-6 py-4 bg-[#1A1A22] border-b border-gray-700">
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="text-left text-sm font-semibold text-gray-400 uppercase hover:text-gray-300 transition-colors"
          >
            Date {sortAscending ? "↑" : "↓"}
          </button>
          <div className="text-sm font-semibold text-gray-400 uppercase">Opposition</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Result</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Competition</div>
        </div>

        {/* Fixtures List */}
        <div>
          {Object.keys(fixturesByMonth).length > 0 ? (
            Object.entries(fixturesByMonth).map(([month, fixtures]) => (
              <div key={month}>
                {/* Month Header */}
                <div className="px-6 py-2 bg-[#0E0E14] border-b border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {month}
                  </span>
                </div>

                {/* Month Fixtures */}
                {fixtures.map((fixture) => {
                  const opponent = getOpponent(fixture);
                  return (
                    <div
                      key={fixture.id}
                      className="grid grid-cols-[200px_1fr_150px_200px] gap-4 px-6 py-4 hover:bg-[#1A1A22] transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      {/* Date */}
                      <div className="text-gray-300 text-sm">
                        {fixture.date && formatDate(fixture.date)}
                      </div>

                      {/* Opposition */}
                      <div className="flex items-center gap-3">
                        {opponent ? (
                          <>
                            <FlagCard
                              countryName={opponent.abbrev}
                              cssClasses="w-8 h-6 object-cover:text-2xl"
                            />
                            <span className="text-gray-200">{opponent.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </div>

                      {/* Result */}
                      <div className="flex items-center gap-2">
                        {fixture.scoreline ? (
                          <>
                            <div className={`w-3 h-3 rounded-full ${getOutcomeColor(fixture.outcome)}`} />
                            <span className="text-gray-200 font-medium">{fixture.scoreline}</span>
                          </>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </div>

                      {/* Competition */}
                      <div className="text-gray-400 text-sm">
                        {fixture.competitionID != null ? getCompetitionById(fixture.competitionID)!.name : "Friendly"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No fixtures scheduled for {selectedYear}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}