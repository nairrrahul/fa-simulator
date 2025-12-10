import SidebarSection from "./SidebarSection";
import {
  HomeIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  FlagIcon,
  ChartBarIcon,
  StarIcon,
  ClockIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useGodMode } from "../../state/useGodMode";
import { JSX } from "react";

export default function Sidebar(): JSX.Element {
  const { godMode } = useGodMode();

  return (
    <aside className="w-64 bg-[#13131A] border-r border-gray-700 pt-24 relative">
      {/* 1: Home */}
      <SidebarSection
        items={[{ label: "Home", icon: <HomeIcon className="w-5 h-5" />, path: "/" }]}
      />

      {/* 2: Competitions */}
      <SidebarSection
        items={[
          { label: "Competitions", icon: <TrophyIcon className="w-5 h-5" />, path: "/competition-search" },
        ]}
      />

      {/* 3: Search */}
      <SidebarSection
        items={[
          { label: "Player Search", icon: <MagnifyingGlassIcon className="w-5 h-5" /> },
          { label: "Nation Search", icon: <FlagIcon className="w-5 h-5" />, path: "/nation-search" },
        ]}
      />

      {/* 4: Information */}
      <SidebarSection
        items={[
          { label: "World Rankings", icon: <ChartBarIcon className="w-5 h-5" />, path: "/rankings" },
          { label: "Player Shortlist", icon: <StarIcon className="w-5 h-5" /> },
          { label: "Tournament History", icon: <ClockIcon className="w-5 h-5" /> },
        ]}
      />

      {/* 5: God Mode Section */}
      {godMode && (
        <SidebarSection
          items={[
            { label: "Add Player", icon: <UserPlusIcon className="w-5 h-5" /> },
          ]}
        />
      )}
    </aside>
  );
}