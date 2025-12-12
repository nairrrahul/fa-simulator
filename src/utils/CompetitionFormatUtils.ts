import { FinalsCompetitionJSON, FinalsGroupStageOptions, FinalsGroupStageStruct, NationsLeagueJSON } from 'src/common/competitions.interfaces';
import finalsCompInfo from '../data/competitions/final_competitions.json'  with { type: 'json' };
import nlCompInfo from '../data/competitions/nations_league.json'  with { type: 'json' };
import qualifiersCompInfo from '../data/competitions/qualifying_competitions.json'  with { type: 'json' };

const FINALS_JSON = finalsCompInfo as FinalsCompetitionJSON;
const NL_JSON = nlCompInfo as NationsLeagueJSON;

export function getFixtureSuffixForCompetition(
  competitionType: number | undefined,
  competitionID: number,
  roundID: number,
  groupID: number
) {
  switch(competitionType) {
    //final tournament
    case 0:
      if(roundID == 1) {
        //group stage
        return "Group " + String.fromCharCode(64 + groupID);
      } else {
        //knockouts
        return FINALS_JSON.competitions[competitionID].rounds[roundID-1].stageName;
      }
    case 1:
      //qualifiers
      return "";
    case 2:
      //nations league
      //we use roundID as a proxy for league when it comes to filtering

      
    default:
      return "Invalid";
  }
}

export function getRoundTypeByCompetition(competitionID, competitionType, roundID) {
  switch(competitionType) {
    //final tournament
    case 0:
      return FINALS_JSON.competitions[competitionID].rounds[roundID-1].stageType;
    case 1:
      //qualifiers
      return "GROUPSTAGEREG";
    case 2:
      //nations league
      return "GROUPSTAGEREG";
    default:
      return "GROUPSTAGEREG";
  }
}

export function getRoundNameByCompetition(competitionID, competitionType, roundID) {
  switch(competitionType) {
    //final tournament
    case 0:
      return FINALS_JSON.competitions[competitionID].rounds[roundID-1].stageName;
    case 1:
      //qualifiers
      return "Round One";
    case 2:
      //nations league
      return "League Phase";
    default:
      return "Invalid";
  }
}

export function getGroupDisplayOptions(competitionID, competitionType, roundID) {
  switch(competitionType) {
    //final tournament
    case 0:
      const competition = FINALS_JSON.competitions[competitionID];
      if(!competition.rounds[roundID-1].stageType.startsWith("GROUPSTAGE")) {
        return {};
      }
      return (FINALS_JSON.competitions[competitionID].rounds[roundID-1] as FinalsGroupStageStruct).groupStageOptions.displayOptions;
    case 1:
      //qualifiers
      return {};
    case 2:
      //nations league
      return {};
    default:
      return {};
  }
}