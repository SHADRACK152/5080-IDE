import React, { useState, useRef, useEffect } from "react";
import { Terminal, AlertCircle, ListCollapse, Play, Square, Trash2, Maximize2, Minimize2, X } from "lucide-react";
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
  workspacePath = "/workspace",
  onApplyLintFix,
  position = "bottom",
}: BottomPanelProps) {
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "\x1b[1;32mWelcome to 5080 IDE Interactive Container Shell!\x1b[0m",
    "Run standard commands directly in your container workspace virtual terminal.",
    "Try: \x1b[1;36mnpm run lint\x1b[0m, \x1b[1;36mcat package.json\x1b[0m, or \x1b[1;36mls -la\x1b[0m",
    ""
  ]);
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableShells, setAvailableShells] = useState<{ name: string; path: string }[]>([]);
  const [selectedShell, setSelectedShell] = useState<string>("");

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

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
        <div className="flex items-center gap-1.5 h-full">
          <button
            onClick={() => onTabChange("terminal")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              activeTab === "terminal"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => onTabChange("problems")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              activeTab === "problems"
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
            onClick={() => onTabChange("output")}
            className={`flex items-center gap-1.5 px-3 h-full border-b transition-colors cursor-pointer text-xs ${
              activeTab === "output"
                ? "border-[#7A2A2A] text-white bg-[#1e1e1e] font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ListCollapse className="w-3.5 h-3.5" />
            <span>System Output</span>
          </button>
        </div>

        {/* Tab-specific tool buttons */}
        <div className="flex items-center gap-2">
          {activeTab === "terminal" && (
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

          {activeTab === "output" && (
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
        {activeTab === "terminal" && (
          <div 
            onClick={() => terminalInputRef.current?.focus()}
            className="flex-1 flex flex-col min-h-0 font-mono cursor-text"
          >
            <div className="flex-1 overflow-auto space-y-1 pr-1 font-mono">
              {terminalOutput.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-5 select-text font-mono min-h-[1.25rem]">
                  {parseAnsiColors(line)}
                </div>
              ))}
              
              {/* Terminal interactive prompt inline in the scrollable view */}
              <div className="flex items-center gap-2 py-1 select-none text-[13px] shrink-0 font-mono">
                <span className="text-emerald-400 font-bold tracking-normal font-mono select-none">root@develop-container:~$</span>
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
        )}

        {activeTab === "problems" && (
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

        {activeTab === "output" && (
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
      </div>
    </div>
  );
}
