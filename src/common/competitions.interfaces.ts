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
  relativeYear: number;
  divisions: NationsLeagueDivision[];
  knockoutRounds: NationsLeagueKnockout[];
  drawYear: number;
  drawMonth: number;
  drawDay: number;
  groupWindows: number[][];
  knockoutDrawDay: number;
  knockoutDrawMonth: number;
  knockoutDrawYear: number;
  knockoutWindow: number[];
}

export interface NationsLeagueJSON {
  competitions: Record<string, NationsLeagueCompetitionStruct>;
}

//---qualifiers---

export interface QualifyingStageJSON {
  competitions: Record<string, QualifyingStageStruct>;
}


export interface QualifyingStageStruct {
  hostAutoQual: boolean
  fifaMemberRequired: boolean;
  relativeYear: number;
  rounds: QualsStageOptions[];
}

type QualsStageOptions = HomeAwayQualsRound | GroupStageQualsRound | PlayoffQualsRound;

export interface HomeAwayQualsRound {
  startingRoundId: number;
  stageName: string;
  stageType: StageTypes
  rankingWeight: number;
  drawDate: number;
  drawMonth: number;
  drawYear: number;
  windows: number[][];
  progOptions: HomeAwayProgOptions;
}

export interface HomeAwayProgOptions {
  numTeamsIn: number;
  teamsOut: HomeAwayTeamsOut[];
}

export interface HomeAwayTeamsOut {
  numTeams: number;
  compId: number;
  roundId: number;
}

export interface GroupStageQualsRound {
  startingRoundId: number;
  stageName: string;
  stageType: StageTypes;
  rankingWeight: number;
  drawDate: number;
  drawMonth: number;
  drawYear: number;
  mandatoryWindows: number[][];
  optionalWindows: number[][];
  progOptions: GroupStageProgOptions;
}

export interface GroupStageProgOptions {
  numTeamsIn: number;
  numBaseGroups: number[];
  displayOptions: Record<string, string | undefined>;
  teamsOut: GroupStageTeamsOut[];
}

export interface GroupStageTeamsOut {
  numOutputTeams: number[];
  compId: number;
  roundId: number;
}

export interface PlayoffQualsRound {
  startingRoundId: number
  stageName: string;
  stageType: StageTypes;
  rankingWeight: number;
  drawDate: number;
  drawMonth: number;
  drawYear: number;
  windows: number[][];
  progOptions: PlayoffProgOptions;
}

export interface PlayoffProgOptions {
  numTeamsIn: number;
  hostOffsetPaths: number[];
  teamsOut: PlayoffTeamsOut[];
}

export interface PlayoffTeamsOut {
  compId: number;
  roundId: number;
}