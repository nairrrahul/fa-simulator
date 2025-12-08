import { Fixture, KOMapping } from "src/common/gameState.interfaces";

interface BracketOutput {
  bracketInfo: Fixture[];
  knockoutMatchMappings: KOMapping[];
}


function generateBalancedSeeds(P: number): number[] {
  if (P === 1) return [1];

  const half = P / 2;
  const prev = generateBalancedSeeds(half);

  const result: number[] = [];
  for (const seed of prev) {
    result.push(seed);
    result.push(P + 1 - seed);
  }
  return result;
}


export function generateBracketPositions(N: number) {
  const P = 1 << Math.ceil(Math.log2(N));

  const ordering = generateBalancedSeeds(P);

  const bracket = ordering.map((seed) => seed > N ? null : seed);

  return bracket;
}


function generateBracketFills(
  startID: number,
  roundID: number,
  competitionID: number,
  hasThird: boolean,
  matches: (number | null)[]
): BracketOutput {
  const bracketInfo: Fixture[] = [];
  const knockoutMatchMappings: KOMapping[] = [];
  
  // Calculate number of teams (excluding nulls which are byes)
  const numTeams = matches.filter(m => m !== null).length;
  
  // Find next power of 2 to determine bracket size
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numTeams)));
  
  // Calculate total rounds (excluding third place match)
  const totalRounds = Math.log2(bracketSize);
  
  let currentMatchID = startID;
  let currentRound = roundID;
  
  // Generate first round fixtures
  const firstRoundMatches: number[] = [];
  for (let i = 0; i < matches.length; i += 2) {
    const team1 = matches[i] ?? null;
    const team2 = matches[i + 1] ?? null;
    
    // Only create a match if at least one team exists
    if (team1 !== null || team2 !== null) {
      bracketInfo.push({
        id: currentMatchID,
        team1ID: team1,
        team2ID: team2,
        groupID: -1,
        roundID: currentRound,
        competitionID: competitionID,
        date: null,
        result: null
      });
      firstRoundMatches.push(currentMatchID);
      currentMatchID++;
    }
  }
  
  // Generate subsequent rounds
  let previousRoundMatches = firstRoundMatches;
  currentRound++;
  
  while (previousRoundMatches.length > 1) {
    const currentRoundMatches: number[] = [];
    
    for (let i = 0; i < previousRoundMatches.length; i += 2) {
      const match1ID = previousRoundMatches[i];
      const match2ID = previousRoundMatches[i + 1];
      
      // Check if either match has a bye (one team already filled)
      const match1 = bracketInfo.find(f => f.id === match1ID);
      const match2 = bracketInfo.find(f => f.id === match2ID);
      
      const match1HasBye = match1 && (match1.team1ID === null || match1.team2ID === null);
      const match2HasBye = match2 && (match2.team1ID === null || match2.team2ID === null);
      
      // Determine teams for this match
      let team1ID: number | null = null;
      let team2ID: number | null = null;
      let team1Source: number | null = null;
      let team2Source: number | null = null;
      
      // If match1 has a bye, the team advances directly
      if (match1HasBye && match1) {
        team1ID = match1.team1ID ?? match1.team2ID;
        team1Source = null;
      } else {
        team1Source = match1ID;
      }
      
      // If match2 has a bye, the team advances directly
      if (match2HasBye && match2) {
        team2ID = match2.team1ID ?? match2.team2ID;
        team2Source = null;
      } else {
        team2Source = match2ID;
      }
      
      bracketInfo.push({
        id: currentMatchID,
        team1ID: team1ID,
        team2ID: team2ID,
        groupID: -1,
        roundID: currentRound,
        competitionID: competitionID,
        date: null,
        result: null
      });
      
      knockoutMatchMappings.push({
        matchID: currentMatchID,
        team1MatchID: team1Source,
        team2MatchID: team2Source,
        isLoser: false
      });
      
      currentRoundMatches.push(currentMatchID);
      currentMatchID++;
    }
    
    previousRoundMatches = currentRoundMatches;
    currentRound++;
  }
  
  // Add third place match if needed
  if (hasThird && bracketInfo.length >= 2) {
    // Find the semi-final matches (second-to-last round)
    const semiFinalRound = currentRound - 2;
    const semiFinals = bracketInfo.filter(f => f.roundID === semiFinalRound);
    
    if (semiFinals.length === 2) {
      bracketInfo.push({
        id: currentMatchID,
        team1ID: null,
        team2ID: null,
        groupID: -1,
        roundID: currentRound - 1, // Same round as final
        competitionID: competitionID,
        date: null,
        result: null
      });
      
      knockoutMatchMappings.push({
        matchID: currentMatchID,
        team1MatchID: semiFinals[0].id,
        team2MatchID: semiFinals[1].id,
        isLoser: true
      });
    }
  }
  
  return {
    bracketInfo,
    knockoutMatchMappings
  };
}