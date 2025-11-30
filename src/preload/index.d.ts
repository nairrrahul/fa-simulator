import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      loadGameData: () => Promise<{ nations: any[] }>;
      saveGameData: (data: any) => Promise<void>;
    };
  }
}
