import { JSX } from "react";
import { Nation } from "src/common/gameState.interfaces";
import FlagCard from "../FlagCard";
import gameImportanceData from '../../../../data/game_importance.json' with { type: 'json' };
import { useGodMode } from "../../state/useGodMode";

interface NationHeaderProps {
  nation: Nation;
  confederationInfo: string;
}

const GAME_IMPORTANCE = gameImportanceData as Record<string, string>;

export default function NationHeader({ nation, confederationInfo }: NationHeaderProps): JSX.Element {
  const { godMode } = useGodMode();
  const gameImportance = GAME_IMPORTANCE[nation.gameState.toString()] || "Unknown";
  
  // Calculate youth rating circles (bins of 20 = half circle fill)
  const getYouthRatingFill = () => {
    const rating = nation.youthRating;
    const circles: Array<'empty' | 'half' | 'full'> = [];
    
    for (let i = 0; i < 5; i++) {
      const circleMin = i * 40;
      const circleMax = (i + 1) * 40;
      
      if(rating < circleMin) {
        circles.push('empty');
      } else if(rating >= circleMax) {
        circles.push('full');
      } else {
        circles.push('half');
      }
    }
    
    return circles;
  };
  
  const youthRatingCircles = getYouthRatingFill();
  
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
        <div className="flex-1 space-y-4">
          {/* Name and Confederation */}
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              {nation.name}
            </h1>
            <p className="text-lg text-gray-400">
              {nation.abbrev} • {confederationInfo}
            </p>
          </div>

          {/* Game Importance */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Game Importance:</span>
              <span className="text-gray-300">{gameImportance}</span>
              <div className="flex gap-1 ml-2">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`h-4 w-2 rounded-sm ${
                      bar <= nation.gameState
                        ? "bg-blue-500"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Youth Rating */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Youth Rating:</span>
              <div className="flex items-center gap-1.5">
                {youthRatingCircles.map((fillType, index) => (
                  <div
                    key={index}
                    className="relative w-5 h-5"
                  >
                    {/* Background circle outline */}
                    <div className="absolute inset-0 rounded-full border-2 border-gray-600" />
                    
                    {/* Fill */}
                    {fillType === 'full' && (
                      <div className="absolute inset-0.5 rounded-full bg-yellow-500" />
                    )}
                    {fillType === 'half' && (
                      <div className="absolute inset-0 overflow-hidden rounded-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-yellow-500" />
                      </div>
                    )}
                  </div>
                ))}
                {godMode && (
                  <span className="text-gray-400 text-sm ml-1">({nation.youthRating})</span>
                )}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Colors:</span>
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: "#"+nation.primaryColor }}
                  title="Primary Color"
                />
                <div
                  className="w-8 h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: "#"+nation.secondaryColor }}
                  title="Secondary Color"
                />
              </div>
            </div>
          </div>

          {/* Manager and Captain */}
          <div className="space-y-2 pt-2 border-t border-gray-700">
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