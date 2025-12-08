import { JSX } from "react";
import { MapIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function NavigationCard(): JSX.Element {
  const navigationSections = [
    {
      title: "Squads",
      items: ["Senior Squad", "U20 Squad", "U17 Squad"]
    },
    {
      title: "History",
      items: ["Competition History"]
    }
  ];

  return (
    <div className="bg-[#13131A] rounded-lg p-6 border border-gray-700 h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
        <MapIcon className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
          Navigation
        </h2>
      </div>
      
      <div className="space-y-6">
        {navigationSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-cyan-900/20 hover:bg-cyan-900/30 border border-cyan-700/50 rounded-lg transition-colors text-cyan-400 text-sm font-medium"
                >
                  <span>{item}</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}