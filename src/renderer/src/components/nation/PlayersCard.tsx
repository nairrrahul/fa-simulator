import { JSX } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function PlayersCard(): JSX.Element {
  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700 h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
        <UserGroupIcon className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
          Players
        </h2>
      </div>
      
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p className="text-sm">No players available</p>
      </div>
    </div>
  );
}