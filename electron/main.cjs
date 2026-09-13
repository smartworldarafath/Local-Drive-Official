const { app, BrowserWindow, dialog, shell, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

app.setPath("userData", path.join(app.getPath("appData"), "Cloudgram Drive"));

let mainWindow;
let server;
let logPath;
const preferredPorts = [38917, 38918, 38919, 38920];

function log(message) {
  if (!logPath) return;
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
}

async function startBackend() {
  const appRoot = app.isPackaged ? app.getAppPath() : path.join(__dirname, "..");
  const distPath = path.join(appRoot, "dist");
  const serverPath = path.join(appRoot, "dist-electron", "server.mjs");

  process.env.NODE_ENV = "production";
  process.env.CLOUDGRAM_DIST_DIR = distPath;
  process.env.CLOUDGRAM_DATA_DIR = path.join(app.getPath("userData"), "uploads");

  log(`appRoot=${appRoot}`);
  log(`distPath=${distPath}`);
  log(`serverPath=${serverPath}`);

  const { createServer } = await import(pathToFileURL(serverPath).href);
  const expressApp = await createServer();

  let lastError;
  for (const port of preferredPorts) {
    try {
      const listener = await new Promise((resolve, reject) => {
        const candidate = expressApp.listen(port, "127.0.0.1", () => resolve(candidate));
        candidate.on("error", reject);
      });
      return listener;
    } catch (error) {
      lastError = error;
      log(`Port ${port} unavailable: ${error && error.message ? error.message : String(error)}`);
    }
  }

  throw lastError || new Error("No desktop port available");
}

async function createWindow() {
  logPath = path.join(app.getPath("userData"), "cloudgram-desktop.log");
  log("Starting Cloudgram Drive desktop app");

  try {
    server = await startBackend();
  } catch (error) {
    log(`Backend startup failed: ${error && error.stack ? error.stack : String(error)}`);
    await dialog.showMessageBox({
      type: "error",
      title: "Cloudgram Drive",
      message: "Could not start Cloudgram Drive.",
      detail: error && error.stack ? error.stack : String(error),
    });
    app.quit();
    return;
  }

  const { port } = server.address();
  log(`Backend listening on http://127.0.0.1:${port}`);
  const { workAreaSize } = screen.getPrimaryDisplay();
  const width = Math.max(1024, Math.min(1320, Math.floor(workAreaSize.width * 0.88)));
  const height = Math.max(700, Math.min(900, Math.floor(workAreaSize.height * 0.88)));
  const appRoot = app.isPackaged ? app.getAppPath() : path.join(__dirname, "..");
  const iconPath = path.join(appRoot, "build", "icon.ico");
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 980,
    minHeight: 640,
    title: "Cloudgram Drive",
    icon: iconPath,
    backgroundColor: "#f7f9ff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const url = `http://127.0.0.1:${port}?desktop=1`;
  await mainWindow.loadURL(url);
  log(`Loaded ${url}`);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (server) server.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
