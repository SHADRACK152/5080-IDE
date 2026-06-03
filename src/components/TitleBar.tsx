import React, { useState } from "react";
import { Square, Minus, X, Cpu, ChevronRight, Sparkles, Code, Terminal, FileText, ToggleLeft, ToggleRight, Trash2, Search, Settings } from "lucide-react";

const isElectron = typeof window !== "undefined" && !!(window as any).electronAPI;

function electronMinimize() {
  if (isElectron) (window as any).electronAPI.window.minimize();
}
function electronMaximize() {
  if (isElectron) (window as any).electronAPI.window.maximize();
}
function electronClose() {
  if (isElectron) (window as any).electronAPI.window.close();
}

interface TitleBarProps {
  activeFileName?: string;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onClose: () => void;

  // Actions
  onNewFile: () => void;
  onNewFolder: () => void;
  onSave: () => void;
  onCloseActiveTab: () => void;
  onCloseAllTabs: () => void;
  onRefreshExplorer: () => void;
  onFormatActiveFile: () => void;
  onClearOutput: () => void;
  onGoToHome: () => void;
  onCloseFolder: () => void;
  
  // Layout toggles
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isBottomPanelVisible: boolean;
  onToggleBottomPanel: () => void;
  activeSidebarTab: string;
  onSelectSidebarTab: (tab: "explorer" | "search" | "git" | "gemini" | "settings") => void;

  // Preferences
  fontSize: number;
  onUpdateSetting: (category: "editor" | "workbench", key: string, value: any) => void;
  minimap: boolean;

  // Tools
  onOpenPalette: () => void;
  onRunDiagnostics: () => void;
  onTriggerAI: (prompt: string) => void;
  onClearAI: () => void;
}

export default function TitleBar({
  activeFileName,
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onClose,
  onNewFile,
  onNewFolder,
  onSave,
  onCloseActiveTab,
  onCloseAllTabs,
  onRefreshExplorer,
  onFormatActiveFile,
  onClearOutput,
  isSidebarVisible,
  onToggleSidebar,
  isBottomPanelVisible,
  onToggleBottomPanel,
  activeSidebarTab,
  onSelectSidebarTab,
  fontSize,
  onUpdateSetting,
  minimap,
  onOpenPalette,
  onRunDiagnostics,
  onTriggerAI,
  onClearAI,
  onGoToHome,
  onCloseFolder,
}: TitleBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Hover tracking for menu selection matching standard IDE workflow
  const handleMouseEnterMenu = (menuId: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menuId);
    }
  };

  const handleAction = (actionFn: () => void) => {
    actionFn();
    setActiveMenu(null);
  };

  const menuHeaders = [
    { id: "file", label: "File" },
    { id: "edit", label: "Edit" },
    { id: "selection", label: "Selection" },
    { id: "view", label: "View" },
    { id: "go", label: "Go" },
    { id: "terminal", label: "Terminal" },
    { id: "copilot", label: "Copilot", highlight: true },
  ];

  return (
    <div
      id="titlebar-container"
      className="h-8 bg-[#333333] border-b border-[#1A1A1A] flex items-center justify-between px-3 select-none text-xs text-zinc-300 font-sans cursor-default shrink-0 relative z-50"
      style={{ WebkitAppRegion: "drag" } as any}
      onDoubleClick={onToggleMaximize}
    >
      {/* Click-outside Backdrop helper */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          onClick={() => setActiveMenu(null)}
          style={{ WebkitAppRegion: "no-drag" } as any}
        />
      )}

      {/* Brand, circles & Dropdown Navigation Menus (Left) */}
      <div className="flex items-center gap-3.5 z-50" style={{ WebkitAppRegion: "no-drag" } as any}>
        {/* Mac-like Window Control Dots */}
        <div className="flex gap-1.5 mr-2">
          <div onClick={() => isElectron ? electronClose() : onClose()} className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-90 hover:opacity-100 cursor-pointer transition-opacity" title="Close" />
          <div onClick={() => isElectron ? electronMinimize() : onMinimize()} className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-90 hover:opacity-100 cursor-pointer transition-opacity" title="Minimize" />
          <div onClick={() => isElectron ? electronMaximize() : onToggleMaximize()} className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-90 hover:opacity-100 cursor-pointer transition-opacity" title={isMaximized ? "Restore" : "Maximize"} />
        </div>

        {/* Traditional IDE Ribbon Menu featuring rich operational functions */}
        <div className="flex items-center gap-0.5 select-none relative">
          {menuHeaders.map((menu) => (
            <div key={menu.id} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                onMouseEnter={() => handleMouseEnterMenu(menu.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors hover:text-white cursor-pointer ${
                  activeMenu === menu.id
                    ? "bg-neutral-700 text-white font-semibold"
                    : menu.highlight
                    ? "text-rose-400 font-semibold hover:bg-rose-950/40"
                    : "text-zinc-400 hover:bg-neutral-800"
                }`}
              >
                {menu.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A2A2A] animate-ping mr-1 inline-block" />
                )}
                {menu.label}
              </button>

              {/* RENDER ACTIVE DROPDOWN */}
              {activeMenu === menu.id && (
                <div 
                  className="absolute left-0 top-full mt-1 bg-[#252526] border border-[#3b3b3c] py-1 rounded shadow-2xl z-50 text-xs min-w-[210px] text-zinc-300 font-sans divide-y divide-[#3c3c3c]"
                >
                  {/* Menu contents dynamically rendered */}
                  {menu.id === "file" && (
                    <>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onNewFile)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>New File...</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Cmd+Alt+N</span>
                        </button>
                        <button
                          onClick={() => handleAction(onNewFolder)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>New Folder...</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Cmd+Alt+F</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onSave)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span className="font-semibold text-zinc-100 hover:text-white">Save Code</span>
                          <span className="text-[10px] text-zinc-400 font-mono font-bold">Ctrl+S</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onCloseActiveTab)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Close Editor</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Ctrl+W</span>
                        </button>
                        <button
                          onClick={() => handleAction(onCloseAllTabs)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-red-800 hover:text-white flex justify-between items-center transition-colors text-red-300 cursor-pointer"
                        >
                          <span>Close All Editors</span>
                          <span className="text-[10px] text-red-400 font-mono">Alt+W</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onCloseFolder)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-neutral-800 hover:text-orange-300 flex justify-between items-center transition-colors text-orange-400 font-semibold cursor-pointer"
                        >
                          <span>Close Workspace Folder</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Ctrl+Shift+W</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onRefreshExplorer)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Refresh Workspace Tree</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Ctrl+Alt+R</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onClose)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#a82424] hover:text-white flex justify-between items-center transition-colors text-red-400 font-semibold cursor-pointer"
                        >
                          <span>Exit IDE</span>
                          <span className="text-[10px] text-red-500 font-mono">Ctrl+Q</span>
                        </button>
                      </div>
                    </>
                  )}

                  {menu.id === "edit" && (
                    <>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onFormatActiveFile)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span className="font-semibold text-zinc-100 hover:text-white">Format Active Document</span>
                          <span className="text-[10px] text-zinc-400 font-mono font-semibold">Ctrl+Alt+F</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onClearOutput)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Clear Output Logs Console</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Alt+K</span>
                        </button>
                      </div>
                    </>
                  )}

                  {menu.id === "selection" && (
                    <div className="py-1">
                      <div className="px-3.5 py-1 text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Monaco Controls</div>
                      <button
                        onClick={() => handleAction(onOpenPalette)}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span>Select All Editor lines</span>
                        <span className="text-[10px] text-zinc-500 font-mono">F1 &gt; SelectAll</span>
                      </button>
                      <button
                        onClick={() => handleAction(onOpenPalette)}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span>Add Cursor Above / Below</span>
                        <span className="text-[10px] text-zinc-500 font-mono">F1 &gt; Cursor</span>
                      </button>
                    </div>
                  )}

                  {menu.id === "view" && (
                    <>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onToggleSidebar)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Toggle Primary Sidebar</span>
                          <span className="text-[10px] text-zinc-400 font-mono font-semibold">{isSidebarVisible ? "Hide [Ctrl+B]" : "Show [Ctrl+B]"}</span>
                        </button>
                        <button
                          onClick={() => handleAction(onToggleBottomPanel)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Toggle Dynamic Bottom Panel</span>
                          <span className="text-[10px] text-zinc-400 font-mono font-semibold">{isBottomPanelVisible ? "Hide [Ctrl+`]" : "Show [Ctrl+`]"}</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <div className="px-3.5 py-1 text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Sidebar Tab Views</div>
                        <button
                          onClick={() => handleAction(() => { onSelectSidebarTab("explorer"); if(!isSidebarVisible) onToggleSidebar(); })}
                          className={`w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer ${activeSidebarTab === "explorer" ? "bg-[#2d2d30] font-semibold text-white" : ""}`}
                        >
                          <span>Workspace Explorer</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Explorer</span>
                        </button>
                        <button
                          onClick={() => handleAction(() => { onSelectSidebarTab("search"); if(!isSidebarVisible) onToggleSidebar(); })}
                          className={`w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer ${activeSidebarTab === "search" ? "bg-[#2d2d30] font-semibold text-white" : ""}`}
                        >
                          <span>Global Fuzzy Search</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Search</span>
                        </button>
                        <button
                          onClick={() => handleAction(() => { onSelectSidebarTab("git"); if(!isSidebarVisible) onToggleSidebar(); })}
                          className={`w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer ${activeSidebarTab === "git" ? "bg-[#2d2d30] font-semibold text-white" : ""}`}
                        >
                          <span>Source Control (Git)</span>
                          <span className="text-[10px] text-zinc-500 font-mono">source</span>
                        </button>
                        <button
                          onClick={() => handleAction(() => { onSelectSidebarTab("settings"); if(!isSidebarVisible) onToggleSidebar(); })}
                          className={`w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer ${activeSidebarTab === "settings" ? "bg-[#2d2d30] font-semibold text-white" : ""}`}
                        >
                          <span>Preferences</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Prefs</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <div className="px-3.5 py-1 text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Zoom Controls</div>
                        <button
                          onClick={() => handleAction(() => onUpdateSetting("editor", "fontSize", Math.min(24, fontSize + 1)))}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Zoom In (Increase font)</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Active: {fontSize}px</span>
                        </button>
                        <button
                          onClick={() => handleAction(() => onUpdateSetting("editor", "fontSize", Math.max(10, fontSize - 1)))}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Zoom Out (Decrease font)</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Active: {fontSize}px</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(() => onUpdateSetting("editor", "minimap", !minimap))}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer text-zinc-300"
                        >
                          <span>Toggle Minimap overlay</span>
                          <span className="text-[10.5px] font-mono font-bold text-rose-400">{minimap ? "ON" : "OFF"}</span>
                        </button>
                      </div>
                    </>
                  )}

                  {menu.id === "go" && (
                    <div className="py-1">
                      <button
                        onClick={() => handleAction(onGoToHome)}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span>Go to Home Page</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Alt+H</span>
                      </button>
                      <button
                        onClick={() => handleAction(onOpenPalette)}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-zinc-100 hover:text-white">Go to File (Fuzzy)</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">F1</span>
                      </button>
                      <button
                        onClick={() => handleAction(() => { onSelectSidebarTab("search"); if(!isSidebarVisible) onToggleSidebar(); })}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span>Find in Files (Text query)</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Alt+S</span>
                      </button>
                    </div>
                  )}

                  {menu.id === "terminal" && (
                    <div className="py-1">
                      <button
                        onClick={() => handleAction(() => { if(!isBottomPanelVisible) onToggleBottomPanel(); })}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <span>Focus Bash Shell Console</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Ctrl+`</span>
                      </button>
                      <button
                        onClick={() => handleAction(onRunDiagnostics)}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer text-[#0DBC79]"
                      >
                        <span className="font-semibold">Run Diagnostics Check</span>
                        <span className="text-[10px] text-[#0DBC79] font-mono font-bold">Ctrl+Shift+L</span>
                      </button>
                    </div>
                  )}

                  {menu.id === "copilot" && (
                    <>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(() => { onSelectSidebarTab("gemini"); if(!isSidebarVisible) onToggleSidebar(); })}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer text-cyan-400 font-semibold"
                        >
                          <span>Focus Sidekick Dialog panel</span>
                          <span className="text-[10px] text-cyan-400 font-mono">Ctrl+Shift+G</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <div className="px-3.5 py-1 text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Copilot Presets</div>
                        <button
                          onClick={() => handleAction(() => onTriggerAI("Explain the active workspace file to me in detail"))}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Explain active codebase file</span>
                          <ChevronRight className="w-3 h-3 text-cyan-500" />
                        </button>
                        <button
                          onClick={() => handleAction(() => onTriggerAI("Refactor files to optimize performance, memory, and clean code styling guidelines"))}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Analyze & Refactor logic</span>
                          <ChevronRight className="w-3 h-3 text-cyan-500" />
                        </button>
                        <button
                          onClick={() => handleAction(() => onTriggerAI("Compose detailed Jest / Mocha coverage Unit Tests for my active code blocks"))}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-[#7A2A2A] hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                        >
                          <span>Compose unit coverages</span>
                          <ChevronRight className="w-3 h-3 text-cyan-500" />
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleAction(onClearAI)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-neutral-800 hover:text-red-300 flex justify-between items-center transition-colors text-zinc-400 cursor-pointer"
                        >
                          <span>Clear Chat history</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Alt+X</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Title Centered (Standard VSCode Style, clickable to open palette) */}
      <div 
        onClick={onOpenPalette}
        className="absolute left-1/2 -translate-x-1/2 text-zinc-400 hover:text-white bg-neutral-800/20 hover:bg-neutral-800/60 px-2 py-0.5 rounded cursor-pointer transition-all duration-150 text-[11px] font-medium truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px]"
        title="Open Workspace Command Palette (F1)"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        {activeFileName ? `5080 IDE — src/${activeFileName}` : "5080 IDE — Welcome Page"}
      </div>

      {/* Performance State Indicators (Right) */}
      <div className="flex items-center gap-2.5 text-[10px] text-zinc-500 font-mono select-none" style={{ WebkitAppRegion: "no-drag" } as any}>
        <span className="hidden sm:inline bg-neutral-800 text-[10px] px-1.5 py-0.5 text-[#0DBC79] rounded font-bold border border-neutral-700/60 transition-all cursor-help" title="Container WebGL performance score: 60 FPS stable.">60 FPS</span>
        <button
          onClick={onToggleMaximize}
          className="h-8 flex items-center justify-center text-zinc-400 hover:text-white px-2 hover:bg-white/5 transition-colors cursor-pointer"
          title="Toggle Maximized Canvas"
        >
          <Square className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
