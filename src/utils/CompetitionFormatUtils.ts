import finalsCompInfo from '../data/competitions/final_competitions.json'  with { type: 'json' };
import nlCompInfo from '../data/competitions/nations_league.json'  with { type: 'json' };
import qualifiersCompInfo from '../data/competitions/qualifying_competitions.json'  with { type: 'json' };

export function getFixtureSuffixForCompetition(
  competitionType: number,
  competitionID: number,
  roundID: number,
  groupID: number
) {
  switch(competitionType) {
    case 0:
      //final tournament
      if(roundID == 1) {
        return ""
      } else {
        return 
      }
      break;
    case 1:
      //qualifiers
      break;
    case 2:
      //nations league
      if(roundID == 1) {
        return "";
      } else {
        return "Playoffs";
      }
  }

  return "Invalid";
}