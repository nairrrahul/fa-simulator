import { JSX } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CompetitionFixturesProps {
  competitionId: number;
  year: number;
}

export default function CompetitionFixtures({ competitionId, year }: CompetitionFixturesProps): JSX.Element {
  console.log(competitionId);
  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide cursor-pointer hover:text-cyan-300 transition-colors">
          FIXTURES/RESULTS <ChevronRightIcon className="w-4 h-4 inline" />
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-[#1E1E25] rounded transition-colors">
            <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-sm text-gray-300 min-w-[120px] text-center">
            Select Date
          </span>
          <button className="p-1 hover:bg-[#1E1E25] rounded transition-colors">
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-gray-500 text-sm text-center py-8">No fixtures assigned</p>
      </div>
    </div>
  );
}