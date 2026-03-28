import { BrowserWindow as e, app as t, clipboard as n, dialog as r, ipcMain as i, shell as a } from "electron";
import { fileURLToPath as o } from "node:url";
import s from "node:path";
import c from "node:fs";
import { fork as l } from "node:child_process";
//#region electron/main.ts
var u = s.dirname(o(import.meta.url));
process.env.APP_ROOT = s.join(u, ".."), t.disableHardwareAcceleration();
var d = process.env.VITE_DEV_SERVER_URL, f = s.join(process.env.APP_ROOT, "dist-electron"), p = s.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = d ? s.join(process.env.APP_ROOT, "public") : p;
var m;
function h(e) {
	if (!e) return e;
	let t = e.replace(/\\/g, "/");
	return t.startsWith("/projects/") || t.startsWith("projects/") ? s.join(process.env.VITE_PUBLIC || process.env.APP_ROOT || "", t.replace(/^\//, "")) : e;
}
function g() {
	return process.env.APP_ROOT || s.dirname(t.getPath("exe"));
}
function _(e) {
	return (e.trim() || "podchat-export").replace(/[<>:"/\\|?*]+/g, "-").replace(/\s+/g, "-");
}
function v() {
	m = new e({
		width: 1400,
		height: 900,
		webPreferences: {
			preload: s.join(u, "preload.cjs"),
			webSecurity: !1,
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), d ? (m.loadURL(d), m.webContents.openDevTools()) : m.loadFile(s.join(p, "index.html")), m.webContents.on("console-message", (e, t, n, r, i) => {
		console.log(`[Renderer:${t}] ${n} (at ${i}:${r})`);
	}), m.webContents.on("render-process-gone", (e, t) => {
		console.error("[Renderer gone]", t.reason, t.exitCode);
	}), m.webContents.on("preload-error", (e, t, n) => {
		console.error("[Preload error]", t, n);
	});
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && (t.quit(), m = null);
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && v();
}), t.whenReady().then(v), i.handle("ping", () => "pong"), i.handle("export-video", async (e, t) => {
	if (!(typeof t?.outputPath == "string" && t.outputPath)) return {
		success: !1,
		error: "Missing output path"
	};
	try {
		let e = s.join(process.env.APP_ROOT || process.cwd(), "electron", "remotion-worker.cjs"), n = await new Promise((n, r) => {
			let i = l(e, [], {
				stdio: [
					"pipe",
					"pipe",
					"pipe",
					"ipc"
				],
				env: {
					...process.env,
					APP_ROOT: process.env.APP_ROOT || process.cwd(),
					VITE_PUBLIC: process.env.VITE_PUBLIC || ""
				}
			}), a = setTimeout(() => {
				i.kill(), r(/* @__PURE__ */ Error("Export timeout: operation took too long"));
			}, 300 * 60 * 1e3);
			i.on("message", (e) => {
				if (e) {
					if (e.type === "progress") {
						m?.webContents.send("export-progress", e.payload);
						return;
					}
					if (e.type === "result") {
						clearTimeout(a), n(e.payload), i.kill();
						return;
					}
					e.type === "error" && (clearTimeout(a), r(Error(e.payload?.message || "Export failed")), i.kill());
				}
			}), i.on("error", (e) => {
				clearTimeout(a), r(e);
			}), i.on("exit", (e) => {
				clearTimeout(a), e && e !== 0 && r(/* @__PURE__ */ Error(`Export worker exited with code ${e}`));
			}), i.send({
				type: "render",
				payload: t
			});
		});
		return {
			success: !0,
			placeholder: !1,
			outputPath: n.outputPath,
			elapsedMs: n.elapsedMs,
			realTimeFactor: n.realTimeFactor,
			message: n.message
		};
	} catch (e) {
		return {
			success: !1,
			error: e?.message || "Export failed"
		};
	}
}), i.handle("get-export-paths", async (e, t) => {
	let n = g(), r = typeof t?.projectPath == "string" && t.projectPath ? h(t.projectPath) : "", i = r ? s.dirname(r) : n, a = _(t?.projectTitle || "podchat-export");
	return {
		runtimeDir: n,
		quickSavePath: s.join(n, `${a}.mp4`),
		suggestedPath: s.join(i, `${a}.mp4`)
	};
}), i.handle("show-open-dialog", async (e, t) => m ? await r.showOpenDialog(m, t) : null), i.handle("show-save-dialog", async (e, t) => m ? await r.showSaveDialog(m, t) : null), i.handle("show-item-in-folder", async (e, t) => t ? (a.showItemInFolder(h(t)), !0) : !1), i.handle("read-file", async (e, t) => {
	try {
		return c.readFileSync(h(t), "utf-8");
	} catch (e) {
		throw Error(`Failed to read file: ${e.message}`);
	}
}), i.handle("write-file", async (e, t, n) => {
	try {
		return c.writeFileSync(h(t), n, "utf-8"), !0;
	} catch (e) {
		throw Error(`Failed to write file: ${e.message}`);
	}
}), i.handle("capture-rect-to-clipboard", async (e, t) => {
	if (!m) return !1;
	try {
		let e = await m.webContents.capturePage(t);
		return n.writeImage(e), !0;
	} catch (e) {
		throw Error(`Failed to capture rect: ${e.message}`);
	}
});
//#endregion
export { f as MAIN_DIST, p as RENDERER_DIST, d as VITE_DEV_SERVER_URL };
