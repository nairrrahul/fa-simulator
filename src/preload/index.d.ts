import { ElectronAPI } from '@electron-toolkit/preload'
import { Nation, Fixture, KOMapping } from './src/common/gameState.interfaces'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      loadGameData: () => Promise<{ 
        nations: Nation[];
        fixtures: Fixture[];
        knockoutMappings: KOMapping[];
      }>;
      saveGameData: (data: { 
        nations: Nation[];
        fixtures: Fixture[];
        knockoutMappings: KOMapping[];
      }) => Promise<void>;
    };
  }
}