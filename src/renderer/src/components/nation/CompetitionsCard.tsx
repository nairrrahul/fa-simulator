import { JSX } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { Competition } from "src/common/gameState.interfaces";

interface CompetitionsCardProps {
  competitions: Competition[];
}

export default function CompetitionsCard({ competitions }: CompetitionsCardProps): JSX.Element {
  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700 h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
        <TrophyIcon className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
          Confederation Competitions
        </h2>
      </div>
      
      <div className="space-y-2">
        {competitions.length > 0 ? (
          competitions.map((competition) => (
            <button
              key={competition.id}
              className="w-full text-left px-4 py-3 bg-[#1E1E25] hover:bg-[#2A2A35] border border-gray-700 rounded-lg transition-colors text-gray-200 text-sm font-medium"
            >
              {competition.name}
            </button>
          ))
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <p className="text-sm">No competitions available</p>
          </div>
        )}
      </div>
    </div>
  );
}