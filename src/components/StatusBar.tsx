import { GitBranch, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { Problem } from "../types";

interface StatusBarProps {
  branchName?: string;
  problems: Problem[];
  cursorLine: number;
  cursorCol: number;
  language: string;
  autoSaveStatus: string;
  isSaving: boolean;
  onRefreshWorkspace: () => void;
  onOpenCommandPalette: () => void;
}

export default function StatusBar({
  branchName = "main",
  problems,
  cursorLine,
  cursorCol,
  language,
  autoSaveStatus,
  isSaving,
  onRefreshWorkspace,
  onOpenCommandPalette,
}: StatusBarProps) {
  const errors = problems.filter((p) => p.severity === "error").length;
  const warnings = problems.filter((p) => p.severity === "warning").length;

  return (
    <div
      id="statusbar-container"
      className="h-5 bg-[#7A2A2A] text-white flex items-center justify-between px-3 select-none text-[11px] font-sans font-medium shrink-0"
    >
      {/* Left items */}
      <div className="flex items-center gap-4">
        {/* Sync/Refresh button */}
        <button
          onClick={onRefreshWorkspace}
          className="flex items-center gap-1 hover:bg-white/10 active:bg-white/20 h-5 px-1.5 transition-colors cursor-pointer"
          title="Refresh Workspace Filesystem"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
        </button>

        {/* Git Branch */}
        <div className="flex items-center gap-1.5 hover:bg-white/10 h-5 px-1.5 transition-colors cursor-pointer">
          <GitBranch className="w-3.5 h-3.5" />
          <span>{branchName}</span>
        </div>

        {/* Warning / Error Counters */}
        <div className="flex items-center gap-2 hover:bg-white/10 h-5 px-1.5 transition-colors cursor-pointer">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-200 fill-red-850" />
            <span>{errors}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-250 fill-amber-800" />
            <span>{warnings}</span>
          </div>
        </div>

        {/* Sync Status */}
        <span className="text-[10px] text-white/80 select-none">
          {isSaving ? "Saving..." : autoSaveStatus}
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        {/* Command Launcher info */}
        <button
          onClick={onOpenCommandPalette}
          className="hover:bg-white/10 px-2 h-5 flex items-center gap-1 text-[10px] transition-colors"
          title="Launch Command Palette"
        >
          <Layers className="w-3 h-3 text-white/90" />
          <span>F1 Palette</span>
        </button>

        {/* Position */}
        <div className="hover:bg-white/10 px-2 h-5 flex items-center font-mono text-[10.5px]">
          Ln {cursorLine}, Col {cursorCol}
        </div>

        {/* Tab Indent */}
        <div className="hover:bg-white/10 px-2 h-5 flex items-center hidden sm:flex">
          Spaces: 2
        </div>

        {/* Encoding */}
        <div className="hover:bg-white/10 px-2 h-5 flex items-center hidden md:flex">
          UTF-8
        </div>

        {/* Selected Language */}
        <div className="hover:bg-white/10 px-2 h-5 flex items-center font-semibold capitalize bg-white/5 text-[10px]">
          {language || "Plain Text"}
        </div>
      </div>
    </div>
  );
}
