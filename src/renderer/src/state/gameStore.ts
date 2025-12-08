import { Fixture, Nation, KOMapping, Competition, GameDate } from 'src/common/gameState.interfaces';
import { create } from 'zustand';

interface GameState {
  nations: Nation[];
  fixtures: Map<number, Fixture>; // Map by fixture ID for fast lookup
  competitions: Map<number, Competition>;
  knockoutMappings: Map<number, KOMapping>; // Map by matchID
  isLoaded: boolean;
  gameDate: GameDate;
  
  // Actions
  loadGameData: (data: { 
    nations: Nation[], 
    fixtures: Fixture[], 
    competitions: Competition[],
    knockoutMappings: KOMapping[],
    gameStatus: GameDate 
  }) => void;
  updateNation: (id: number, updates: Partial<Nation>) => void;
  updateRankingPoints: (id: number, points: number) => void;
  updateFixture: (id: number, updates: Partial<Fixture>) => void;
  updateGameDate: (date: GameDate) => void;
  clearGameData: () => void;
  
  // Helper getters
  getFixturesByCompetition: (competitionId: number) => Fixture[];
  getFixturesByNation: (nationId: number) => Fixture[];
  getCompletedFixturesByNation: (nationId: number) => Fixture[];
  getUpcomingFixturesByNation: (nationId: number) => Fixture[];
  getCompetitionById: (competitionId: number) => Competition | undefined;
  getCompetitionsByConfederation: (confederationId: number) => Competition[];
  getFormattedDate: () => string;
}

export const useGameStore = create<GameState>((set, get) => ({
  nations: [],
  fixtures: new Map(),
  knockoutMappings: new Map(),
  competitions: new Map(),
  gameDate: { year: 2026, month: 1, day: 1 },
  isLoaded: false,
  
  loadGameData: (data) => {
    const fixturesMap = new Map(data.fixtures.map(f => [f.id, f]));
    const mappingsMap = new Map(data.knockoutMappings.map(m => [m.matchID, m]));
    const competitionsMap = new Map(data.competitions.map(c => [c.id, c]))
    
    set({ 
      nations: data.nations,
      fixtures: fixturesMap,
      knockoutMappings: mappingsMap,
      competitions: competitionsMap,
      isLoaded: true 
    });
  },
  
  updateNation: (id, updates) => set((state) => ({
    nations: state.nations.map(nation =>
      nation.id === id ? { ...nation, ...updates } : nation
    )
  })),
  
  updateRankingPoints: (id, points) => set((state) => ({
    nations: state.nations.map(nation =>
      nation.id === id ? { ...nation, rankingPts: points } : nation
    )
  })),
  
  updateFixture: (id, updates) => set((state) => {
    const newFixtures = new Map(state.fixtures);
    const existing = newFixtures.get(id);
    if (existing) {
      newFixtures.set(id, { ...existing, ...updates });
    }
    return { fixtures: newFixtures };
  }),
  
  updateGameDate: (date) => set({ gameDate: date }),
  
  clearGameData: () => set({ 
    nations: [], 
    fixtures: new Map(),
    knockoutMappings: new Map(),
    competitions: new Map(),
    gameDate: { year: 2026, month: 1, day: 1 },
    isLoaded: false 
  }),
  
  // Helper methods
  getFixturesByCompetition: (competitionId) => {
    return Array.from(get().fixtures.values())
      .filter(f => f.competitionID === competitionId);
  },
  
  getFixturesByNation: (nationId) => {
    return Array.from(get().fixtures.values())
      .filter(f => f.team1ID === nationId || f.team2ID === nationId);
  },
  
  getCompletedFixturesByNation: (nationId) => {
    return Array.from(get().fixtures.values())
      .filter(f => 
        (f.team1ID === nationId || f.team2ID === nationId) && 
        f.scoreline !== null
      );
  },
  
  getUpcomingFixturesByNation: (nationId) => {
    return Array.from(get().fixtures.values())
      .filter(f => 
        (f.team1ID === nationId || f.team2ID === nationId) && 
        f.scoreline === null
      );
  },

  getCompetitionById: (competitionId) => {
    return get().competitions.get(competitionId);
  },
  
  getCompetitionsByConfederation: (confederationId) => {
    return Array.from(get().competitions.values())
      .filter(c => c.confederationID === confederationId);
  },

  getFormattedDate: () => {
    const { year, month } = get().gameDate;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[month - 1]} ${year}`;
  }
  
}));