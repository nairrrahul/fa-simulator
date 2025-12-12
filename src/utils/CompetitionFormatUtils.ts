import { FinalsCompetitionJSON, FinalsGroupStageOptions, FinalsGroupStageStruct, NationsLeagueJSON } from 'src/common/competitions.interfaces';
import finalsCompInfo from '../data/competitions/final_competitions.json'  with { type: 'json' };
import nlCompInfo from '../data/competitions/nations_league.json'  with { type: 'json' };
import qualifiersCompInfo from '../data/competitions/qualifying_competitions.json'  with { type: 'json' };
import { GameDate } from 'src/common/gameState.interfaces';

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
      const numGroups = NL_JSON.competitions[competitionID].divisions.length;
      if(numGroups <= roundID) {
        //then we are in group stage
        return NL_JSON.competitions[competitionID].divisions[roundID-1].divisionName +
        " Group " + String.fromCharCode(64 + groupID);
      } else {
        const newIdx = roundID - numGroups - 1;
        return NL_JSON.competitions[competitionID].knockoutRounds[newIdx].roundName;
      }
      
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
      const numGroups = NL_JSON.competitions[competitionID].divisions.length;
      if(numGroups <= roundID) {
        //then we are in group stage
        return NL_JSON.competitions[competitionID].divisions[roundID-1].stageType;
      } else {
        const newIdx = roundID - numGroups - 1;
        return NL_JSON.competitions[competitionID].knockoutRounds[newIdx].stageType;
      }
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
      const numGroups = NL_JSON.competitions[competitionID].divisions.length;
      if(numGroups <= roundID) {
        //then we are in group stage
        return NL_JSON.competitions[competitionID].divisions[roundID-1].divisionName;
      } else {
        const newIdx = roundID - numGroups - 1;
        return NL_JSON.competitions[competitionID].knockoutRounds[newIdx].roundName;
      }
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
      const numGroups = NL_JSON.competitions[competitionID].divisions.length;
      if(numGroups <= roundID) {
        //then we are in group stage
        return NL_JSON.competitions[competitionID].divisions[roundID-1].leagueOptions.displayOptions;
      } else {
        return {};
      };
    default:
      return {};
  }
}



export function getCompetitionDrawDate(competitionID, competitionType, year): GameDate {

  switch(competitionType) {
    //final tournament
    case 0:
      return {
        day: FINALS_JSON.competitions[competitionID].drawDay,
        month: FINALS_JSON.competitions[competitionID].drawMonth,
        year: year
      };
    case 1:
      //qualifiers
      return {
        day: 0,
        month: 0,
        year: 0
      };
    case 2:
      //nations league
      return {
        day: NL_JSON.competitions[competitionID].drawDay,
        month: NL_JSON.competitions[competitionID].drawMonth,
        year: year
      };
    default:
      return {
        day: 0,
        month: 0,
        year: 0
      };
  }
}

export const getMonthName = (month: number) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  };