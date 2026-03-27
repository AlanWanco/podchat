/// <reference types="vite/client" />

interface Window {
  electron: {
    ping: () => Promise<string>;
    exportVideo: (config: any) => Promise<{ success: boolean; error?: string }>;
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
    readFile: (filePath: string) => Promise<string>;
    writeFile: (filePath: string, content: string) => Promise<boolean>;
    onExportProgress: (callback: (progress: number) => void) => void;
    removeExportProgressListener: () => void;
  };
}
