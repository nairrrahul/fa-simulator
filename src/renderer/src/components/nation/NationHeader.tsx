import { JSX } from "react";
import { Nation } from "src/common/gameState.interfaces";
import FlagCard from "../FlagCard";

interface NationHeaderProps {
  nation: Nation;
  confederationInfo: string;
}

export default function NationHeader({ nation, confederationInfo }: NationHeaderProps): JSX.Element {
  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700 h-full">
      <div className="flex items-start gap-6">
        {/* Flag */}
        <div className="flex-shrink-0">
          <FlagCard 
            countryName={nation.abbrev} 
            cssClasses="w-32 h-24 object-cover:text-6xl" 
          />
        </div>

        {/* Nation Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            {nation.name}
          </h1>
          <p className="text-lg text-gray-400 mb-6">
            {nation.abbrev} • {confederationInfo}
          </p>

          {/* Manager and Captain */}
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 font-medium">Manager: </span>
              <span className="text-gray-300">[]</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 font-medium">Captain: </span>
              <span className="text-gray-300">[]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}