import { 
  Fixture, 
  Nation, 
  KOMapping, 
  Competition,
  CompetitionGroup,
  CompetitionHost,
  CompetitionSnapshot,
  CompetitionQualified,
  CompetitionYearData,
  NLGroup,
  NLDivisionData
} from 'src/common/gameState.interfaces';
import { create } from 'zustand';

export interface GameDate {
  year: number;
  month: number;
  day: number;
}

interface GameState {
  nations: Nation[];
  fixtures: Map<number, Fixture>;
  competitions: Map<number, Competition>;
  knockoutMappings: Map<number, KOMapping>;
  // Competition data organized by competitionID -> year -> data
  competitionYearData: Map<number, Map<number, CompetitionYearData>>;
  nlDivisions: Map<number, Map<number, Map<number, NLDivisionData>>>;
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
    competitionSnapshots: CompetitionSnapshot[],
    competitionQualified: CompetitionQualified[],
    nlGroups: NLGroup[]
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
  getFixturesByCompetitionEdition: (competitionId: number, editionYear: number) => Fixture[];
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
  getAvailableYearsForCompetition: (competitionId: number) => number[];
  getCompletedYearsForCompetition: (competitionId: number) => number[];
  getActiveOrUpcomingYearsForCompetition: (competitionId: number) => number[];
  isCompetitionCompleted: (competitionId: number, year: number) => boolean;
  getNLDivisions: (competitionId: number, year: number) => Map<number, NLDivisionData> | undefined;
  getNLTeamsInDivision: (competitionId: number, year: number, division: number) => number[];
  getNLTeamsInPot: (competitionId: number, year: number, division: number, potId: number) => number[];
}

export const useGameStore = create<GameState>((set, get) => ({
  nations: [],
  fixtures: new Map(),
  knockoutMappings: new Map(),
  competitions: new Map(),
  competitionYearData: new Map(),
  nlDivisions: new Map(),
  gameDate: { year: 2026, month: 1, day: 1 },
  isLoaded: false,
  
  loadGameData: (data) => {
    const fixturesMap = new Map(data.fixtures.map(f => [f.id, f]));
    const mappingsMap = new Map(data.knockoutMappings.map(m => [m.matchID, m]));
    const competitionsMap = new Map(data.competitions.map(c => [c.id, c]));
    
    // Organize competition data by competitionID -> year
    const competitionYearData = new Map<number, Map<number, CompetitionYearData>>();
    
    // Helper function to ensure year entry exists
    const ensureYearEntry = (competitionID: number, year: number) => {
      if (!competitionYearData.has(competitionID)) {
        competitionYearData.set(competitionID, new Map());
      }
      const yearMap = competitionYearData.get(competitionID)!;
      
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          hosts: [],
          groups: new Map(),
          snapshot: null,
          qualifiedTeams: [],
          fixtureYears: new Set()
        });
      }
      return yearMap.get(year)!;
    };
    
    // For qualifiers, determine edition year from parent competition
    const getEditionYear = (competitionID: number, fixtureYear: number): number => {
      const competition = competitionsMap.get(competitionID);
      
      // For qualifiers (type 1), use parent competition's closest edition
      if (competition?.competitionType === 1 && competition.parentCompetition !== -1) {
        // Look at parent competition hosts to find which edition this qualifier belongs to
        const parentHosts = data.competitionHosts
          .filter(h => h.competitionID === competition.parentCompetition)
          .map(h => h.year)
          .sort((a, b) => a - b);
        
        // Find the first parent edition year >= fixture year (qualifiers lead up to finals)
        const editionYear = parentHosts.find(y => y >= fixtureYear) || fixtureYear;
        return editionYear;
      }
      
      // For finals and Nations League, fixture year IS the edition year
      return fixtureYear;
    };
    
    // Pre-populate years from fixtures with proper edition mapping
    data.fixtures.forEach(fixture => {
      if (fixture.date) {
        const fixtureYear = new Date(fixture.date).getFullYear();
        const editionYear = getEditionYear(fixture.competitionID, fixtureYear);
        const yearData = ensureYearEntry(fixture.competitionID, editionYear);
        yearData.fixtureYears.add(fixtureYear);
      }
    });
    
    // Pre-populate years from competition groups (year field is edition year)
    data.competitionGroups.forEach(group => {
      ensureYearEntry(group.competitionID, group.year);
    });
    
    // Pre-populate years from NL groups (year field is edition year)
    data.nlGroups.forEach(nlGroup => {
      ensureYearEntry(nlGroup.competitionID, nlGroup.year);
    });
    
    // Process hosts
    data.competitionHosts.forEach(host => {
      const yearData = ensureYearEntry(host.competitionID, host.year);
      yearData.hosts.push(host.hostID);
    });
    
    // Process groups
    data.competitionGroups.forEach(group => {
      const yearData = ensureYearEntry(group.competitionID, group.year);
      
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
      
      const yearData = ensureYearEntry(snapshot.competitionID, snapshot.year);
      yearData.snapshot = snapshot;
    });
    
    // Process qualified teams
    data.competitionQualified.forEach(qualified => {
      const yearData = ensureYearEntry(qualified.competitionID, qualified.year);
      yearData.qualifiedTeams.push(qualified.teamID);
    });
    
    // Process Nations League divisions
    const nlDivisions = new Map<number, Map<number, Map<number, NLDivisionData>>>();
    
    data.nlGroups.forEach(nlGroup => {
      if (!nlDivisions.has(nlGroup.competitionID)) {
        nlDivisions.set(nlGroup.competitionID, new Map());
      }
      const compMap = nlDivisions.get(nlGroup.competitionID)!;
      
      if (!compMap.has(nlGroup.year)) {
        compMap.set(nlGroup.year, new Map());
      }
      const yearMap = compMap.get(nlGroup.year)!;
      
      if (!yearMap.has(nlGroup.division)) {
        yearMap.set(nlGroup.division, {
          division: nlGroup.division,
          teams: [],
          pots: new Map()
        });
      }
      const divisionData = yearMap.get(nlGroup.division)!;
      
      // Add team to division
      divisionData.teams.push(nlGroup.teamID);
      
      // Add team to pot
      if (!divisionData.pots.has(nlGroup.potID)) {
        divisionData.pots.set(nlGroup.potID, []);
      }
      divisionData.pots.get(nlGroup.potID)!.push(nlGroup.teamID);
    });
    
    set({ 
      nations: data.nations,
      fixtures: fixturesMap,
      knockoutMappings: mappingsMap,
      competitions: competitionsMap,
      competitionYearData,
      nlDivisions,
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
    nlDivisions: new Map(),
    gameDate: { year: 2026, month: 1, day: 1 },
    isLoaded: false 
  }),
  
  // Helper methods
  getFixturesByCompetition: (competitionId) => {
    return Array.from(get().fixtures.values())
      .filter(f => f.competitionID === competitionId);
  },
  
  getFixturesByCompetitionEdition: (competitionId, editionYear) => {
    const yearData = get().competitionYearData.get(competitionId)?.get(editionYear);
    if (!yearData) return [];
    
    // Get all fixtures from any year that belongs to this edition
    return Array.from(get().fixtures.values())
      .filter(f => {
        if (f.competitionID !== competitionId || !f.date) return false;
        const fixtureYear = new Date(f.date).getFullYear();
        return yearData.fixtureYears.has(fixtureYear);
      });
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
  },
  
  getAvailableYearsForCompetition: (competitionId: number) => {
    const competition = get().competitions.get(competitionId);
    if (!competition) return [];
    
    // For finals competitions (type 0), get years from hosts
    if (competition.competitionType === 0) {
      const yearMap = get().competitionYearData.get(competitionId);
      if (!yearMap) return [];
      return Array.from(yearMap.keys()).sort((a, b) => b - a);
    }
    
    // For qualifiers (type 1), get years from parent competition's hosts
    if (competition.competitionType === 1 && competition.parentCompetition !== -1) {
      const parentYearMap = get().competitionYearData.get(competition.parentCompetition);
      if (!parentYearMap) return [];
      return Array.from(parentYearMap.keys()).sort((a, b) => b - a);
    }
    
    // For nations league (type 2), return empty for now
    if (competition.competitionType === 2) {
      return [];
    }
    
    return [];
  },
  
  getCompletedYearsForCompetition: (competitionId: number) => {
    const competition = get().competitions.get(competitionId);
    if (!competition) return [];
    
    const checkId = competition.competitionType === 1 && competition.parentCompetition !== -1
      ? competition.parentCompetition
      : competitionId;
    
    const yearMap = get().competitionYearData.get(checkId);
    if (!yearMap) return [];
    
    const completedYears: number[] = [];
    yearMap.forEach((yearData, year) => {
      if (yearData.snapshot) {
        completedYears.push(year);
      }
    });
    
    return completedYears.sort((a, b) => b - a);
  },
  
  getActiveOrUpcomingYearsForCompetition: (competitionId: number) => {
    const competition = get().competitions.get(competitionId);
    if (!competition) return [];
    
    const checkId = competition.competitionType === 1 && competition.parentCompetition !== -1
      ? competition.parentCompetition
      : competitionId;
    
    const yearMap = get().competitionYearData.get(checkId);
    if (!yearMap) return [];
    
    const activeYears: number[] = [];
    yearMap.forEach((yearData, year) => {
      if (!yearData.snapshot) {
        activeYears.push(year);
      }
    });
    
    return activeYears.sort((a, b) => b - a);
  },
  
  isCompetitionCompleted: (competitionId: number, year: number) => {
    const competition = get().competitions.get(competitionId);
    if (!competition) return false;
    
    const checkId = competition.competitionType === 1 && competition.parentCompetition !== -1
      ? competition.parentCompetition
      : competitionId;
    
    const yearData = get().competitionYearData.get(checkId)?.get(year);
    return yearData?.snapshot !== null && yearData?.snapshot !== undefined;
  },
  
  getNLDivisions: (competitionId: number, year: number) => {
    return get().nlDivisions.get(competitionId)?.get(year);
  },
  
  getNLTeamsInDivision: (competitionId: number, year: number, division: number) => {
    const divisions = get().nlDivisions.get(competitionId)?.get(year);
    return divisions?.get(division)?.teams || [];
  },
  
  getNLTeamsInPot: (competitionId: number, year: number, division: number, potId: number) => {
    const divisions = get().nlDivisions.get(competitionId)?.get(year);
    const divisionData = divisions?.get(division);
    return divisionData?.pots.get(potId) || [];
  }
}));