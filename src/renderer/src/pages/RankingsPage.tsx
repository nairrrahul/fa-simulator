import { JSX, useMemo, useState } from "react";
import { useGameStore } from "../state/gameStore";
import RankRow from "../components/RankRow";
import FilterComponent, { FilterOption } from "../components/FilterComponent";
import confederations from "../../../data/confederations.json" with { type: "json" };

const CONFEDERATIONS = confederations as Record<string, { name: string; continent: string }>;

export default function RankingsPage(): JSX.Element {
  const nations = useGameStore(state => state.nations);
  
  // Initialize with all confederations selected (1-6, excluding 0 which is FIFA/World)
  const [selectedConfederations, setSelectedConfederations] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6])
  );
  
  // Create filter options from confederations (exclude FIFA/World)
  const filterOptions: FilterOption[] = useMemo(() => {
    return Object.entries(CONFEDERATIONS)
      .filter(([id]) => id !== "0") // Exclude FIFA
      .map(([id, conf]) => ({
        id: parseInt(id),
        label: conf.continent,
      }));
  }, []);
  
  // Filter and sort nations
  const rankedNations = useMemo(() => {
    // First, sort all nations by ranking points
    const allSorted = [...nations].sort((a, b) => b.rankingPts - a.rankingPts);
    
    // Add absolute rank to each nation
    const nationsWithRank = allSorted.map((nation, index) => ({
      ...nation,
      absoluteRank: index + 1
    }));
    
    // Filter based on selected confederations
    return nationsWithRank.filter(nation => 
      selectedConfederations.has(nation.confederationID)
    );
  }, [nations, selectedConfederations]);
  
  const handleToggle = (id: string | number) => {
    setSelectedConfederations(prev => {
      const newSet = new Set(prev);
      const numId = typeof id === 'string' ? parseInt(id) : id;
      
      if (newSet.has(numId)) {
        newSet.delete(numId);
      } else {
        newSet.add(numId);
      }
      
      return newSet;
    });
  };
  
  const handleToggleAll = () => {
    if (selectedConfederations.size === filterOptions.length) {
      // Deselect all
      setSelectedConfederations(new Set());
    } else {
      // Select all
      setSelectedConfederations(new Set(filterOptions.map(opt => opt.id as number)));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">World Rankings</h1>
        <FilterComponent
          title="Confederations"
          options={filterOptions}
          selectedIds={selectedConfederations}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />
      </div>
      
      <div className="bg-[#13131A] border border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 bg-[#1A1A22] border-b border-gray-700">
          <div className="text-sm font-semibold text-gray-400 uppercase">Rank</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Name</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Continent</div>
          <div className="text-sm font-semibold text-gray-400 uppercase">Points</div>
        </div>
        
        {/* Rankings List */}
        <div className="divide-y divide-gray-800">
          {rankedNations.length > 0 ? (
            rankedNations.map((nation) => (
              <RankRow 
                key={nation.id}
                rank={nation.absoluteRank}
                nationId={nation.id}
                name={nation.name}
                abbrev={nation.abbrev}
                confederationID={nation.confederationID}
                rankingPts={nation.rankingPts}
              />
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-400">
              No nations match the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}