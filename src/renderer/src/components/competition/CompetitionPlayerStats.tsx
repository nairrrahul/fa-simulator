import { JSX } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function CompetitionPlayerStats(): JSX.Element {
  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide mb-4 cursor-pointer hover:text-cyan-300 transition-colors">
        PLAYER STATS <ChevronRightIcon className="w-4 h-4 inline" />
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">GOALS</h3>
          <p className="text-gray-500 text-sm text-center py-4">No match stats available</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">ASSISTS</h3>
          <p className="text-gray-500 text-sm text-center py-4">No match stats available</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">CLEAN SHEETS</h3>
          <p className="text-gray-500 text-sm text-center py-4">No match stats available</p>
        </div>
      </div>
    </div>
  );
}