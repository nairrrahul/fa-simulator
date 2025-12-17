import { FinalsCompetitionJSON, QualifyingStageJSON, FinalsGroupStageStruct, NationsLeagueJSON } from 'src/common/competitions.interfaces';
import finalsCompInfo from '../data/competitions/final_competitions.json'  with { type: 'json' };
import nlCompInfo from '../data/competitions/nations_league.json'  with { type: 'json' };
import qualifiersCompInfo from '../data/competitions/qualifying_competitions.json'  with { type: 'json' };
import { GameDate } from 'src/common/gameState.interfaces';

const FINALS_JSON = finalsCompInfo as FinalsCompetitionJSON;
const NL_JSON = nlCompInfo as NationsLeagueJSON;
const QUAL_JSON = qualifiersCompInfo as QualifyingStageJSON;

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
      for(let i=0; i<QUAL_JSON.competitions[competitionID].rounds.length; i++) {
        if(QUAL_JSON.competitions[competitionID].rounds[i].startingRoundId === roundID) {
          return QUAL_JSON.competitions[competitionID].rounds[i].stageName;
        }
      }
      return "Unknown";
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
      for(let i=0; i<QUAL_JSON.competitions[competitionID].rounds.length; i++) {
        if(QUAL_JSON.competitions[competitionID].rounds[i].startingRoundId === roundID) {
          return QUAL_JSON.competitions[competitionID].rounds[i].stageType;
        }
      }
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
        day: QUAL_JSON.competitions[competitionID].rounds[0].drawDate,
        month: QUAL_JSON.competitions[competitionID].rounds[0].drawMonth,
        year: year
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

export function getYearDrawDays(year: number, competitionPeriodicities: Map<number, number>) {
  //finals comps
  const finalsDrawDays = Object.entries(FINALS_JSON.competitions).filter(([compID, compData]) => {
    const competitionPeriodicity = competitionPeriodicities.get(Number(compID))!;
    return (year - compData.drawYear) % competitionPeriodicity === 0;
  }).map(([compID, compData]) => {
    return {
      compID: Number(compID),
      roundName: null,
      day: compData.drawDay,
      month: compData.drawMonth,
      year: year
    };
  });

  //nations league comps
  const nationsLeagueDraws = Object.entries(NL_JSON.competitions).flatMap(([compID, compData]) => {
    const competitionPeriodicity = competitionPeriodicities.get(Number(compID))!;
    const draws: {compID: number, roundName: string | null, day: number, month: number, year: number}[] = [];

    // Main draw
    if ((year - compData.drawYear) % competitionPeriodicity === 0) {
      draws.push({
        compID: Number(compID),
        roundName: null,
        day: compData.drawDay,
        month: compData.drawMonth,
        year: year
      });
    }

    // Knockout draw
    if ((year - compData.knockoutDrawYear) % competitionPeriodicity === 0) {
      draws.push({
        compID: Number(compID),
        roundName: "Playoffs",
        day: compData.knockoutDrawDay,
        month: compData.knockoutDrawMonth,
        year: year,
      });
    }
    return draws;
  });

  //will deal with qualifiers later

  const qualifiersDraws = Object.entries(QUAL_JSON.competitions).flatMap(([compID, compData]) => {
    const competitionPeriodicity = competitionPeriodicities.get(Number(compID))!;
    const draws: {compID: number, roundName: string | null, day: number, month: number, year: number}[] = [];
    compData.rounds.forEach((round) => {
      if((year - round.drawYear) % competitionPeriodicity === 0) {
        draws.push({
          compID: Number(compID),
          roundName: round.stageName,
          day: round.drawDate,
          month: round.drawMonth,
          year: year,
        });
      }   
    });
    return draws;
  });

  console.log("Q Draw Days:", qualifiersDraws);

  return [...finalsDrawDays, ...nationsLeagueDraws, ...qualifiersDraws];
}