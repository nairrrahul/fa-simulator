import { Nation } from 'src/common/gameState.interfaces';
import { create } from 'zustand';

interface GameState {
  nations: Nation[];
  isLoaded: boolean;
  
  // Actions
  loadGameData: (data: { nations: Nation[] }) => void;
  updateNation: (id: number, updates: Partial<Nation>) => void;
  updateRankingPoints: (id: number, points: number) => void;
  clearGameData: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  nations: [],
  isLoaded: false,
  
  loadGameData: (data) => set({ 
    nations: data.nations,
    isLoaded: true 
  }),
  
  updateNation: (id, updates) => set((state) => ({
    nations: state.nations.map(nation =>
      nation.id === id ? { ...nation, ...updates } : nation
    )
  })),
  
  updateRankingPoints: (id, points) => set((state) => ({
    nations: state.nations.map(nation =>
      nation.id === id ? { ...nation, rankingPts: points } : nation
    )
  })),
  
  clearGameData: () => set({ nations: [], isLoaded: false })
}));