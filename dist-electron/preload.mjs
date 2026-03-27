import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electron", {
	ping: () => t.invoke("ping"),
	exportVideo: (e) => t.invoke("export-video", e),
	showOpenDialog: (e) => t.invoke("show-open-dialog", e),
	showSaveDialog: (e) => t.invoke("show-save-dialog", e),
	readFile: (e) => t.invoke("read-file", e),
	writeFile: (e, n) => t.invoke("write-file", e, n),
	onExportProgress: (e) => {
		t.on("export-progress", (t, n) => e(n));
	},
	removeExportProgressListener: () => {
		t.removeAllListeners("export-progress");
	}
});
//#endregion
