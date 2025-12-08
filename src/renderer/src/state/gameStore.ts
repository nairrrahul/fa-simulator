import { Fixture, Nation, KOMapping } from 'src/common/gameState.interfaces';
import { create } from 'zustand';

interface GameState {
  nations: Nation[];
  fixtures: Map<number, Fixture>; // Map by fixture ID for fast lookup
  knockoutMappings: Map<number, KOMapping>; // Map by matchID
  isLoaded: boolean;
  
  // Actions
  loadGameData: (data: { 
    nations: Nation[], 
    fixtures: Fixture[], 
    knockoutMappings: KOMapping[] 
  }) => void;
  updateNation: (id: number, updates: Partial<Nation>) => void;
  updateRankingPoints: (id: number, points: number) => void;
  updateFixture: (id: number, updates: Partial<Fixture>) => void;
  clearGameData: () => void;
  
  // Helper getters
  getFixturesByCompetition: (competitionId: number) => Fixture[];
  getFixturesByNation: (nationId: number) => Fixture[];
  getCompletedFixturesByNation: (nationId: number) => Fixture[];
  getUpcomingFixturesByNation: (nationId: number) => Fixture[];
}

export const useGameStore = create<GameState>((set, get) => ({
  nations: [],
  fixtures: new Map(),
  knockoutMappings: new Map(),
  isLoaded: false,
  
  loadGameData: (data) => {
    const fixturesMap = new Map(data.fixtures.map(f => [f.id, f]));
    const mappingsMap = new Map(data.knockoutMappings.map(m => [m.matchID, m]));
    
    set({ 
      nations: data.nations,
      fixtures: fixturesMap,
      knockoutMappings: mappingsMap,
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
  
  clearGameData: () => set({ 
    nations: [], 
    fixtures: new Map(),
    knockoutMappings: new Map(),
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
        f.result !== null
      );
  },
  
  getUpcomingFixturesByNation: (nationId) => {
    return Array.from(get().fixtures.values())
      .filter(f => 
        (f.team1ID === nationId || f.team2ID === nationId) && 
        f.result === null
      );
  }
}));