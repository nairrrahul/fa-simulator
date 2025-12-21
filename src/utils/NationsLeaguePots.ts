import { NLDivisionData } from "src/common/gameState.interfaces";

//NL rankings are needed for determining progression to qualifier playoffs or final tournament
//nlStage is a divisionID: divisionData mapping
export function computeNLRanking(nlState: Map<number, NLDivisionData>, compID: number, compCase: "CONTI" | "WC"): number[] {

  // Helper function to safely get teams from a specific division and pot
  const getTeamsFromPot = (division: number, pot: number): number[] => {
    return nlState.get(division)?.pots.get(pot) || [];
  };

  // Helper function to safely get all teams from a division
  const getAllTeamsInDivision = (division: number): number[] => {
    return nlState.get(division)?.teams || [];
  };

  switch(compCase) {
    case "CONTI":
      switch(compID) {
        case 7:
          const l1p1 = getTeamsFromPot(1, 1);
          const l1p4 = getTeamsFromPot(1, 4);
          const l1p2 = getTeamsFromPot(1, 2);
          const l1p3 = getTeamsFromPot(1, 3);
          const l2p2 = getTeamsFromPot(2, 2);
          const l2p4 = getTeamsFromPot(2, 4);
          return [
            ...l1p1,
            ...l1p4,
            ...l1p2,
            ...l1p3,
            ...l2p2,
            ...l2p4
          ];
        case 8:
          return [];
        default:
          return [];
      }
    case "WC":
      switch(compID) {
        case 7:
          return [];
        case 8:

          // 1. Collect the specifically ordered pots
          const l1p1 = getTeamsFromPot(1, 1);
          const l1p4 = getTeamsFromPot(1, 4);
          const l2p4 = getTeamsFromPot(2, 4);
          const l3p4 = getTeamsFromPot(3, 4);

          const priorityTeams = [
            ...l1p1,
            ...l1p4,
            ...l2p4,
            ...l3p4,
          ];

          // 2. Collect the remaining teams from each division
          const l1Rest = getAllTeamsInDivision(1).filter(
            (teamId) => !l1p1.includes(teamId) && !l1p4.includes(teamId)
          );

          const l2Rest = getAllTeamsInDivision(2).filter(
            (teamId) => !l2p4.includes(teamId)
          );

          const l3Rest = getAllTeamsInDivision(3).filter(
            (teamId) => !l3p4.includes(teamId)
          );
          
          // 3. Collect all teams from the last division
          const l4Teams = getAllTeamsInDivision(4);

          // 4. Combine all team ID arrays in the specified order
          return [
            ...priorityTeams,
            ...l1Rest,
            ...l2Rest,
            ...l3Rest,
            ...l4Teams,
          ];
        default:
          return [];
      }
    default:
      return [];
  }
}

export function determineNLPlayoffTeams(compID: number, numHosts: number, nlOrder: number[]) {

}