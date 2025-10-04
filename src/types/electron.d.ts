export interface IElectronAPI {
  platform: string;
  isElectron: boolean;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

declare global {
  interface Window {
    electron?: IElectronAPI;
  }
}

export {};
