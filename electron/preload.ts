const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  exportVideo: (config: any) => ipcRenderer.invoke('export-video', config),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  onExportProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('export-progress', (_event: any, value: any) => callback(value));
  },
  removeExportProgressListener: () => {
    ipcRenderer.removeAllListeners('export-progress');
  }
});
