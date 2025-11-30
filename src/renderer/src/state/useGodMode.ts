import { create } from "zustand";

interface GodModeState {
  godMode: boolean;
  setGodMode: (value: boolean) => void;
}

export const useGodMode = create<GodModeState>((set) => ({
  godMode: false,
  setGodMode: (value) => set({ godMode: value }),
}));
