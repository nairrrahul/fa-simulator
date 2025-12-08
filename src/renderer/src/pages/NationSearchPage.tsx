import { JSX, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@renderer/state/gameStore";
import { Nation } from "src/common/gameState.interfaces";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import FlagCard from "@renderer/components/FlagCard";
import confederationsData from '../../../data/confederations.json' with { type: 'json' };

const CONFEDERATIONS = confederationsData as Record<string, { name: string; continent: string }>;

export default function NationSearchPage(): JSX.Element {
  const navigate = useNavigate();
  const { nations } = useGameStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNations, setFilteredNations] = useState<Nation[]>([]);
  const [selectedNation, setSelectedNation] = useState<Nation | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getConfederationInfo = (confederationID: number) => {
    const confederation = CONFEDERATIONS[confederationID.toString()];
    return confederation ? `${confederation.name} (${confederation.continent})` : "Unknown";
  };

  // Filter nations based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNations([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches = nations.filter(
      (nation) =>
        nation.name.toLowerCase().includes(query) ||
        nation.abbrev.toLowerCase().includes(query)
    );

    setFilteredNations(matches.slice(0, 10)); // Limit to 10 results
    setShowDropdown(matches.length > 0);
  }, [searchQuery, nations]);

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

  const handleSelectNation = (nation: Nation) => {
    setSelectedNation(nation);
    setSearchQuery(nation.name);
    setShowDropdown(false);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    // Clear selection if user starts typing again
    if (selectedNation && value !== selectedNation.name) {
      setSelectedNation(null);
    }
  };

  const handleGo = () => {
    if (selectedNation) {
      navigate(`/nation/${selectedNation.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-[#13131A] rounded-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
          <MagnifyingGlassIcon className="w-8 h-8 text-blue-400" />
          Nation Search
        </h1>
        <p className="text-gray-400 mb-8">
          Search for a nation to view detailed information
        </p>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <label
              htmlFor="nation-search"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nation Name or Abbreviation
            </label>
            <input
              ref={inputRef}
              id="nation-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (filteredNations.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder="e.g. Brazil, USA, GER..."
              className="w-full px-4 py-3 bg-[#1E1E25] border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* Autocomplete Dropdown */}
            {showDropdown && filteredNations.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-10 w-full mt-1 bg-[#1E1E25] border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                {filteredNations.map((nation) => (
                  <div
                    key={nation.id}
                    onClick={() => handleSelectNation(nation)}
                    className="px-4 py-3 hover:bg-[#2A2A35] cursor-pointer flex items-center justify-between border-b border-gray-700 last:border-b-0"
                  >
                    <div>
                      <div className="text-gray-100 font-medium">
                        {nation.name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {nation.abbrev}
                      </div>
                    </div>
                    <FlagCard 
                      countryName={nation.abbrev} 
                      cssClasses="w-12 h-8 object-cover:text-3xl" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Nation Display */}
          {selectedNation && (
            <div className="bg-[#1E1E25] rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-4">
                <FlagCard 
                  countryName={selectedNation.abbrev} 
                  cssClasses="w-16 h-12 object-cover:text-3xl" 
                />
                <div>
                  <div className="text-xl font-bold text-gray-100">
                    {selectedNation.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {selectedNation.abbrev} • {getConfederationInfo(selectedNation.confederationID)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Go Button */}
          <button
            onClick={handleGo}
            disabled={!selectedNation}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
              selectedNation
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selectedNation ? "View Nation Details" : "Select a Nation"}
          </button>
        </div>
      </div>
    </div>
  );
}