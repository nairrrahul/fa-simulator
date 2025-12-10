//workflow for match simulation
/**
 * Before Match: generate squads for match - starting 11 + substitutes
 * After Match:
 * 1. update player statistics
 * 2. update player states (injuries, suspensions)
 * 3. update ranking points
 * 4. update fixture table
 */

import { MatchResult } from "src/common/gameState.interfaces";





export function basicGeneration(
  squad1: number,
  squad2: number,
  isKO: boolean,
  matchID: number
) : MatchResult {
    return {
    matchID: matchID,
    team1ID: squad1,
    team2ID: squad2,
    team1Goals: {
      numGoals: 0,
      goalList: []
    },
    team2Goals: {
      numGoals: 0,
      goalList: []
    },
    penalties: null
  };
}