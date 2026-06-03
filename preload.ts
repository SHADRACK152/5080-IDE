// @ts-ignore
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // ── Editor Core (PieceTree native bridge) ──────────────────────────
  editorCore: {
    pushEvent: (event: any): Promise<boolean> =>
      ipcRenderer.invoke("editor:pushEvent", event),
    getText: (): Promise<string> =>
      ipcRenderer.invoke("editor:getText"),
  },

  // ── Window Controls (custom titlebar) ──────────────────────────────
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke("window:minimize"),
    maximize: (): Promise<boolean> => ipcRenderer.invoke("window:maximize"),
    close: (): Promise<void> => ipcRenderer.invoke("window:close"),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke("window:isMaximized"),
    onMaximizeChange: (cb: (isMax: boolean) => void) => {
      ipcRenderer.on("window:maximized", (_event, val) => cb(val));
    },
  },

  // ── Dialog (native OS pickers) ─────────────────────────────────────
  dialog: {
    openFolder: (): Promise<string | null> =>
      ipcRenderer.invoke("dialog:openFolder"),
    openFile: (): Promise<string | null> =>
      ipcRenderer.invoke("dialog:openFile"),
  },

  // ── Shell (OS integration) ─────────────────────────────────────────
  shell: {
    openExternal: (url: string): Promise<void> =>
      ipcRenderer.invoke("shell:openExternal", url),
    openPath: (filePath: string): Promise<void> =>
      ipcRenderer.invoke("shell:openPath", filePath),
    showItemInFolder: (filePath: string): void => {
      ipcRenderer.invoke("shell:showItemInFolder", filePath);
    },
  },

  // ── App Info ───────────────────────────────────────────────────────
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke("app:getVersion"),
    getName: (): Promise<string> => ipcRenderer.invoke("app:getName"),
    getPlatform: (): Promise<string> => ipcRenderer.invoke("app:getPlatform"),
    getDefaultWorkspace: (): Promise<string> =>
      ipcRenderer.invoke("app:getDefaultWorkspace"),
  },

  // ── Workspace Events ───────────────────────────────────────────────
  workspace: {
    onChange: (cb: (newPath: string) => void) => {
      ipcRenderer.on("workspace:open", (_event, p) => cb(p));
    },
  },

  // ── Is Electron flag ───────────────────────────────────────────────
  isElectron: true,
});
