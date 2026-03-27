import { BrowserWindow as e, app as t, dialog as n, ipcMain as r } from "electron";
import { fileURLToPath as i } from "node:url";
import a from "node:path";
import o from "node:fs";
//#region electron/main.ts
var s = a.dirname(i(import.meta.url));
process.env.APP_ROOT = a.join(s, "..");
var c = process.env.VITE_DEV_SERVER_URL, l = a.join(process.env.APP_ROOT, "dist-electron"), u = a.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = c ? a.join(process.env.APP_ROOT, "public") : u;
var d;
function f() {
	d = new e({
		width: 1400,
		height: 900,
		webPreferences: {
			preload: a.join(s, "preload.cjs"),
			webSecurity: !1,
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), c ? (d.loadURL(c), d.webContents.openDevTools()) : d.loadFile(a.join(u, "index.html")), d.webContents.on("console-message", (e, t, n, r, i) => {
		console.log(`[Renderer] ${n} (at ${i}:${r})`);
	});
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && (t.quit(), d = null);
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && f();
}), t.whenReady().then(f), r.handle("ping", () => "pong"), r.handle("export-video", async (e, t) => (console.log("Received export video request with config:", t), { success: !0 })), r.handle("show-open-dialog", async (e, t) => d ? await n.showOpenDialog(d, t) : null), r.handle("show-save-dialog", async (e, t) => d ? await n.showSaveDialog(d, t) : null), r.handle("read-file", async (e, t) => {
	try {
		return o.readFileSync(t, "utf-8");
	} catch (e) {
		throw Error(`Failed to read file: ${e.message}`);
	}
}), r.handle("write-file", async (e, t, n) => {
	try {
		return o.writeFileSync(t, n, "utf-8"), !0;
	} catch (e) {
		throw Error(`Failed to write file: ${e.message}`);
	}
});
//#endregion
export { l as MAIN_DIST, u as RENDERER_DIST, c as VITE_DEV_SERVER_URL };
