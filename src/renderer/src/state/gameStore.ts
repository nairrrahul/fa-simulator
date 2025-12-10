import { 
  Fixture, 
  Nation, 
  KOMapping, 
  Competition,
  CompetitionGroup,
  CompetitionHost,
  CompetitionSnapshot,
  CompetitionYearData,
  GameDate
} from 'src/common/gameState.interfaces';
import { create } from 'zustand';

interface GameState {
  nations: Nation[];
  fixtures: Map<number, Fixture>;
  competitions: Map<number, Competition>;
  knockoutMappings: Map<number, KOMapping>;
  // Competition data organized by competitionID -> year -> data
  competitionYearData: Map<number, Map<number, CompetitionYearData>>;
  gameDate: GameDate;
  isLoaded: boolean;
  
  // Actions
  loadGameData: (data: { 
    nations: Nation[], 
    fixtures: Fixture[], 
    competitions: Competition[],
    knockoutMappings: KOMapping[],
    gameStatus: GameDate,
    competitionGroups: CompetitionGroup[],
    competitionHosts: CompetitionHost[],
    competitionSnapshots: CompetitionSnapshot[]
  }) => void;
  updateNation: (id: number, updates: Partial<Nation>) => void;
  updateRankingPoints: (id: number, points: number) => void;
  updateFixture: (id: number, updates: Partial<Fixture>) => void;
  updateGameDate: (date: GameDate) => void;
  updateCompetitionGroup: (
    competitionID: number, 
    year: number, 
    groupID: number, 
    teamID: number, 
    updates: Partial<CompetitionGroup>
  ) => void;
  clearGameData: () => void;
  
  // Helper getters
  getFixturesByCompetition: (competitionId: number) => Fixture[];
  getFixturesByNation: (nationId: number) => Fixture[];
  getCompletedFixturesByNation: (nationId: number) => Fixture[];
  getUpcomingFixturesByNation: (nationId: number) => Fixture[];
  getCompetitionById: (competitionId: number) => Competition | undefined;
  getCompetitionsByConfederation: (confederationId: number) => Competition[];
  getFormattedDate: () => string;
  getCompetitionYearData: (competitionId: number, year: number) => CompetitionYearData | undefined;
  getCompetitionHosts: (competitionId: number, year: number) => number[];
  getCompetitionGroupStandings: (competitionId: number, year: number, groupId: number) => CompetitionGroup[];
  getCompetitionSnapshot: (competitionId: number, year: number) => CompetitionSnapshot | null;
  getCompetitionHistory: (competitionId: number) => CompetitionSnapshot[];
}

export const useGameStore = create<GameState>((set, get) => ({
  nations: [],
  fixtures: new Map(),
  knockoutMappings: new Map(),
  competitions: new Map(),
  competitionYearData: new Map(),
  gameDate: { year: 2026, month: 1, day: 1 },
  isLoaded: false,
  
  loadGameData: (data) => {
    const fixturesMap = new Map(data.fixtures.map(f => [f.id, f]));
    const mappingsMap = new Map(data.knockoutMappings.map(m => [m.matchID, m]));
    const competitionsMap = new Map(data.competitions.map(c => [c.id, c]));
    
    // Organize competition data by competitionID -> year
    const competitionYearData = new Map<number, Map<number, CompetitionYearData>>();
    
    // Process hosts
    data.competitionHosts.forEach(host => {
      if (!competitionYearData.has(host.competitionID)) {
        competitionYearData.set(host.competitionID, new Map());
      }
      const yearMap = competitionYearData.get(host.competitionID)!;
      
      if (!yearMap.has(host.year)) {
        yearMap.set(host.year, {
          year: host.year,
          hosts: [],
          groups: new Map(),
          snapshot: null
        });
      }
      yearMap.get(host.year)!.hosts.push(host.hostID);
    });
    
    // Process groups
    data.competitionGroups.forEach(group => {
      if (!competitionYearData.has(group.competitionID)) {
        competitionYearData.set(group.competitionID, new Map());
      }
      const yearMap = competitionYearData.get(group.competitionID)!;
      
      if (!yearMap.has(group.year)) {
        yearMap.set(group.year, {
          year: group.year,
          hosts: [],
          groups: new Map(),
          snapshot: null
        });
      }
      
      const yearData = yearMap.get(group.year)!;
      if (!yearData.groups.has(group.groupID)) {
        yearData.groups.set(group.groupID, []);
      }
      yearData.groups.get(group.groupID)!.push(group);
    });
    
    // Process snapshots - they're duplicated per host, so we only need to take the first one
    const processedSnapshots = new Set<string>();
    data.competitionSnapshots.forEach(snapshot => {
      const key = `${snapshot.competitionID}-${snapshot.year}`;
      
      // Skip if we've already processed this competition-year combination
      if (processedSnapshots.has(key)) return;
      processedSnapshots.add(key);
      
      if (!competitionYearData.has(snapshot.competitionID)) {
        competitionYearData.set(snapshot.competitionID, new Map());
      }
      const yearMap = competitionYearData.get(snapshot.competitionID)!;
      
      if (!yearMap.has(snapshot.year)) {
        yearMap.set(snapshot.year, {
          year: snapshot.year,
          hosts: [],
          groups: new Map(),
          snapshot: null
        });
      }
      yearMap.get(snapshot.year)!.snapshot = snapshot;
    });
    
    set({ 
      nations: data.nations,
      fixtures: fixturesMap,
      knockoutMappings: mappingsMap,
      competitions: competitionsMap,
      competitionYearData,
      gameDate: data.gameStatus,
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
  
  updateCompetitionGroup: (competitionID, year, groupID, teamID, updates) => set((state) => {
    const newCompetitionYearData = new Map(state.competitionYearData);
    const yearMap = newCompetitionYearData.get(competitionID);
    
    if (yearMap) {
      const yearData = yearMap.get(year);
      if (yearData && yearData.groups.has(groupID)) {
        const groups = yearData.groups.get(groupID)!;
        const updatedGroups = groups.map(g =>
          g.teamID === teamID ? { ...g, ...updates } : g
        );
        yearData.groups.set(groupID, updatedGroups);
      }
    }
    
    return { competitionYearData: newCompetitionYearData };
  }),
  
  clearGameData: () => set({ 
    nations: [], 
    fixtures: new Map(),
    knockoutMappings: new Map(),
    competitions: new Map(),
    competitionYearData: new Map(),
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
  },
  
  getCompetitionYearData: (competitionId, year) => {
    return get().competitionYearData.get(competitionId)?.get(year);
  },
  
  getCompetitionHosts: (competitionId, year) => {
    const yearData = get().competitionYearData.get(competitionId)?.get(year);
    return yearData?.hosts || [];
  },
  
  getCompetitionGroupStandings: (competitionId, year, groupId) => {
    const yearData = get().competitionYearData.get(competitionId)?.get(year);
    if (!yearData) return [];
    
    const teams = yearData.groups.get(groupId) || [];
    
    // Sort by: points desc, goal diff desc, goals for desc
    return [...teams].sort((a, b) => {
      const aPoints = a.wins * 3 + a.draws;
      const bPoints = b.wins * 3 + b.draws;
      if (aPoints !== bPoints) return bPoints - aPoints;
      
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (aGD !== bGD) return bGD - aGD;
      
      return b.goalsFor - a.goalsFor;
    });
  },
  
  getCompetitionSnapshot: (competitionId, year) => {
    return get().competitionYearData.get(competitionId)?.get(year)?.snapshot || null;
  },
  
  getCompetitionHistory: (competitionId) => {
    const yearMap = get().competitionYearData.get(competitionId);
    if (!yearMap) return [];
    
    const snapshots: CompetitionSnapshot[] = [];
    yearMap.forEach(yearData => {
      if (yearData.snapshot) {
        snapshots.push(yearData.snapshot);
      }
    });
    
    return snapshots.sort((a, b) => b.year - a.year); // Most recent first
  }
}));