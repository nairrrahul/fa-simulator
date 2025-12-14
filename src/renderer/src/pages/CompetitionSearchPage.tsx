import { JSX, useState, useEffect, useRef, useMemo } from "react";
import { useGameStore } from "@renderer/state/gameStore";
import { Competition } from "src/common/gameState.interfaces";
import { MagnifyingGlassIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

type SearchMode = "name" | "dropdown";

export default function CompetitionSearchPage(): JSX.Element {
  const navigate = useNavigate();
  const { competitions, getAvailableYearsForCompetition, gameDate } = useGameStore();
  const [searchMode, setSearchMode] = useState<SearchMode>("name");
  
  // Name search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Dropdown search state
  const [dropdownCompetition, setDropdownCompetition] = useState<number | null>(null);
  const [dropdownYear, setDropdownYear] = useState<number | null>(null);
  
  // Get all searchable competitions (exclude Friendly with type -1)
  const searchableCompetitions = useMemo(() => {
    return Array.from(competitions.values())
      .filter(c => c.competitionType >= 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [competitions]);
  
  // Get available years for selected dropdown competition
  const availableYears = useMemo(() => {
    if (dropdownCompetition == null) return [];
    return getAvailableYearsForCompetition(dropdownCompetition).filter(y => y >= 2026);;
  }, [dropdownCompetition, getAvailableYearsForCompetition]);
  
  // Filter competitions based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCompetitions([]);
      setShowDropdown(false);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const matches = searchableCompetitions.filter(comp =>
      comp.name.toLowerCase().includes(query)
    );
    
    setFilteredCompetitions(matches.slice(0, 10));
    setShowDropdown(matches.length > 0);
  }, [searchQuery, searchableCompetitions]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Reset year when competition changes
  useEffect(() => {
    setDropdownYear(null);
  }, [dropdownCompetition]);
  
  const handleSelectCompetition = (comp: Competition) => {
    setSelectedCompetition(comp);
    setSearchQuery(comp.name);
    setShowDropdown(false);
  };
  
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (selectedCompetition && value !== selectedCompetition.name) {
      setSelectedCompetition(null);
    }
  };
  
  const handleNameSearchGo = () => {
    if (selectedCompetition) {
      // Find closest year to current game year, rounding down
      const availableYears = getAvailableYearsForCompetition(selectedCompetition.id)
        .filter(y => y >= 2026);
      
      if (availableYears.length === 0) return;
      
      // Find closest year <= current year, or smallest year if all are > current
      const currentYear = gameDate.year;
      const closestYear = availableYears
        .filter(y => y <= currentYear)
        .sort((a, b) => b - a)[0] || availableYears.sort((a, b) => a - b)[0];
      if(selectedCompetition.competitionType === 0)
        navigate(`/competition/finals/${selectedCompetition.id}/${closestYear}`);
      else if(selectedCompetition.competitionType == 2)
        navigate(`/competition/nations-league/${selectedCompetition.id}/${closestYear}`);
    }
  };
  
  const handleDropdownSearchGo = () => {
    const comp = competitions.get(dropdownCompetition!);
    if (dropdownCompetition != null && dropdownYear && comp) {
      if(comp.competitionType == 0)
        navigate(`/competition/finals/${dropdownCompetition}/${dropdownYear}`);
      else if(comp.competitionType == 2)
        navigate(`/competition/nations-league/${dropdownCompetition}/${dropdownYear}`);
    }
  };
  
  const getCompetitionTypeLabel = (type: number) => {
    switch (type) {
      case 0: return "Finals";
      case 1: return "Qualifiers";
      case 2: return "Nations League";
      default: return "Unknown";
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-[#13131A] rounded-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
          <TrophyIcon className="w-8 h-8 text-cyan-400" />
          Competition Search
        </h1>
        <p className="text-gray-400 mb-8">
          Search for competitions to view detailed information and results
        </p>
        
        {/* Tab Selection */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setSearchMode("name")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              searchMode === "name"
                ? "text-cyan-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Search by Name
            {searchMode === "name" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setSearchMode("dropdown")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              searchMode === "dropdown"
                ? "text-cyan-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Search by Competition & Year
            {searchMode === "dropdown" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        </div>
        
        {/* Search by Name */}
        {searchMode === "name" && (
          <div className="space-y-4">
            <div className="relative">
              <label
                htmlFor="competition-search"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Competition Name
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    id="competition-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                      if (filteredCompetitions.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    placeholder="e.g. World Cup, Euro, Copa América..."
                    className="w-full px-4 py-3 bg-[#1E1E25] border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showDropdown && filteredCompetitions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 bg-[#1E1E25] border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                      {filteredCompetitions.map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => handleSelectCompetition(comp)}
                          className="px-4 py-3 hover:bg-[#2A2A35] cursor-pointer border-b border-gray-700 last:border-b-0"
                        >
                          <div className="text-gray-100 font-medium">
                            {comp.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {getCompetitionTypeLabel(comp.competitionType)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleNameSearchGo}
                  disabled={!selectedCompetition || selectedCompetition.competitionType % 2 != 0}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${
                    selectedCompetition && selectedCompetition.competitionType % 2 == 0
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                  title={selectedCompetition && selectedCompetition.competitionType % 2 != 0 ? "Only finals competitions supported" : ""}
                >
                  Go
                </button>
              </div>
            </div>
            
            {/* Selected Competition Display */}
            {selectedCompetition && (
              <div className="bg-[#1E1E25] rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-100">
                      {selectedCompetition.name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {getCompetitionTypeLabel(selectedCompetition.competitionType)}
                    </div>
                  </div>
                  <MagnifyingGlassIcon className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Search by Dropdown */}
        {searchMode === "dropdown" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Competition Dropdown */}
              <div>
                <label
                  htmlFor="competition-dropdown"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Competition
                </label>
                <select
                  id="competition-dropdown"
                  value={dropdownCompetition ?? ""}
                  onChange={(e) => setDropdownCompetition(Number(e.target.value) ?? null)}
                  className="w-full px-4 py-3 bg-[#1E1E25] border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Select a competition...</option>
                  {searchableCompetitions.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Year Dropdown */}
              <div>
                <label
                  htmlFor="year-dropdown"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Year
                </label>
                <select
                  id="year-dropdown"
                  value={dropdownYear ?? ""}
                  onChange={(e) => setDropdownYear(Number(e.target.value) || null)}
                  disabled={dropdownCompetition == null || availableYears.length === 0}
                  className={`w-full px-4 py-3 bg-[#1E1E25] border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ${
                    dropdownCompetition == null || availableYears.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">Select a year...</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {dropdownCompetition != null && availableYears.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No years available for this competition
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleDropdownSearchGo}
              disabled={dropdownCompetition  == null || !dropdownYear || competitions.get(dropdownCompetition!)?.competitionType! % 2 !== 0}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                dropdownCompetition != null && dropdownYear && competitions.get(dropdownCompetition)?.competitionType! % 2 === 0
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
              title={dropdownCompetition != null && competitions.get(dropdownCompetition)?.competitionType! % 2 !== 0 ? "Only finals competitions supported" : ""}
            >
              {dropdownCompetition != null && dropdownYear && competitions.get(dropdownCompetition)?.competitionType! % 2 === 0
                ? "View Competition"
                : dropdownCompetition != null && competitions.get(dropdownCompetition)?.competitionType! % 2 !== 0
                ? "Only finals competitions supported"
                : "Select Competition and Year"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}