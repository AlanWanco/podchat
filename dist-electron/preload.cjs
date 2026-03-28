//#endregion
//#region electron/preload.ts
var { contextBridge, ipcRenderer, webUtils } = (/* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}))("electron");
contextBridge.exposeInMainWorld("electron", {
	ping: () => ipcRenderer.invoke("ping"),
	exportVideo: (config) => ipcRenderer.invoke("export-video", config),
	getExportPaths: (options) => ipcRenderer.invoke("get-export-paths", options),
	showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
	showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
	showItemInFolder: (filePath) => ipcRenderer.invoke("show-item-in-folder", filePath),
	getDroppedFilePath: (file) => webUtils.getPathForFile(file),
	readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
	writeFile: (filePath, content) => ipcRenderer.invoke("write-file", filePath, content),
	captureRectToClipboard: (rect) => ipcRenderer.invoke("capture-rect-to-clipboard", rect),
	onExportProgress: (callback) => {
		const listener = (_event, value) => callback(value);
		ipcRenderer.on("export-progress", listener);
		return () => ipcRenderer.removeListener("export-progress", listener);
	}
});
//#endregion
