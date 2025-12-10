export interface FinalsGroupStageOptions {
  displayOptions: Record<number, string>;
  numTeams: number;
  numThrough: number;
  numGroups: number;
  stageName: string;
  stageType: string;
  rankingWeight: number;
}

export interface FinalsKnockoutStageOptions {
  stageName: string;
  stageType: string;
  rankingWeight: number;
  numTeams: number;
}

type StageOptions = FinalsGroupStageOptions | FinalsKnockoutStageOptions;

export interface FinalsTournamentStruct {
  rounds: StageOptions[];
  drawYear: number;
  drawMonth: number;
  drawDay: number;
  startingDate: [number, number, number];
}

export interface FinalsCompetitionJSON {
  relativeYear: number;
  competitions: Record<number, FinalsTournamentStruct>;
}