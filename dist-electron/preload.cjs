//#endregion
//#region electron/preload.ts
var { contextBridge: e, ipcRenderer: t } = (/* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}))("electron");
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
