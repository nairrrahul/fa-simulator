import { Nation } from "src/common/gameState.interfaces";
import { shuffleArray } from "./RandomGen";


//in continental competitions, we generate pots based on world ranking
//however, we need to ensure that hosts are always in pot 1
//if there are no hosts (e.g. for qualifying), then it'll just be empty
export function generateContinentalPots(hosts: Nation[], qualifierTeams: Nation[], numPots: number): Nation[][] { 
  const orderedNations = qualifierTeams.sort((a, b) => a.rankingPts - b.rankingPts);
  const fullRankingNations  = [...hosts, ...orderedNations];
  const pots: Nation[][] = Array.from({ length: numPots }, (_, i) => fullRankingNations.slice(i * numPots, (i + 1) * numPots)); 
  return pots;
}

//for continental competitions, we do not need to worry about confederation requirements
export function generateContinentalGroups(pots: Nation[][]): Record<number, Nation[]> {
  //number of groups is equal to number of teams in pot 1 
  const numGroups = pots[0].length;
  const groups: Record<number, Nation[]> = {};
  for(let i = 0; i < numGroups; i++) {
    let potsRandOrder = shuffleArray(pots[i]);
    for(let j = 0; j < potsRandOrder.length; j++) {
      if(!(i in groups)){
        groups[i] = [potsRandOrder[j]];
      } else {
        groups[i].push(potsRandOrder[j]);
      }
    }
  }
  return groups;
}
