import React, { useState, useRef, useEffect } from "react";
import { Terminal, AlertCircle, ListCollapse, Play, Square, Trash2, Maximize2, Minimize2, X, Plus, Columns, ChevronDown, Activity, Globe, Bug } from "lucide-react";
import { Problem } from "../types";

interface BottomPanelProps {
  height: number;
  onHeightChange: (h: number) => void;
  isVisible: boolean;
  onClose: () => void;
  problems: Problem[];
  activeTab: "terminal" | "problems" | "output";
  onTabChange: (tab: "terminal" | "problems" | "output") => void;
  outputLogs: string[];
  onClearOutput: () => void;
  workspacePath?: string;
  onApplyLintFix?: () => void;
  position?: "bottom" | "right";
  onRefreshWorkspace?: () => void;
}

export default function BottomPanel({
  height,
  onHeightChange,
  isVisible,
  onClose,
  problems,
  activeTab,
  onTabChange,
  outputLogs,
  onClearOutput,
  workspacePath,
  onApplyLintFix,
  position = "bottom",
  onRefreshWorkspace,
}: BottomPanelProps) {
  const [terminalInput, setTerminalInput] = useState("");
  
  // Format the prompt dynamically based on the active workspace path
  const promptString = (() => {
    if (workspacePath) {
      return `PS ${workspacePath.replace(/\//g, "\\")}>`;
    }
    return "PS C:\\Users\\Admin mtkenyanews\\Documents\\5080-ide>";
  })();
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableShells, setAvailableShells] = useState<{ name: string; path: string }[]>([]);
  const [selectedShell, setSelectedShell] = useState<string>("");
  
  // Custom VS Code layout additions
  const [localTab, setLocalTab] = useState<string>("terminal");
  const [activeTerminals, setActiveTerminals] = useState<{ id: string; name: string; active: boolean }[]>([
    { id: "1", name: "1: powershell", active: true },
    { id: "2", name: "2: node dev server", active: false }
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab) {
      setLocalTab(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setLocalTab(tabId);
    if (tabId === "problems" || tabId === "output" || tabId === "terminal") {
      onTabChange(tabId as any);
    }
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalOutput]);

  useEffect(() => {
    const fetchShells = async () => {
      try {
        const response = await fetch("/api/terminal/shells");
        if (response.ok) {
          const data = await response.json();
          if (data.shells && data.shells.length > 0) {
            setAvailableShells(data.shells);
            const saved = localStorage.getItem("selected_shell_5080");
            if (saved && data.shells.some((s: any) => s.path === saved)) {
              setSelectedShell(saved);
            } else {
              setSelectedShell(data.shells[0].path);
              localStorage.setItem("selected_shell_5080", data.shells[0].path);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch shells:", err);
      }
    };
    fetchShells();
  }, []);

  const parseAnsiColors = (text: string) => {
    // Regex for basic terminal colors
    // Matches \x1b[...] or \u001b[...]
    const parts = text.split(/(\x1b\[\d+(?:;\d+)*m)/g);
    let currentStyle = "text-gray-300";

    return parts.map((part, index) => {
      if (part.startsWith("\x1b[") || part.startsWith("\u001b[")) {
        if (part === "\x1b[0m" || part === "\u001b[0m") {
          currentStyle = "text-gray-300";
        } else if (part.includes("1;32") || part.includes(";32")) {
          currentStyle = "text-emerald-400 font-bold"; // Green
        } else if (part.includes("1;31") || part.includes(";31")) {
          currentStyle = "text-rose-400 font-bold"; // Red
        } else if (part.includes("1;36") || part.includes(";36")) {
          currentStyle = "text-cyan-400 font-bold"; // Cyan
        } else if (part.includes("1;33") || part.includes(";33")) {
          currentStyle = "text-amber-400 font-bold"; // Yellow
        } else if (part.includes("1;34") || part.includes(";34")) {
          currentStyle = "text-blue-400 font-bold"; // Blue
        } else if (part.includes("1;35") || part.includes(";35")) {
          currentStyle = "text-fuchsia-400 font-bold"; // Magenta
        } else if (part.includes("1;30") || part.includes(";30")) {
          currentStyle = "text-gray-500 font-mono"; // Grey
        }
        return null;
      }
      return <span key={index} className={currentStyle}>{part}</span>;
    }).filter(Boolean);
  };

  const executeCommand = async (commandStr: string) => {
    if (!commandStr.trim()) return;

    setIsCommandRunning(true);
    setCurrentCommand(commandStr);
    setTerminalOutput((prev) => [...prev, `\x1b[1;30m$ ${commandStr}\x1b[0m`]);

    try {
      const response = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandStr, shell: selectedShell }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let leftoverBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const combined = leftoverBuffer + textChunk;
          const lines = combined.split("\n");

          // Keep the incomplete last line in buffer
          leftoverBuffer = lines.pop() || "";

          setTerminalOutput((prev) => {
            const next = [...prev];
            lines.forEach((line) => {
              // Strip carriage return characters
              next.push(line.replace(/\r/g, ""));
            });
            return next;
          });
        }
        if (leftoverBuffer) {
          setTerminalOutput((prev) => [...prev, leftoverBuffer.replace(/\r/g, "")]);
        }
      } else {
        const fullText = await response.text();
        setTerminalOutput((prev) => [...prev, ...fullText.split("\n")]);
      }
    } catch (error: any) {
      setTerminalOutput((prev) => [...prev, `\x1b[1;31mTerminal Execution Failed: ${error.message}\x1b[0m`]);
    } finally {
      setIsCommandRunning(false);
      setCurrentCommand(null);
      if (onRefreshWorkspace) {
        onRefreshWorkspace();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = terminalInput.trim();
      if (!input) return;

      executeCommand(input);
      setTerminalHistory((prev) => [input, ...prev.slice(0, 49)]); // keep max 50 items
      setTerminalInput("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < terminalHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setTerminalInput(terminalHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setTerminalInput(terminalHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setTerminalInput("");
      }
    }
  };

  const clearTerminal = () => {
    setTerminalOutput([
      "\x1b[1;30mConsole log buffer wiped clean.\x1b[0m"
    ]);
  };

  if (!isVisible) return null;

  const isPositionRight = position === "right";

  return (
    <div
      id="bottompanel-container"
      style={isExpanded ? {} : (isPositionRight ? { width: `${height}px`, height: "100%" } : { height: `${height}px` })}
      className={`bg-[#1E1E1E] ${
        isPositionRight ? "border-l border-neutral-800" : "border-t border-[#1E1E1E]"
      } flex flex-col font-sans overflow-hidden ${
        isExpanded ? "absolute inset-0 z-30" : "relative shrink-0 h-full"
      }`}
    >
      {/* Draggable resize handle (disabled when expanded) */}
      {!isExpanded && (
        <div
          className={
            isPositionRight
              ? "w-1 cursor-ew-resize bg-transparent hover:bg-[#7A2A2A]/40 absolute top-0 bottom-0 left-0 z-50 transition-colors"
              : "h-1 cursor-ns-resize bg-transparent hover:bg-[#7A2A2A]/40 absolute top-0 left-0 right-0 z-50 transition-colors"
          }
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const startSize = height;

            const onMouseMove = (moveEvent: MouseEvent) => {
              if (isPositionRight) {
                const deltaX = startX - moveEvent.clientX; // drag left to expand
                const newWidth = Math.max(220, Math.min(800, startSize + deltaX));
                onHeightChange(newWidth);
              } else {
                const deltaY = startY - moveEvent.clientY;
                const newHeight = Math.max(120, Math.min(800, startSize + deltaY));
                onHeightChange(newHeight);
              }
            };

            const onMouseUp = () => {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          }}
        />
      )}

      {/* Tab select headers */}
      <div className="h-9 bg-[#2D2D2D] border-b border-[#1E1E1E] flex items-center justify-between px-3 select-none text-[12px] shrink-0">
        <div className="flex items-center gap-0.5 h-full">
          <button
            onClick={() => handleTabClick("problems")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              localTab === "problems"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Problems</span>
            {problems.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {problems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick("output")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              localTab === "output"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ListCollapse className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          <button
            onClick={() => handleTabClick("debug-console")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              localTab === "debug-console"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug Console</span>
          </button>

          <button
            onClick={() => handleTabClick("terminal")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              localTab === "terminal"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => handleTabClick("ports")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              localTab === "ports"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Ports</span>
          </button>

          <button
            onClick={() => handleTabClick("query-results")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              localTab === "query-results"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ListCollapse className="w-3.5 h-3.5" />
            <span>Query Results</span>
          </button>
        </div>

        {/* Tab-specific tool buttons */}
        <div className="flex items-center gap-2">
          {localTab === "terminal" && (
            <div className="flex items-center gap-2 mr-1">
              {availableShells.length > 0 && (
                <select
                  value={selectedShell}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedShell(val);
                    localStorage.setItem("selected_shell_5080", val);
                    setTerminalOutput((prev) => [
                      ...prev,
                      `\x1b[1;30mShell switched to: ${availableShells.find((s) => s.path === val)?.name || val}\x1b[0m`,
                    ]);
                  }}
                  className="bg-[#2D2D2D] border border-zinc-700 text-gray-300 text-[11px] px-1.5 py-0.5 rounded outline-none cursor-pointer focus:border-[#7A2A2A] hover:bg-zinc-800 transition-all font-mono"
                  title="Select terminal shell profiles"
                >
                  {availableShells.map((sh) => (
                    <option key={sh.path} value={sh.path} className="bg-[#2D2D2D] text-gray-300">
                      {sh.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={clearTerminal}
                className="text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
                title="Clear Terminal Content"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {localTab === "output" && (
            <button
              onClick={onClearOutput}
              className="text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
              title="Clear Auditor Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
            title={isExpanded ? "Collapse Panel" : "Maximize Panel"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
            title="Hide Bottom Panel (Ctrl+`)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] p-3 text-gray-300 font-mono text-[13px] leading-relaxed select-text">
        {localTab === "terminal" && (
          <div className="flex-1 flex min-h-0 font-mono">
            {/* Left: Terminal Output & Interactive Prompt */}
            <div 
              onClick={() => terminalInputRef.current?.focus()}
              className="flex-1 flex flex-col min-h-0 font-mono cursor-text pr-2"
            >
              <div className="flex-1 overflow-auto space-y-1 pr-1 font-mono">
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-5 select-text font-mono min-h-[1.25rem]">
                    {parseAnsiColors(line)}
                  </div>
                ))}
                
                {/* Terminal interactive prompt inline in the scrollable view */}
                <div className="flex items-center gap-1.5 py-1 select-none text-[13px] shrink-0 font-mono">
                  <span className="text-zinc-300 font-mono select-none font-medium">{promptString}</span>
                  <input
                    ref={terminalInputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-transparent text-white outline-none font-mono tracking-wide selection:bg-gray-700 min-w-0"
                    placeholder={isCommandRunning ? "Command executing..." : "Type command and hit Enter..."}
                    disabled={isCommandRunning}
                    autoFocus
                  />
                  {isCommandRunning && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Force terminate - handled gracefully on server-process completion
                        setIsCommandRunning(false);
                        setTerminalOutput(prev => [...prev, "\x1b[1;31mSIGINT (KeyboardInterrupt) initiated locally.\x1b[0m"]);
                      }}
                      className="flex items-center gap-1.5 bg-red-800 text-red-100 hover:bg-red-700 font-sans text-xs px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      <Square className="w-2.5 h-2.5 fill-white" />
                      <span>Kill</span>
                    </button>
                  )}
                </div>

                {isCommandRunning && (
                  <div className="flex items-center gap-2 text-cyan-400 blink py-0.5 font-semibold font-mono animate-pulse">
                    <Play className="w-3 h-3 fill-cyan-400 animate-spin" />
                    <span>Streaming output...</span>
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>

            {/* Right: Active Shells Process Column */}
            <div className="w-48 border-l border-[#010a0e]/65 flex flex-col pl-2 select-none shrink-0 font-sans text-xs bg-[#03171e]/30">
              <div className="flex items-center justify-between py-1 border-b border-[#010a0e]/40 pr-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Active Shells</span>
                <div className="flex items-center gap-1 text-zinc-400">
                  <button 
                    onClick={() => {
                      const newId = (activeTerminals.length + 1).toString();
                      setActiveTerminals(prev => [...prev, { id: newId, name: `${newId}: powershell`, active: false }]);
                      setTerminalOutput(prev => [...prev, `\x1b[1;32mOpened new terminal session [Session ${newId}].\x1b[0m`]);
                    }}
                    className="hover:text-white p-0.5 hover:bg-neutral-800 rounded transition-colors"
                    title="New Terminal"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    className="hover:text-white p-0.5 hover:bg-neutral-800 rounded transition-colors" 
                    title="Split Terminal"
                  >
                    <Columns className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (activeTerminals.length > 1) {
                        const activeIndex = activeTerminals.findIndex(t => t.active);
                        const toKill = activeTerminals[activeIndex >= 0 ? activeIndex : 0];
                        setActiveTerminals(prev => {
                          const next = prev.filter(t => t.id !== toKill.id);
                          next[0].active = true;
                          return next;
                        });
                        setTerminalOutput(prev => [...prev, `\x1b[1;31mTerminated session [Session ${toKill.id}].\x1b[0m`]);
                      } else {
                        setTerminalOutput(prev => [...prev, `\x1b[1;31mCannot terminate the primary shell.\x1b[0m`]);
                      }
                    }}
                    className="hover:text-red-400 p-0.5 hover:bg-neutral-800 rounded transition-colors" 
                    title="Kill Terminal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto py-1.5 space-y-1">
                {activeTerminals.map(term => (
                  <div
                    key={term.id}
                    onClick={() => {
                      setActiveTerminals(prev => prev.map(t => ({ ...t, active: t.id === term.id })));
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all ${
                      term.active 
                        ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border-l-2 border-[#0ea5e9]" 
                        : "hover:bg-neutral-900/40 text-zinc-400"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate font-sans font-medium text-[11px]">{term.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {localTab === "problems" && (
          <div className="space-y-2 font-sans text-[12px] h-full overflow-auto">
            {problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-[13px] select-none h-full">
                <AlertCircle className="w-8 h-8 text-neutral-600 mb-2" />
                <span>Excellent job! No diagnostics errors or code linting issues detected.</span>
                {onApplyLintFix && (
                  <button
                    onClick={onApplyLintFix}
                    className="mt-3 bg-[#7A2A2A] hover:bg-[#632020] text-white px-4 py-1.5 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    Run Code Quality Checks
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2a] max-h-full">
                {problems.map((prob) => (
                  <div key={prob.id} className="flex items-start gap-2.5 py-2 hover:bg-white/2 bg-[#222222] p-2 rounded mb-2 border-l-2 border-red-500">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-200 text-xs">
                        {prob.message}
                      </div>
                      <div className="text-gray-400 font-mono text-[11px] mt-1 flex items-center gap-2">
                        <span className="text-[#AA4A4A] font-semibold">{prob.file}</span>
                        {prob.line && (
                          <span className="text-gray-500 font-medium">[:{prob.line}:{prob.column}]</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {localTab === "output" && (
          <div className="space-y-1 font-mono text-[12.5px] whitespace-pre-wrap select-text selection:bg-gray-700 h-full overflow-auto leading-6">
            {outputLogs.length === 0 ? (
              <span className="text-gray-500 select-none">[System Idle] Listening for codebase diagnostic audits and write operations...</span>
            ) : (
              outputLogs.map((log, idx) => (
                <div key={idx} className="border-b border-gray-900 pb-1 text-gray-400">
                  <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))
            )}
          </div>
        )}

        {localTab === "debug-console" && (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-sans text-xs select-none">
            <Activity className="w-8 h-8 text-neutral-600 mb-2 animate-pulse" />
            <span>No active debug sessions. Press F5 to start.</span>
          </div>
        )}

        {localTab === "ports" && (
          <div className="flex-1 overflow-auto font-sans text-[12px] p-2 space-y-3">
            <div className="text-zinc-400 font-bold border-b border-[#010a0e]/40 pb-1 mb-2 uppercase text-[10px] tracking-wider">Forwarded Ports</div>
            <div className="flex items-center justify-between bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 p-2 rounded max-w-md">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0ea5e9]" />
                <span className="font-semibold text-zinc-200">Port 3000</span>
                <span className="text-zinc-500">→</span>
                <span className="text-sky-400 font-mono">http://localhost:3000</span>
              </div>
              <span className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">Active</span>
            </div>
            <div className="text-zinc-500 text-[11px] italic">Forwarded ports allow previewing web interfaces directly from the container environment.</div>
          </div>
        )}

        {localTab === "query-results" && (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-sans text-xs select-none">
            <span>No database query executions found. Use SQL files to perform DB query operations.</span>
          </div>
        )}
      </div>
    </div>
  );
}
