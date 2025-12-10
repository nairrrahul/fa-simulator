export interface Nation {
  id: number;
  name: string;
  abbrev: string;
  rankingPts: number;
  confederationID: number;
  isFIFAMember: number;
  youthRating: number;
  gameState: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface Fixture {
  id: number;
  team1ID: number | null;
  team2ID: number | null;
  groupID: number;
  roundID: number;
  competitionID: number;
  date: string | null;
  scoreline: string | null;
  outcome: number | null;
}

export interface Competition {
  id: number;
  name: string;
  confederationID: number;
  curCycle: number;
  periodicity: number;
  competitionType: number;
  hostPrevCycles: number;
  parentCompetition: number;
}

export interface KOMapping {
  matchID: number;
  team1MatchID: number | null;
  team2MatchID: number | null;
  isLoser: boolean;
}

export interface GameDate {
  year: number;
  month: number;
  day: number;
}

export interface GoalInfo {
  numGoals: number;
  goalList: [number, number][];
}

export interface MatchResult {
  matchID: number;
  team1ID: number;
  team2ID: number;
  team1Goals: GoalInfo;
  team2Goals: GoalInfo;
  penalties: number[] | null;
}

// ------- competition storage info -----------

export interface CompetitionGroup {
  competitionID: number;
  year: number;
  groupID: number;
  teamID: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  roundID: number;
}

export interface CompetitionHost {
  competitionID: number;
  year: number;
  hostID: number;
}

export interface CompetitionSnapshot {
  competitionID: number;
  year: number;
  firstID: number;
  secondID: number;
  thirdID: number | null;
  fourthID: number | null;
  goldenBallPlayerID: number | null;
  goldenBootPlayerID: number | null;
}

// Helper types for organizing competition data
export interface CompetitionYearData {
  year: number;
  hosts: number[];
  groups: Map<number, CompetitionGroup[]>; 
  snapshot: CompetitionSnapshot | null;
}