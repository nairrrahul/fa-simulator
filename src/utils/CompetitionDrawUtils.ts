import { CompetitionGroup, Fixture, Nation } from "src/common/gameState.interfaces";
import { shuffleArray } from "./RandomGen";

import finalsCompInfo from '../data/competitions/final_competitions.json'  with { type: 'json' };
import nlCompInfo from '../data/competitions/nations_league.json'  with { type: 'json' };
import qualifiersCompInfo from '../data/competitions/qualifying_competitions.json'  with { type: 'json' };
import windowDates from '../data/competitions/confederation_windows.json'  with { type: 'json' };
import optionalWindowDates from '../data/competitions/optional_windows.json'  with { type: 'json' };
import { FinalsCompetitionJSON, GroupStageQualsRound, HomeAwayQualsRound, NationsLeagueCompetitionStruct, NationsLeagueJSON, QualifyingStageJSON } from "../common/competitions.interfaces";
import { getRoundInfoForCompetition } from "./CompetitionFormatUtils";

const FINALS_JSON = finalsCompInfo as FinalsCompetitionJSON;
const NL_JSON = nlCompInfo as NationsLeagueJSON;
const QUAL_JSON = qualifiersCompInfo as QualifyingStageJSON;
const WINDOW_DATES = windowDates as Record<string, Record<string, number[]>>;
const OPTIONAL_WINDOWS = optionalWindowDates as Record<string, Record<string, number>>;

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
  const numPots = pots.length;
  const groups: Record<number, Nation[]> = {};
  for(let i = 0; i < numPots; i++) {
    let potsRandOrder = shuffleArray(pots[i]);
    for(let j = 0; j < potsRandOrder.length; j++) {
      if(!(j in groups)){
        groups[j] = [potsRandOrder[j]];
      } else {
        groups[j].push(potsRandOrder[j]);
      }
    }
  }
  return groups;
}

//for UEFA, we need to take a slightly less generalized approach, where teams in the NL playoffs cannot be in 5-team groups.
export function generateUEFAQualGroups(pots:Nation[][], nlTeams: Nation[]): Record<number, Nation[]> {
  //number of groups is equal to number of teams in pot 1 
  const numPots = pots.length;
  const totalGroups = new Set([...Array(pots[0].length)].map((_, i) => i + 1));
  const nlTeamGroupIDs = new Set();
  const groups: Record<number, Nation[]> = {};
  let finalPotAddGroups: number[] = [];
  for(let i = 0; i < numPots; i++) {
    let potsRandOrder = shuffleArray(pots[i]);
    if(i == numPots - 1) {
      finalPotAddGroups = [...totalGroups];
    }

    for(let j = 0; j < potsRandOrder.length; j++) {

      if(!(i in groups)){
        groups[j] = [potsRandOrder[j]];
      } else {
        //we want to check that we're not putting our bottom pot teams in groups with NL teams in them
        if(i == numPots - 1)
          groups[finalPotAddGroups[j]].push(potsRandOrder[j]);
        else
          groups[j].push(potsRandOrder[j]);
      }

      //nl teams will always be in pot ID == 1
      if(nlTeams.includes(potsRandOrder[j])) {
        nlTeamGroupIDs.add(j);
        totalGroups.delete(j);
      }
    }
  }
  return groups;
}

export function formatGroups(groups: Record<number, Nation[]>, compId: number, year: number, roundId: number): CompetitionGroup[] {
  const formattedGroups: CompetitionGroup[] = [];
  for(const [groupId, nations] of Object.entries(groups)) {
    for(const nation of nations) {
      formattedGroups.push({
        competitionID: compId,
        year: year,
        groupID: parseInt(groupId),
        teamID: nation.id,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        roundID: roundId
      });
    }
  }
  return formattedGroups;
}

export function generateHomeAwayPairs(teams: Nation[]): [Nation, Nation][] {
  //we can assume team len is == 2
  teams.sort((a, b) => a.rankingPts - b.rankingPts);
  const mid = Math.ceil(teams.length / 2);
  const firstHalf = shuffleArray(teams.slice(0, mid));
  const secondHalf = shuffleArray(teams.slice(mid));

  const pairs: [Nation, Nation][] = [];
  for (let i = 0; i < firstHalf.length; i++) {
    pairs.push([firstHalf[i], secondHalf[secondHalf.length - 1 - i]]);
  }
  return pairs;

}


export function generateHomeAwayFixtures(pairs: [Nation, Nation][], compId: number, year: number, roundId: number): Fixture[] {
  const fixtures: Fixture[] = [];
  // get window
  const roundInfo = getRoundInfoForCompetition(compId, 2, roundId) as HomeAwayQualsRound;
  const window = roundInfo.windows[0];
  // check confederation ID of all teams
  const allConfedsSame = pairs.flat().every(team => team.confederationID === pairs[0][0].confederationID);
  let dates: number[][] = [];
  // if all from same confed, get window dates from confed, else use FIFA window dates
  if(allConfedsSame) {
    let initDates = WINDOW_DATES[pairs[0][0].confederationID.toString()][window[0].toString()];
    dates = [[initDates[0], window[0], year], [initDates[1], window[0], year]];
  } else {
    let initDates = WINDOW_DATES["0"][window[0].toString()];
    dates = [[initDates[0], window[0], year], [initDates[1], window[0], year]];
  }
  // generate pairs of fixtures with each pair in pairs
  for(const [teamA, teamB] of pairs) {
    // first leg
    fixtures.splice(0, 0, {
      id: -1,
      team1ID: teamA.id,
      team2ID: teamB.id,
      competitionID: compId,
      groupID: -1,
      roundID: roundId,
      date: `${dates[0][0]}-${dates[0][1]}-${dates[0][2]}`,
      scoreline: null,
      outcome: null
    });
    //second leg
    fixtures.push({
      id: -1,
      team1ID: teamB.id,
      team2ID: teamA.id,
      competitionID: compId,
      groupID: -1,
      roundID: roundId,
      date: `${dates[1][0]}-${dates[1][1]}-${dates[1][2]}`,
      scoreline: null,
      outcome: null
    });
  }

  const retFixtures = fixtures.map((fixture, index) => ({
    ...fixture,
    id: index + 1 //assign unique IDs starting from 1, this will function as our increment count when we add to state
  }));

  return retFixtures;
}

export function getQNLGroupWindows(teamsInGroup: number, compId: number, compType: number, roundId: number, year: number): number[][] {
  if(compType == 1) {
    const roundInfo = getRoundInfoForCompetition(compId, teamsInGroup, roundId) as GroupStageQualsRound;
    const relativeYear = QUAL_JSON[compId.toString()].relativeYear;
    const indexToAccess = OPTIONAL_WINDOWS[compId.toString()][teamsInGroup.toString()];
    const mandatoryWindows = roundInfo.mandatoryWindows;
    const optionalWindowsToAdd = roundInfo.optionalWindows.slice(0, indexToAccess+1);
    const windows: number[][] = [...mandatoryWindows, ...optionalWindowsToAdd];
    const retWindows = windows.map(window => [window[0], window[1] + (year - relativeYear)]);
    return retWindows;
  } else {
    const nlInfo = NL_JSON[compId.toString()] as NationsLeagueCompetitionStruct;
    const relativeYear = nlInfo.relativeYear;
    const windows = nlInfo.groupWindows;
    const retWindows = windows.map(window => [window[0], window[1] + (year - relativeYear)]);
    return retWindows;
  }
}

export function generateGroupFixtures(group: CompetitionGroup[], compId: number, returnEnabled: boolean) : Record<number,Fixture[]> {
  const teamsInGroup: number[] = group.map(g => g.teamID);
  if(teamsInGroup.length % 2 == 1) {
    teamsInGroup.push(-1); //add dummy team to make it even
  }

  const fixtures: Record<number,Fixture[]> = {};
  const iterations = returnEnabled ? 2*(teamsInGroup.length - 1) : teamsInGroup.length - 1;
  const half = Math.floor(teamsInGroup.length / 2);

  for(let i = 0; i < iterations; i++) {
    
    if(i < teamsInGroup.length - 1) {
      let matchups: Fixture[] = [];
      for(let j = 0; j < half; j++) {
        let team1 = teamsInGroup[j];
        let team2 = teamsInGroup[teamsInGroup.length - 1 - j];
        if(team1 != -1 && team2 != -1) {
          matchups.push({
            id: -1,
            team1ID: team1,
            team2ID: team2,
            competitionID: compId,
            groupID: group[0].groupID,
            roundID: group[0].roundID,
            date: "",
            scoreline: null,
            outcome: null
          })
        }
      }
      fixtures[i] = matchups;
      const cycleOut = teamsInGroup.pop();
      teamsInGroup.splice(1, 0, cycleOut!)
    } else {
      fixtures[i] = fixtures[i - teamsInGroup.length + 1].map(fixture => ({
        ...fixture,
        team1ID: fixture.team2ID,
        team2ID: fixture.team1ID
      }));
    }
    
  }

  let initIdx = 1;
  const retFixtures: Record<number,Fixture[]> = {};
  for(const [key, value] of Object.entries(fixtures)) {
    retFixtures[parseInt(key)] = value.map(fixture => ({
      ...fixture,
      id: initIdx++
    }));
  }

  return retFixtures;
}

export function assignDatesToQNLGroupFixtures(fixtures: Fixture[], compType: number, year: number): Fixture[] {
  return fixtures;
}