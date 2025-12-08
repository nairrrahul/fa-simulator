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
  result: string | null;
}

export interface KOMapping {
  matchID: number;
  team1MatchID: number | null;
  team2MatchID: number | null;
  isLoser: boolean;
}