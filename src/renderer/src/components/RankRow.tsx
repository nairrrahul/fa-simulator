import FlagCard from "./FlagCard";
import confederations from "../../../data/confederations.json" with { type: "json" };
import { JSX } from "react";

interface RankRowProps {
  rank: number;
  name: string;
  abbrev: string;
  confederationID: number;
  rankingPts: number;
}

const CONFEDERATIONS = confederations as Record<string, { name: string; continent: string }>;

export default function RankRow({ 
  rank, 
  name, 
  abbrev, 
  confederationID, 
  rankingPts 
}: RankRowProps): JSX.Element {
  
  const continent = CONFEDERATIONS[confederationID.toString()]?.continent || "Unknown";
  const roundedPoints = Math.round(rankingPts);
  
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 hover:bg-[#1A1A22] transition-colors">
      {/* Rank */}
      <div className="flex items-center">
        <span className="text-gray-300 font-medium w-12">{rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}</span>
      </div>
      
      {/* Flag + Country Name */}
      <div className="flex items-center gap-3">
        <FlagCard countryName={abbrev} />
        <span className="text-gray-200 font-medium">{name}</span>
      </div>
      
      {/* Continent */}
      <div className="flex items-center justify-end min-w-[150px]">
        <span className="text-gray-400">{continent}</span>
      </div>
      
      {/* Points */}
      <div className="flex items-center justify-end min-w-[80px]">
        <span className="text-gray-200 font-semibold">{roundedPoints.toLocaleString()}</span>
      </div>
    </div>
  );
}