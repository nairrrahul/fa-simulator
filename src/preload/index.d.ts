import { ElectronAPI } from '@electron-toolkit/preload'
import { Nation, Fixture, KOMapping, Competition, CompetitionGroup, CompetitionHost, CompetitionSnapshot } from './src/common/gameState.interfaces'
import { GameDate } from './src/renderer/src/state/gameStore'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      loadGameData: () => Promise<{ 
        nations: Nation[];
        fixtures: Fixture[];
        knockoutMappings: KOMapping[];
        competitions: Competition[];
        gameStatus: GameDate;
        competitionGroups: CompetitionGroup[];
        competitionHosts: CompetitionHost[];
        competitionSnapshots: CompetitionSnapshot[];
      }>;
      saveGameData: (data: { 
        nations: Nation[];
        fixtures: Fixture[];
        knockoutMappings: KOMapping[];
        gameStatus: GameDate;
        competitionGroups: CompetitionGroup[];
      }) => Promise<void>;
    };
  }
}