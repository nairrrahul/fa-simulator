import { JSX, useState } from "react";
import { GlobeAltIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useGodMode } from "@renderer/state/useGodMode";
import Logo from "../../../../../resources/faSim.png";

export default function Topbar(): JSX.Element {
  const { godMode, setGodMode } = useGodMode();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-6 bg-[#1A1A22] border-b border-gray-700 z-30">

      {/* LEFT SIDE: Logo */}
      <div className="flex items-center gap-4">
        <img src={Logo} alt="FA Sim Logo" className="h-20 w-auto object-contain" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* Globe */}
        <button className="p-2 hover:text-white">
          <GlobeAltIcon className="w-7 h-7" />
        </button>

        {/* Gear */}
        <div className="relative">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="p-2 hover:text-white"
          >
            <Cog6ToothIcon className="w-7 h-7" />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 mt-2 bg-[#1F1F27] border border-gray-700 p-3 w-48 z-20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={godMode}
                  onChange={() => setGodMode(!godMode)}
                  className="accent-purple-500"
                />
                <span>Enable God Mode</span>
              </label>
            </div>
          )}
        </div>

        {/* Month + Year */}
        <div className="border border-gray-500 px-4 py-2 text-lg tracking-wide rounded-lg">
          January 2026
        </div>

        {/* Continue Button */}
        <button className="bg-[#2F3A75] text-white px-6 py-3 text-xl rounded-lg tracking-wide hover:bg-[#3C4AA0] transition-colors">
          CONTINUE &raquo;
        </button>
      </div>
    </header>
  );
}