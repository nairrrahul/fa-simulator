//---finals competitions---

export interface FinalsGroupStageStruct {
  stageName: string;
  stageType: StageTypes;
  rankingWeight: number;
  groupStageOptions: FinalsGroupStageOptions;
}

export interface FinalsGroupStageOptions {
  displayOptions: Record<string, string>;
  numTeams: number;
  numThrough: number;
  numGroups: number;
}

export interface FinalsKnockoutStageStruct {
  stageName: string;
  stageType: StageTypes;
  rankingWeight: number;
  numTeams: number;
}

type StageOptions = FinalsGroupStageStruct | FinalsKnockoutStageStruct;
type StageTypes = "GROUPSTAGEREG" | "GROUPSTAGEHA" | "KNOCKOUT" | "HOMEAWAY";

export interface FinalsTournamentStruct {
  rounds: StageOptions[];
  drawYear: number;
  drawMonth: number;
  drawDay: number;
  startingDate: number[];
}

export interface FinalsCompetitionJSON {
  relativeYear: number;
  competitions: Record<string, FinalsTournamentStruct>;
}

//---nations league---

export interface NationsLeagueOptionsStruct {
  numKO: number;
  numUp: number;
  numDown: number;
  displayOptions: Record<string, string | undefined>;
}

export interface NationsLeagueDivision {
  divisionName: string;
  stageType: StageTypes;
  numGroups: number;
  numTeams: number;
  rankingWeight: number;
  leagueOptions: NationsLeagueOptionsStruct;
}

export interface NationsLeagueKnockout {
  roundName: string;
  numTeams: number;
  rankingWeight: number;
  stageType: StageTypes;
}

export interface NationsLeagueCompetitionStruct {
  divisions: NationsLeagueDivision[];
  knockoutRounds: NationsLeagueKnockout[];
  drawYear: number;
  drawMonth: number;
  drawDay: number;
  groupWindows: number[][];
  knockoutWindow: number[];
}

export interface NationsLeagueJSON {
  relativeYear: number;
  competitions: Record<string, NationsLeagueCompetitionStruct>;
}