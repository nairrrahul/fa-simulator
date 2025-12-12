import { JSX, useState, useMemo } from "react";
import { useGameStore } from "@renderer/state/gameStore";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getFixtureSuffixForCompetition } from "../../../../utils/CompetitionFormatUtils";

interface CompetitionFixturesProps {
  competitionId: number;
  year: number;
}

export default function CompetitionFixtures({ competitionId, year }: CompetitionFixturesProps): JSX.Element {
  const { fixtures, nations, getCompetitionById } = useGameStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get all fixtures for this competition
  const competitionFixtures = useMemo(() => {
    return Array.from(fixtures.values())
      .filter(f => f.competitionID === competitionId)
      .filter(f => f.date !== null)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  }, [fixtures, competitionId]);

  // Get unique dates
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    competitionFixtures.forEach(f => {
      if (f.date) dates.add(f.date);
    });
    return Array.from(dates).sort();
  }, [competitionFixtures]);

  // Set initial date
  useMemo(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Get fixtures for selected date
  const dateFixtures = useMemo(() => {
    if (!selectedDate) return [];
    return competitionFixtures.filter(f => f.date === selectedDate);
  }, [competitionFixtures, selectedDate]);

  const currentDateIndex = availableDates.indexOf(selectedDate || "");
  const competition = getCompetitionById(competitionId);

  const handlePrevDate = () => {
    if (currentDateIndex > 0) {
      setSelectedDate(availableDates[currentDateIndex - 1]);
    }
  };

  const handleNextDate = () => {
    if (currentDateIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentDateIndex + 1]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOpponent = (fixture: any, nationId: number) => {
    const opponentId = fixture.team1ID === nationId ? fixture.team2ID : fixture.team1ID;
    return nations.find(n => n.id === opponentId) || null;
  };

  const getOutcomeForNation = (fixture: any, nationId: number) => {
    if (fixture.outcome === null) return null;
    if (fixture.team1ID === nationId) return fixture.outcome;
    
    // Flip outcome for team2
    switch (fixture.outcome) {
      case 0: return 1;
      case 1: return 0;
      case 2: return 2;
      case 3: return 4;
      case 4: return 3;
      default: return fixture.outcome;
    }
  };

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide cursor-pointer hover:text-cyan-300 transition-colors">
          FIXTURES/RESULTS <ChevronRightIcon className="w-4 h-4 inline" />
        </h2>
        {availableDates.length > 0 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevDate}
              disabled={currentDateIndex === 0}
              className={`p-1 rounded transition-colors ${
                currentDateIndex === 0
                  ? "text-gray-600 cursor-not-allowed"
                  : "hover:bg-[#1E1E25] text-gray-400"
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-300 min-w-[140px] text-center">
              {selectedDate && formatDate(selectedDate)}
            </span>
            <button 
              onClick={handleNextDate}
              disabled={currentDateIndex === availableDates.length - 1}
              className={`p-1 rounded transition-colors ${
                currentDateIndex === availableDates.length - 1
                  ? "text-gray-600 cursor-not-allowed"
                  : "hover:bg-[#1E1E25] text-gray-400"
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-0 divide-y divide-gray-800">
        {dateFixtures.length > 0 ? (
          dateFixtures.map((fixture) => {
            const team1 = nations.find(n => n.id === fixture.team1ID);
            const team2 = nations.find(n => n.id === fixture.team2ID);
            
            return (
              <div key={fixture.id} className="py-3">
                <div className="text-xs text-gray-500 mb-2">{
                  getFixtureSuffixForCompetition(
                    competition?.competitionType,
                    competition!.id,
                    fixture.roundID,
                    fixture.groupID
                  )
                  }</div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* Team 1 - Right aligned */}
                  <div className="text-right">
                    <span className="text-gray-200">{team1?.name || "TBD"}</span>
                  </div>
                  
                  {/* Center - VS or Scoreline */}
                  <div className="flex items-center justify-center min-w-[80px]">
                    {fixture.scoreline ? (
                      <span className="text-cyan-400 font-semibold">{fixture.scoreline}</span>
                    ) : (
                      <span className="text-gray-400">vs</span>
                    )}
                  </div>
                  
                  {/* Team 2 - Left aligned */}
                  <div className="text-left">
                    <span className="text-gray-200">{team2?.name || "TBD"}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">
            {availableDates.length === 0 ? "No fixtures assigned" : "No fixtures on this date"}
          </p>
        )}
      </div>
    </div>
  );
}