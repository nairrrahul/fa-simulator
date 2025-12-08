import { JSX } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface WorldRankingCardProps {
  ranking: number;
  totalNations: number;
  onNavigate: () => void;
}

export default function WorldRankingCard({ ranking, totalNations, onNavigate }: WorldRankingCardProps): JSX.Element {
  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  return (
    <div 
      className="bg-[#13131A] rounded-lg p-6 border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
      onClick={onNavigate}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrophyIcon className="w-5 h-5 text-cyan-400" />
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          World Ranking
        </h2>
      </div>
      
      <div className="text-center py-2">
        <div className="text-6xl font-bold text-cyan-400">
          {ranking}
          <span className="text-3xl align-super">{getOrdinalSuffix(ranking)}</span>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          out of {totalNations} nations
        </div>
      </div>
    </div>
  );
}