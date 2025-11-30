export interface Nation {
  id: number;
  name: string;
  abbrev: string;
  rankingPts: number;
  confederationID: number;
  isFIFAMember: number;
  youthRating: number;
  gameState: number;
  primaryColor: string;
  secondaryColor: string;
}