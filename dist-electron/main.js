import { BrowserWindow as e, app as t, clipboard as n, dialog as r, ipcMain as i, shell as a } from "electron";
import { fileURLToPath as o } from "node:url";
import s from "node:path";
import c from "node:fs";
import { fork as l } from "node:child_process";
import u from "node:os";
//#region electron/main.ts
var d = s.dirname(o(import.meta.url));
process.env.APP_ROOT = s.join(d, ".."), t.disableHardwareAcceleration();
function f() {
	let e = s.join(u.homedir(), ".config", "podchat"), t = s.join(e, "config.json"), n = s.join(process.env.APP_ROOT || "", "podchat-config.json");
	return c.existsSync(t) ? t : n;
}
function p() {
	let e = s.join(u.homedir(), ".config", "podchat");
	c.existsSync(e) || c.mkdirSync(e, { recursive: !0 });
}
var m = process.env.VITE_DEV_SERVER_URL, h = s.join(process.env.APP_ROOT, "dist-electron"), g = s.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = m ? s.join(process.env.APP_ROOT, "public") : g;
var _;
function v(e) {
	if (!e) return e;
	let t = e.replace(/\\/g, "/");
	return t.startsWith("/projects/") || t.startsWith("projects/") ? s.join(process.env.VITE_PUBLIC || process.env.APP_ROOT || "", t.replace(/^\//, "")) : e;
}
function y() {
	return process.env.APP_ROOT || s.dirname(t.getPath("exe"));
}
function b(e) {
	return (e.trim() || "podchat-export").replace(/[<>:"/\\|?*]+/g, "-").replace(/\s+/g, "-");
}
function x() {
	_ = new e({
		width: 1400,
		height: 900,
		webPreferences: {
			preload: s.join(d, "preload.cjs"),
			webSecurity: !1,
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), m ? (_.loadURL(m), _.webContents.openDevTools()) : _.loadFile(s.join(g, "index.html")), _.webContents.on("console-message", (e, t, n, r, i) => {
		console.log(`[Renderer:${t}] ${n} (at ${i}:${r})`);
	}), _.webContents.on("render-process-gone", (e, t) => {
		console.error("[Renderer gone]", t.reason, t.exitCode);
	}), _.webContents.on("preload-error", (e, t, n) => {
		console.error("[Preload error]", t, n);
	});
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && (t.quit(), _ = null);
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && x();
}), t.whenReady().then(x), i.handle("ping", () => "pong"), i.handle("export-video", async (e, t) => {
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
						_?.webContents.send("export-progress", e.payload);
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
	let n = y(), r = typeof t?.projectPath == "string" && t.projectPath ? v(t.projectPath) : "", i = r ? s.dirname(r) : n, a = b(t?.projectTitle || "podchat-export");
	return {
		runtimeDir: n,
		quickSavePath: s.join(n, `${a}.mp4`),
		suggestedPath: s.join(i, `${a}.mp4`)
	};
}), i.handle("show-open-dialog", async (e, t) => _ ? await r.showOpenDialog(_, t) : null), i.handle("show-save-dialog", async (e, t) => _ ? await r.showSaveDialog(_, t) : null), i.handle("show-item-in-folder", async (e, t) => t ? (a.showItemInFolder(v(t)), !0) : !1), i.handle("read-file", async (e, t) => {
	try {
		return c.readFileSync(v(t), "utf-8");
	} catch (e) {
		throw Error(`Failed to read file: ${e.message}`);
	}
}), i.handle("write-file", async (e, t, n) => {
	try {
		return c.writeFileSync(v(t), n, "utf-8"), !0;
	} catch (e) {
		throw Error(`Failed to write file: ${e.message}`);
	}
}), i.handle("capture-rect-to-clipboard", async (e, t) => {
	if (!_) return !1;
	try {
		let e = await _.webContents.capturePage(t);
		return n.writeImage(e), !0;
	} catch (e) {
		throw Error(`Failed to capture rect: ${e.message}`);
	}
}), i.handle("load-config", async () => {
	try {
		let e = f();
		if (c.existsSync(e)) {
			let t = c.readFileSync(e, "utf-8");
			return JSON.parse(t);
		}
		return null;
	} catch (e) {
		return console.error("Failed to load config:", e), null;
	}
}), i.handle("save-config", async (e, t) => {
	try {
		p();
		let e = s.join(u.homedir(), ".config", "podchat"), n = s.join(e, "config.json");
		return c.writeFileSync(n, JSON.stringify(t, null, 2), "utf-8"), !0;
	} catch (e) {
		return console.error("Failed to save config:", e), !1;
	}
});
//#endregion
export { h as MAIN_DIST, g as RENDERER_DIST, m as VITE_DEV_SERVER_URL };
