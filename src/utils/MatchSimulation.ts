//workflow for match simulation
/**
 * Before Match: generate squads for match - starting 11 + substitutes
 * After Match:
 * 1. update player statistics
 * 2. update ranking points
 * 3. update fixture table
 */

interface GoalInfo {
  numGoals: number;
  goalList: [number, number][];
}

interface MatchResult {
  matchID: number;
  team1ID: number;
  team2ID: number;
  team1Goals: GoalInfo;
  team2Goals: GoalInfo;
  penalties: number[] | null;
}

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