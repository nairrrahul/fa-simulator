import { JSX, ReactNode, useEffect } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useGameStore } from "@renderer/state/gameStore";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {

  const { isLoaded, loadGameData } = useGameStore();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await window.api.loadGameData();
        loadGameData(data);
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    }
    
    loadData();
  }, []);
  
  return (
    <div className="flex h-screen bg-[#0A0A0F] text-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        {/* Main Page Content */}
        <main className="flex-1 pt-24 px-6 bg-[#0E0E14] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
