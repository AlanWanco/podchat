import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electron", {
	ping: () => ipcRenderer.invoke("ping"),
	exportVideo: (config) => ipcRenderer.invoke("export-video", config),
	showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
	showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
	readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
	writeFile: (filePath, content) => ipcRenderer.invoke("write-file", filePath, content),
	onExportProgress: (callback) => {
		ipcRenderer.on("export-progress", (_event, value) => callback(value));
	},
	removeExportProgressListener: () => {
		ipcRenderer.removeAllListeners("export-progress");
	}
});
//#endregion
