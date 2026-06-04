import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  Menu,
  Tray,
  nativeImage,
} from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable Electron security warning console logs in development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

// ── Constants ────────────────────────────────────────────────────────────
const IS_DEV = process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
const PORT = 3000;
const APP_NAME = "5080 IDE";

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// ── Workspace Resolution ─────────────────────────────────────────────────
function getDefaultWorkspace(): string {
  const userHome = app.getPath("home");
  const workspacePath = path.join(userHome, "5080-workspace");
  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }
  return workspacePath;
}

// ── Splash Screen ─────────────────────────────────────────────────────────
function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 340,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashPath = path.join(__dirname, "splash.html");
  splashWindow.loadFile(splashPath);

  splashWindow.once("ready-to-show", () => {
    splashWindow?.center();
    splashWindow?.show();
  });
}

// ── Main Window ───────────────────────────────────────────────────────────
function createMainWindow(): void {
  const iconPath = path.join(__dirname, "icon.png");
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    show: false, // hidden until splash is done
    title: APP_NAME,
    icon,
    frame: false, // custom titlebar
    titleBarStyle: "hidden",
    backgroundColor: "#020e14", // Theme match
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // allow localhost API calls
      allowRunningInsecureContent: true,
    },
  });

  // Load the app with automatic retries if the server is still binding in production
  const appUrl = `http://127.0.0.1:${PORT}`;
  
  const showMainAndCloseSplash = () => {
    setTimeout(() => {
      splashWindow?.close();
      splashWindow = null;
      mainWindow?.show();
      mainWindow?.focus();
      if (IS_DEV) {
        mainWindow?.webContents.openDevTools({ mode: "detach" });
      }
    }, 800);
  };

  const loadWithRetry = () => {
    mainWindow?.loadURL(appUrl).catch(() => {
      console.log("[5080 Electron] Server not ready, retrying in 100ms...");
      setTimeout(loadWithRetry, 100);
    });
  };

  loadWithRetry();

  mainWindow.webContents.on("did-finish-load", showMainAndCloseSplash);

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error(`[5080 Electron] WebContents failed to load (${errorCode}): ${errorDescription}. Forcing window display.`);
    showMainAndCloseSplash();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    app.quit();
  });

  // Intercept external links to open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  buildAppMenu();
}

// ── App Menu ──────────────────────────────────────────────────────────────
function buildAppMenu(): void {
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Folder…",
          accelerator: "CmdOrCtrl+K CmdOrCtrl+O",
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ["openDirectory"],
              title: "Open Workspace Folder",
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow?.webContents.send("workspace:open", result.filePaths[0]);
            }
          },
        },
        { type: "separator" },
        { role: "quit", label: "Exit 5080 IDE" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        {
          label: "Maximize/Restore",
          click: () => {
            if (mainWindow?.isMaximized()) mainWindow.unmaximize();
            else mainWindow?.maximize();
          },
        },
        { type: "separator" },
        { role: "close" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About 5080 IDE",
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: "info",
              title: "About 5080 IDE",
              message: `5080 IDE — v${app.getVersion()}`,
              detail: "High-performance desktop code editor.\nBuilt with Electron + React + Monaco Editor.",
              buttons: ["OK"],
            });
          },
        },
        {
          label: "Open Developer Tools",
          accelerator: "F12",
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// ── IPC Handlers ──────────────────────────────────────────────────────────
function registerIpcHandlers(): void {
  // Window controls (custom titlebar)
  ipcMain.handle("window:minimize", () => mainWindow?.minimize());
  ipcMain.handle("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
    return mainWindow?.isMaximized();
  });
  ipcMain.handle("window:close", () => mainWindow?.close());
  ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized() ?? false);

  // Open folder picker dialog
  ipcMain.handle("dialog:openFolder", async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory", "createDirectory"],
      title: "Select Workspace Folder — 5080 IDE",
      buttonLabel: "Open Folder",
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Open file picker dialog
  ipcMain.handle("dialog:openFile", async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      title: "Open File — 5080 IDE",
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Shell utilities
  ipcMain.handle("shell:openExternal", async (_event, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle("shell:openPath", async (_event, filePath: string) => {
    await shell.openPath(filePath);
  });

  ipcMain.handle("shell:showItemInFolder", (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  // App info
  ipcMain.handle("app:getVersion", () => app.getVersion());
  ipcMain.handle("app:getDefaultWorkspace", () => getDefaultWorkspace());
  ipcMain.handle("app:getName", () => APP_NAME);
  ipcMain.handle("app:getPlatform", () => process.platform);

  // Workspace change
  ipcMain.on("workspace:change", (_event, newPath: string) => {
    // Notify the server to update WORKSPACE_ROOT via env
    process.env.WORKSPACE_OVERRIDE = newPath;
    mainWindow?.webContents.reload();
  });

  // Dev mode proxy handlers for Editor Core (when server is running in external process)
  if (IS_DEV) {
    ipcMain.handle("editor:init", async (_event, content: string) => {
      try {
        const response = await fetch(`http://127.0.0.1:${PORT}/api/editor/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const data = (await response.json()) as { success: boolean };
        return data.success;
      } catch (err) {
        console.error("[5080 Electron] Dev proxy editor:init error:", err);
        return false;
      }
    });

    ipcMain.handle("editor:pushEvent", async (_event, payload: any) => {
      try {
        const response = await fetch(`http://127.0.0.1:${PORT}/api/editor/pushEvent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { success: boolean };
        return data.success;
      } catch (err) {
        console.error("[5080 Electron] Dev proxy editor:pushEvent error:", err);
        return false;
      }
    });

    ipcMain.handle("editor:getText", async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${PORT}/api/editor/getText`);
        const data = (await response.json()) as { text: string };
        return data.text;
      } catch (err) {
        // Suppress continuous console spam in dev if server is restarting, but log errors
        console.error("[5080 Electron] Dev proxy editor:getText error:", err);
        return "";
      }
    });
  }
}

// ── Server Bootstrap ──────────────────────────────────────────────────────
async function startEmbeddedServer(): Promise<void> {
  try {
    // Set workspace root before server starts
    const savedWorkspace = getStoredWorkspace();
    if (savedWorkspace && fs.existsSync(savedWorkspace)) {
      process.env.WORKSPACE_OVERRIDE = savedWorkspace;
    } else {
      process.env.WORKSPACE_OVERRIDE = getDefaultWorkspace();
    }

    // Set app root so server can find the dist/ folder
    process.env.ELECTRON_APP_ROOT = app.getAppPath();

    // Import the bundled Express server
    const serverPath = path.join(app.getAppPath(), "dist-electron", "server.js");
    if (fs.existsSync(serverPath)) {
      const mod = await import(pathToFileURL(serverPath).href);
      if (mod.startServer) {
        await mod.startServer();
      }
    } else {
      // Dev mode: server is already running via tsx
      console.log("[5080 Electron] Running in dev mode — server started externally via tsx.");
    }
    console.log(`[5080 Electron] Server available on port ${PORT}`);
  } catch (err) {
    console.error("[5080 Electron] Failed to start embedded server:", err);
  }
}

function getStoredWorkspace(): string | null {
  try {
    const settingsPath = path.join(app.getPath("userData"), "workspace-path.txt");
    if (fs.existsSync(settingsPath)) {
      return fs.readFileSync(settingsPath, "utf8").trim();
    }
  } catch {}
  return null;
}

// ── App Lifecycle ─────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Set app user model ID for Windows notifications
  if (process.platform === "win32") {
    app.setAppUserModelId(APP_NAME);
  }

  registerIpcHandlers();
  createSplashWindow();

  // Start server then create main window
  await startEmbeddedServer();

  // Wait a moment for the server to bind
  await new Promise((resolve) => setTimeout(resolve, 1500));

  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
