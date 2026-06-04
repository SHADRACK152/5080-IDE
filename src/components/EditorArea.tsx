import React, { useRef, useEffect, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { File, X, Play, Code, CheckCircle, Smartphone, MapPin, Sparkles, Folder, FolderOpen, ChevronRight, Home } from "lucide-react";
import { EditorTab, WorkspaceSettings, FileNode } from "../types";
import WelcomeScreen from "./WelcomeScreen";

interface EditorAreaProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  settings: WorkspaceSettings;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseAllTabs?: () => void;
  onContentChange: (id: string, newContent: string) => void;
  onCursorChange: (line: number, col: number) => void;
  isSaving: boolean;
  onQuickSave: () => void;
  onFormatActiveFile: () => void;
  // Interactive breadcrumb properties
  fileTree?: FileNode[];
  onSelectFile?: (path: string) => void;
  onToggleExpand?: (path: string) => void;
  expandedPaths?: Set<string>;
  workspaceName?: string;
  activeThemeConfig?: {
    id: string;
    base: string;
    rules: any[];
    colors: any;
  } | null;
  onOpenFolder?: () => void;
  onNewProject?: () => void;
  onOpenRecentWorkspace?: (path: string) => void;
  onCloneRepository?: (url: string) => void;
  onNewFile?: () => void;
}

export default function EditorArea({
  tabs,
  activeTabId,
  settings,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onContentChange,
  onCursorChange,
  isSaving,
  onQuickSave,
  onFormatActiveFile,
  fileTree = [],
  onSelectFile,
  onToggleExpand,
  expandedPaths,
  workspaceName = "workspace",
  activeThemeConfig = null,
  onOpenFolder,
  onNewProject,
  onOpenRecentWorkspace,
  onCloneRepository,
  onNewFile,
}: EditorAreaProps) {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const editorRef = useRef<any>(null);

  // State to track which breadcrumb segment path has its dropdown open
  const [openDropdownPath, setOpenDropdownPath] = useState<string | null>(null);

  // Helper structures for breadcrumb parsing
  const segments = activeTab ? activeTab.relativePath.split(/[\\/]/).filter(Boolean) : [];
  const rootPrefix = activeTab
    ? activeTab.id.substring(0, activeTab.id.length - activeTab.relativePath.length)
    : "";
  const cleanRootPrefix = rootPrefix.replace(/\/$/, "");

  const breadcrumbItems = activeTab
    ? [
        {
          name: workspaceName || "workspace",
          path: cleanRootPrefix,
          isFolder: true,
        },
        ...segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const itemPath = `${cleanRootPrefix}/${segments.slice(0, index + 1).join("/")}`;
          return {
            name: segment,
            path: itemPath,
            isFolder: !isLast,
          };
        }),
      ]
    : [];

  // Helper to walk the fileTree and recursively find a directory / file node
  const findNodeByPath = (nodes: FileNode[], targetPath: string): FileNode | null => {
    if (!nodes) return null;
    const cleanTarget = targetPath.replace(/\/$/, "");
    for (const node of nodes) {
      const cleanNodePath = node.path.replace(/\/$/, "");
      if (cleanNodePath === cleanTarget) {
        return node;
      }
      if (node.children) {
        const found = findNodeByPath(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to expand all parents of a folder in the sidebar
  const expandDirParents = (targetPath: string) => {
    if (!onToggleExpand || !expandedPaths) return;
    const parts = targetPath.split(/[\\/]/).filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      const prefix = (targetPath.startsWith("/") ? "/" : "") + parts.slice(0, i + 1).join("/");
      if (!expandedPaths.has(prefix)) {
        onToggleExpand(prefix);
      }
    }
  };

  // Helper to fetch direct children list of any directory path
  const getChildrenForPath = (path: string): FileNode[] => {
    const safeFileTree = fileTree || [];
    if (path === cleanRootPrefix || path === "root") {
      return safeFileTree;
    }
    const node = findNodeByPath(safeFileTree, path);
    return node?.children || [];
  };

  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

  // Hooking editor mount event
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    setMonacoInstance(monaco);

    // Define custom 5080 Premium visual dark theme
    monaco.editor.defineTheme("5080-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA", fontStyle: "bold" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "class", foreground: "4EC9B0" },
        { token: "operator", foreground: "D4D4D4" },
        { token: "delimiter", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editorCursor.foreground": "#7A2A2A",
        "editor.lineHighlightBackground": "#28282a",
        "editorLineNumber.foreground": "#5a5a5a",
        "editorLineNumber.activeForeground": "#c6c6c6",
        "editor.selectionBackground": "#502828",
        "editor.inactiveSelectionBackground": "#3c2a2a",
        "editorIndentGuide.background1": "#333333",
        "editorIndentGuide.activeBackground1": "#7A2A2A",
        "editorBracketMatch.background": "#4a2424",
        "editorBracketMatch.border": "#7A2A2A",
      },
    });

    // Set active theme
    monaco.editor.setTheme("5080-dark");

    // Track detailed cursor location coordinates
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // Handle Quick Keybindings directly in Editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onQuickSave();
    });
  };

  // Dynamically load custom or extension themes inside Monaco
  useEffect(() => {
    if (monacoInstance) {
      if (activeThemeConfig) {
        monacoInstance.editor.defineTheme(activeThemeConfig.id, {
          base: (activeThemeConfig.base as any) || "vs-dark",
          inherit: true,
          rules: activeThemeConfig.rules || [],
          colors: activeThemeConfig.colors || {},
        });
        monacoInstance.editor.setTheme(activeThemeConfig.id);
      } else {
        monacoInstance.editor.setTheme("5080-dark");
      }
    }
  }, [monacoInstance, activeThemeConfig]);

  // Keep track of active file cursor coordinates on load
  useEffect(() => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      if (position) {
        onCursorChange(position.lineNumber, position.column);
      }
    }
  }, [activeTabId, onCursorChange]);

  // Set up the window.electronAPI polyfill if not present (running in standard web preview)
  useEffect(() => {
    if (!(window as any).electronAPI) {
      (window as any).electronAPI = {
        editorCore: {
          init: async (content: string) => {
            try {
              await fetch("/api/editor/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
              });
              return true;
            } catch {
              return false;
            }
          },
          pushEvent: async (event: any) => {
            try {
              const res = await fetch("/api/editor/pushEvent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event)
              });
              const data = await res.json();
              return data.success;
            } catch {
              return false;
            }
          },
          getText: async () => {
            try {
              const res = await fetch("/api/editor/getText");
              const data = await res.json();
              return data.text;
            } catch {
              return "";
            }
          }
        }
      };
    }
  }, []);

  // Sync loop to synchronize real-time updates from the high-performance memory core
  useEffect(() => {
    let active = true;
    const api = (window as any).electronAPI?.editorCore;
    
    if (api && activeTab) {
      api.init ? api.init(activeTab.content) : Promise.resolve();
    }

    const interval = setInterval(async () => {
      if (!api || !active || !activeTab) return;
      try {
        const text = await api.getText();
        if (text && text !== activeTab.content) {
          onContentChange(activeTab.id, text);
        }
      } catch (err) {
        console.error("Core Engine synchronization error:", err);
      }
    }, 120); // Fast millisecond-range polling trigger

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeTabId, onContentChange]);

  // Stream standard key typing events to the back-end high-throughput SPSC Queue
  useEffect(() => {
    const container = document.getElementById("editorarea-container");
    if (!container) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      const api = (window as any).electronAPI?.editorCore;
      if (!api) return;

      // Map standard printable keys to UIEvent payload
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        await api.pushEvent({
          type: 0, // InsertChar
          text: e.key,
          offset: activeTab ? activeTab.content.length : 0
        });
      } else if (e.key === "Backspace") {
        await api.pushEvent({
          type: 1, // Backspace
          offset: activeTab ? activeTab.content.length : 0,
          count: 1
        });
      }
    };

    container.addEventListener("keydown", handleKeyDown, true);
    return () => {
      container.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [activeTabId, activeTab]);

  return (
    <div
      id="editorarea-container"
      className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0"
    >
      {/* 1. Editor tab strips selection bar */}
      <div className="h-9 bg-[#2D2D2D] border-b border-[#1E1E1E] flex items-center overflow-x-auto overflow-y-hidden select-none shrink-0 scrollbar-none">
        {/* Home Page Permanent Tab */}
        <div
          onClick={() => onSelectTab(null as any)}
          className={`h-full px-4.5 flex items-center justify-center border-r border-[#1E1E1E] cursor-pointer hover:bg-[#1E1E1E]/20 transition-all shrink-0 ${
            activeTabId === null
              ? "bg-[#1E1E1E] text-white border-t border-t-[#7A2A2A]"
              : "text-zinc-400"
          }`}
          title="Home Page"
        >
          <Home className="w-4 h-4" />
        </div>

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`h-full px-3 flex items-center gap-2 border-r border-[#1E1E1E] select-none text-[12px] group relative cursor-pointer transition-all duration-150 shrink-0 min-w-[120px] ${
                isActive
                  ? "bg-[#1E1E1E] text-white border-t border-t-[#7A2A2A]"
                  : "bg-transparent text-gray-400 opacity-65 hover:opacity-100 hover:bg-[#1E1E1E]/20"
              }`}
            >
              <span className={`text-[10px] font-bold ${
                tab.name.endsWith(".tsx") || tab.name.endsWith(".ts") ? "text-[#519aba]" :
                tab.name.endsWith(".json") ? "text-[#f1e05a]" :
                tab.name.endsWith(".css") ? "text-[#569cd6]" : "text-gray-400"
              }`}>
                {tab.name.split(".").pop()?.toUpperCase() || "TXT"}
              </span>
              <span className={`truncate font-sans tracking-tight text-xs ${isActive ? "font-semibold" : ""}`}>
                {tab.name}
              </span>

              {/* Dirty Unsaved Dot indicator */}
              {tab.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shrink-0 absolute right-1.5 top-1.5 group-hover:opacity-0 transition-opacity" />
              )}

              {/* Close tab trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="p-0.5 rounded text-gray-500 hover:text-white hover:bg-white/10 ml-auto opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0"
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {tabs.length > 0 && (
          <div className="ml-auto px-3 flex items-center gap-2 text-zinc-500 select-none">
            {/* Quick action: save, format, close, and close-all buttons */}
            <button
              onClick={() => {
                if (activeTabId) {
                  onCloseTab(activeTabId);
                }
              }}
              className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-gray-400 hover:text-white text-[10.5px] font-sans font-semibold cursor-pointer select-none transition-all flex items-center gap-1 hover:border-orange-500/30"
              title="Close current active editor tab (Alt+W / Ctrl+W)"
            >
              <X className="w-3 h-3 text-orange-400" />
              <span>Close Editor</span>
            </button>
            {onCloseAllTabs && (
              <button
                onClick={onCloseAllTabs}
                className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-gray-400 hover:text-white text-[10.5px] font-sans font-semibold cursor-pointer select-none transition-all flex items-center gap-1 hover:border-red-500/30"
                title="Discard and close all open tabs (Alt+C / Ctrl+Alt+W)"
              >
                <X className="w-3 h-3 text-red-500" />
                <span>Close All</span>
              </button>
            )}
            <button
              onClick={onFormatActiveFile}
              className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-gray-400 hover:text-white text-[10.5px] font-sans font-semibold cursor-pointer select-none transition-all flex items-center gap-1.5 hover:border-cyan-500/30"
              title="Organize imports and auto-format using Prettier rules"
            >
              <Code className="w-3 h-3 text-cyan-400" />
              <span>Format</span>
            </button>
            <button
              onClick={onQuickSave}
              disabled={isSaving}
              className={`px-2 py-1 rounded text-[10.5px] font-sans font-semibold border select-none transition-all cursor-pointer ${
                isSaving
                  ? "bg-[#7A2A2A]/10 text-rose-300 border-[#7A2A2A]/40 animate-pulse"
                  : "bg-[#7A2A2A] text-white border-[#7A2A2A] hover:bg-[#632020]"
              }`}
              title="Save active buffer changes (Ctrl+S)"
            >
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Interactive Breadcrumbs Trail */}
      {activeTab && (
        <div className="h-7 bg-[#1E1E1E] border-b border-[#333333] flex items-center px-4 self-stretch select-none text-[11px] text-[#858585] font-sans gap-0.5 shrink-0 relative z-30">
          {/* Click away overlay when dropdown is active */}
          {openDropdownPath && (
            <div
              className="fixed inset-0 z-40 bg-transparent cursor-default"
              onClick={() => setOpenDropdownPath(null)}
            />
          )}

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-4 max-w-[calc(100%-180px)]">
            {/* Clickable Home Link to return to homepage */}
            <button
              onClick={() => onSelectTab(null as any)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-zinc-400 hover:bg-zinc-850 hover:text-white cursor-pointer transition-all border border-transparent font-sans text-[11.5px] tracking-tight shrink-0 animate-in fade-in duration-200"
              title="Go to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-zinc-500" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-650 shrink-0 mx-0.5" />

            {breadcrumbItems.map((item, idx) => {
              const isOpen = openDropdownPath === item.path;
              const childrenList = getChildrenForPath(item.path);

              return (
                <div key={`${item.path}-${idx}`} className="flex items-center gap-0.5 relative">
                  {/* Separator Chevron before every segment except the first */}
                  {idx > 0 && (
                    <ChevronRight className="w-3 h-3 text-zinc-650 shrink-0 mx-0.5" />
                  )}

                  <div className="relative flex items-center">
                    {/* Segment trigger button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isOpen) {
                          setOpenDropdownPath(null);
                        } else {
                          // Open dropdown listing children
                          setOpenDropdownPath(item.path);
                          // Also expand the parents in sidebar so that it's in sync
                          if (item.isFolder && onToggleExpand) {
                            expandDirParents(item.path);
                          }
                        }
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-all border border-transparent ${
                        isOpen
                          ? "bg-zinc-800 text-white border-zinc-700 font-semibold"
                          : "text-zinc-400 hover:bg-zinc-850 hover:text-white"
                      }`}
                      title={item.isFolder ? `Navigate or quick jump through ${item.name}` : item.name}
                    >
                      {idx === 0 ? (
                        <Home className="w-3.5 h-3.5 text-zinc-500 shrink-0 mr-0.5 animate-in fade-in duration-200" />
                      ) : item.isFolder ? (
                        <Folder className="w-3.5 h-3.5 text-[#e5b560]/95 shrink-0 mr-0.5 fill-[#e5b560]/10 animate-in fade-in duration-200" />
                      ) : (
                        <File className={`w-3.5 h-3.5 shrink-0 mr-0.5 animate-in fade-in duration-200 ${
                          item.name.endsWith(".ts") || item.name.endsWith(".tsx") ? "text-cyan-400" :
                          item.name.endsWith(".json") ? "text-amber-500" :
                          item.name.endsWith(".css") ? "text-blue-400" : "text-gray-400"
                        }`} />
                      )}
                      <span className="truncate max-w-[120px] font-sans text-[11.5px] tracking-tight">
                        {item.name}
                      </span>
                    </button>

                    {/* Popover Dropdown menu */}
                    {isOpen && (
                      <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[220px] max-w-[320px] max-h-[300px] overflow-y-auto bg-[#252526] border border-[#3c3c3c] rounded shadow-2xl py-1 text-xs text-zinc-300 font-sans flex flex-col justify-start align-stretch animate-in fade-in slide-in-from-top-1.5 duration-100">
                        {/* Parent Quick-Jump option inside popover */}
                        {item.isFolder && (
                          <div
                            onClick={() => {
                              if (onToggleExpand) {
                                expandDirParents(item.path);
                                if (expandedPaths && !expandedPaths.has(item.path)) {
                                  onToggleExpand(item.path);
                                }
                              }
                              setOpenDropdownPath(null);
                            }}
                            className="px-2.5 py-1 text-[9.5px] font-bold text-zinc-500 hover:text-cyan-400 bg-zinc-800/10 hover:bg-[#202d38] border-b border-zinc-800/60 flex items-center justify-between cursor-pointer select-none transition-colors"
                            title="Reveal and focus this directory in Sidebar Explorer"
                          >
                            <span>REVEAL IN EXPLORER</span>
                            <FolderOpen className="w-3.5 h-3.5 text-cyan-500/80" />
                          </div>
                        )}

                        <div className="flex flex-col py-0.5">
                          {childrenList.length === 0 ? (
                            <div className="px-3 py-3 text-zinc-500 italic text-[11px] text-center">
                              Empty folder
                            </div>
                          ) : (
                            childrenList.map((child) => {
                              const isChildFolder = child.type === "directory";
                              return (
                                <div
                                  key={child.path}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isChildFolder) {
                                      // Switch dropdown to show the subfolder's children
                                      setOpenDropdownPath(child.path);
                                      // Expand in sidebar
                                      if (onToggleExpand) {
                                        expandDirParents(child.path);
                                        if (expandedPaths && !expandedPaths.has(child.path)) {
                                          onToggleExpand(child.path);
                                        }
                                      }
                                    } else {
                                      // It's a file, let's open it
                                      if (onSelectFile) {
                                        onSelectFile(child.path);
                                      }
                                      setOpenDropdownPath(null);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 hover:bg-[#37373d]/90 hover:text-white flex items-center justify-between gap-2 cursor-pointer transition-colors text-ellipsis overflow-hidden whitespace-nowrap text-[11.5px]"
                                >
                                  <div className="flex items-center gap-2 truncate flex-1">
                                    {isChildFolder ? (
                                      <Folder className="w-3.5 h-3.5 text-[#e5b560] fill-[#e5b560]/10 shrink-0" />
                                    ) : (
                                      <File className={`w-3.5 h-3.5 shrink-0 ${
                                        child.name.endsWith(".ts") || child.name.endsWith(".tsx") ? "text-cyan-400" :
                                        child.name.endsWith(".json") ? "text-amber-500" :
                                        child.name.endsWith(".css") ? "text-blue-400" : "text-gray-400"
                                      }`} />
                                    )}
                                    <span className="truncate text-zinc-205 hover:text-white">{child.name}</span>
                                  </div>
                                  {isChildFolder && (
                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      )}

      {/* 3. Editor body frame container */}
      <div className="flex-1 relative overflow-hidden select-text">
        {activeTab ? (
          <Editor
            height="100%"
            language={activeTab.language}
            value={activeTab.content}
            onChange={(val) => onContentChange(activeTab.id, val || "")}
            onMount={handleEditorDidMount}
            loading={
              <div className="flex flex-col justify-center items-center w-full h-full text-zinc-400 gap-2 flex-1 animate-pulse select-none">
                <Sparkles className="w-7 h-7 text-cyan-500 animate-spin" />
                <span className="text-xs font-semibold">Configuring Editor Sandbox Workspace...</span>
              </div>
            }
            options={{
              fontSize: settings.editor.fontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: settings.editor.minimap },
              wordWrap: settings.editor.wordWrap,
              automaticLayout: true,
              theme: activeThemeConfig ? activeThemeConfig.id : "5080-dark",
              tabSize: settings.editor.tabSize,
              insertSpaces: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderWhitespace: "selection",
              scrollBeyondLastLine: false,
              cursorSmoothCaretAnimation: "on",
              bracketPairColorization: { enabled: true },
              padding: { top: 8, bottom: 8 },
            }}
          />
        ) : (
          /* Splash launcher screen (Welcome/Home Screen) */
          <WelcomeScreen
            onOpenFolder={onOpenFolder || (() => {})}
            onNewProject={onNewProject || (() => {})}
            onOpenRecentWorkspace={onOpenRecentWorkspace || (() => {})}
            onCloneRepository={onCloneRepository}
            onNewFile={onNewFile}
            workspaceName={workspaceName}
          />
        )}
      </div>
    </div>
  );
}
