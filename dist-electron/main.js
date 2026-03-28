import { BrowserWindow, app, clipboard, dialog, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { fork } from "node:child_process";
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
app.disableHardwareAcceleration();
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win;
function resolveAppFilePath(filePath) {
	if (!filePath) return filePath;
	const normalized = filePath.replace(/\\/g, "/");
	if (normalized.startsWith("/projects/") || normalized.startsWith("projects/")) return path.join(process.env.VITE_PUBLIC || process.env.APP_ROOT || "", normalized.replace(/^\//, ""));
	return filePath;
}
function getRuntimeDirectory() {
	return process.env.APP_ROOT || path.dirname(app.getPath("exe"));
}
function sanitizeFileStem(value) {
	return (value.trim() || "podchat-export").replace(/[<>:"/\\|?*]+/g, "-").replace(/\s+/g, "-");
}
function createWindow() {
	win = new BrowserWindow({
		width: 1400,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, "preload.cjs"),
			webSecurity: false,
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
		win.webContents.openDevTools();
	} else win.loadFile(path.join(RENDERER_DIST, "index.html"));
	win.webContents.on("console-message", (_event, level, message, lineNumber, sourceId) => {
		console.log(`[Renderer:${level}] ${message} (at ${sourceId}:${lineNumber})`);
	});
	win.webContents.on("render-process-gone", (_event, details) => {
		console.error("[Renderer gone]", details.reason, details.exitCode);
	});
	win.webContents.on("preload-error", (_event, preloadPath, error) => {
		console.error("[Preload error]", preloadPath, error);
	});
}
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(createWindow);
ipcMain.handle("ping", () => "pong");
ipcMain.handle("export-video", async (_event, config) => {
	if (!(typeof config?.outputPath === "string" ? config.outputPath : "")) return {
		success: false,
		error: "Missing output path"
	};
	try {
		const workerPath = path.join(process.env.APP_ROOT || process.cwd(), "electron", "remotion-worker.cjs");
		const result = await new Promise((resolve, reject) => {
			const worker = fork(workerPath, [], {
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
			});
			worker.on("message", (message) => {
				if (!message) return;
				if (message.type === "progress") {
					win?.webContents.send("export-progress", message.payload);
					return;
				}
				if (message.type === "result") {
					resolve(message.payload);
					worker.kill();
					return;
				}
				if (message.type === "error") {
					reject(new Error(message.payload?.message || "Export failed"));
					worker.kill();
				}
			});
			worker.on("error", reject);
			worker.on("exit", (code) => {
				if (code && code !== 0) reject(/* @__PURE__ */ new Error(`Export worker exited with code ${code}`));
			});
			worker.send({
				type: "render",
				payload: config
			});
		});
		return {
			success: true,
			placeholder: false,
			outputPath: result.outputPath,
			elapsedMs: result.elapsedMs,
			realTimeFactor: result.realTimeFactor,
			message: result.message
		};
	} catch (error) {
		return {
			success: false,
			error: error?.message || "Export failed"
		};
	}
});
ipcMain.handle("get-export-paths", async (_event, options) => {
	const runtimeDir = getRuntimeDirectory();
	const projectPath = typeof options?.projectPath === "string" && options.projectPath ? resolveAppFilePath(options.projectPath) : "";
	const projectDir = projectPath ? path.dirname(projectPath) : runtimeDir;
	const fileStem = sanitizeFileStem(options?.projectTitle || "podchat-export");
	return {
		runtimeDir,
		quickSavePath: path.join(runtimeDir, `${fileStem}.mp4`),
		suggestedPath: path.join(projectDir, `${fileStem}.mp4`)
	};
});
ipcMain.handle("show-open-dialog", async (_event, options) => {
	if (!win) return null;
	return await dialog.showOpenDialog(win, options);
});
ipcMain.handle("show-save-dialog", async (_event, options) => {
	if (!win) return null;
	return await dialog.showSaveDialog(win, options);
});
ipcMain.handle("show-item-in-folder", async (_event, filePath) => {
	if (!filePath) return false;
	shell.showItemInFolder(resolveAppFilePath(filePath));
	return true;
});
ipcMain.handle("read-file", async (_event, filePath) => {
	try {
		return fs.readFileSync(resolveAppFilePath(filePath), "utf-8");
	} catch (error) {
		throw new Error(`Failed to read file: ${error.message}`);
	}
});
ipcMain.handle("write-file", async (_event, filePath, content) => {
	try {
		fs.writeFileSync(resolveAppFilePath(filePath), content, "utf-8");
		return true;
	} catch (error) {
		throw new Error(`Failed to write file: ${error.message}`);
	}
});
ipcMain.handle("capture-rect-to-clipboard", async (_event, rect) => {
	if (!win) return false;
	try {
		const image = await win.webContents.capturePage(rect);
		clipboard.writeImage(image);
		return true;
	} catch (error) {
		throw new Error(`Failed to capture rect: ${error.message}`);
	}
});
//#endregion
export { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL };
