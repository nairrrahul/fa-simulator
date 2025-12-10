import { FinalsCompetitionJSON } from 'src/common/competitions.interfaces';
import finalsCompInfo from '../data/competitions/final_competitions.json'  with { type: 'json' };
import nlCompInfo from '../data/competitions/nations_league.json'  with { type: 'json' };
import qualifiersCompInfo from '../data/competitions/qualifying_competitions.json'  with { type: 'json' };

const FINALS_JSON = finalsCompInfo as FinalsCompetitionJSON;

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
        return FINALS_JSON.competitions[competitionID].rounds[roundID].stageName;
      }
    case 1:
      //qualifiers
      return "";
    case 2:
      //nations league
      if(roundID == 1) {
        //placeholder
        return "League Phase";
      } else {
        return "Playoffs";
      }
    default:
      return "Invalid";
  }
}