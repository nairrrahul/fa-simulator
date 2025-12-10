export interface FinalsGroupStageStruct {
  stageName: string;
  stageType: string;
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
  stageType: string;
  rankingWeight: number;
  numTeams: number;
}

type StageOptions = FinalsGroupStageStruct | FinalsKnockoutStageStruct;

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