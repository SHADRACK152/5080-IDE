import { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Clock,
  Code2,
  Terminal,
  Cpu,
  Sparkles,
  ChevronRight,
  GitBranch,
  Globe,
  FolderPlus,
  FileCode,
  Flame,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { UserProfile } from "../types";

interface RecentWorkspace {
  path: string;
  name: string;
  lastOpened: number;
}

interface WelcomeScreenProps {
  onOpenFolder: () => void;
  onNewProject: () => void;
  onOpenRecentWorkspace: (path: string) => void;
  onCloneRepository?: (url: string) => void;
  onNewFile?: () => void;
  workspaceName?: string;
  currentUser?: UserProfile | null;
}

const QUICKSTART_TASKS = [
  {
    icon: FolderOpen,
    label: "Open Folder",
    description: "Browse and open any directory on your system",
    action: "openFolder",
    color: "#0ea5e9", // Sky accent
    shortcut: "Ctrl+K Ctrl+O",
  },
  {
    icon: FolderPlus,
    label: "New Project",
    description: "Scaffold a new React, Node.js or Python environment",
    action: "newProject",
    color: "#0e9cb2", // Teal accent
    shortcut: "Ctrl+Shift+N",
  },
  {
    icon: GitBranch,
    label: "Clone Repository",
    description: "Clone a Git repository from remote URL",
    action: "clone",
    color: "#a855f7", // Purple accent
    shortcut: "",
  },
  {
    icon: FileCode,
    label: "New File",
    description: "Create a blank workspace text file buffer",
    action: "newFile",
    color: "#fbbf24", // Yellow accent
    shortcut: "Ctrl+N",
  },
];

export default function WelcomeScreen({
  onOpenFolder,
  onNewProject,
  onOpenRecentWorkspace,
  onCloneRepository,
  onNewFile,
  workspaceName,
  currentUser,
}: WelcomeScreenProps) {
  const [recentWorkspaces, setRecentWorkspaces] = useState<RecentWorkspace[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_workspaces_5080");
      if (saved) setRecentWorkspaces(JSON.parse(saved));
    } catch {}
  }, []);

  const handleAction = (action: string) => {
    if (action === "openFolder") onOpenFolder();
    else if (action === "newProject") onNewProject();
    else if (action === "clone" && onCloneRepository) {
      const url = prompt("Enter Git Repository URL to clone (e.g., https://github.com/username/project.git):");
      if (url && url.trim()) {
        onCloneRepository(url.trim());
      }
    } else if (action === "newFile" && onNewFile) {
      onNewFile();
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Default Stats Mockup fallback if user profile metrics are unset
  const stats = currentUser?.stats || {
    commits: 18,
    filesSaved: 142,
    errorsFixed: 36,
    codeLineCount: 8450,
    activeHours: 19,
  };

  return (
    <div className="w-full h-full bg-[var(--theme-editor-bg)] text-[var(--theme-text-primary)] flex flex-col overflow-auto font-sans select-none relative">
      {/* Decorative Glowing Radial Circles for Dashboard depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="p-8 px-12 border-b border-[var(--theme-sidebar-border)] bg-gradient-to-r from-[var(--theme-activitybar-bg)]/20 via-transparent to-transparent flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0e9cb2] to-[#0ea5e9] flex items-center justify-center shadow-lg shadow-sky-950/40 text-white font-extrabold text-sm select-none">
            5080
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              5080 Workspace Cockpit
            </h1>
            <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 tracking-widest uppercase font-semibold">
              Performance Core Engine Active
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 rounded bg-[#0e9cb2]/10 border border-[#0e9cb2]/20 text-[#0ea5e9] text-[10.5px] font-bold uppercase tracking-wider">
            {workspaceName ? `Workspace: ${workspaceName}` : "No Project Active"}
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 p-8 px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl relative z-10">
        
        {/* Left Segment: Quick Actions & Developer Cockpit Stats (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Quickstart Launchpad */}
          <div>
            <h2 className="text-[11px] font-bold text-[var(--theme-text-muted)] tracking-wider uppercase mb-3 select-none">
              Quick Start Launchpad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {QUICKSTART_TASKS.map((task) => (
                <button
                  key={task.action}
                  onClick={() => handleAction(task.action)}
                  onMouseEnter={() => setHovered(task.action)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center gap-3.5 p-3.5 bg-black/20 hover:bg-black/40 border border-[var(--theme-sidebar-border)] hover:border-[#0ea5e9]/40 rounded-xl cursor-pointer text-left transition-all duration-300 transform hover:-translate-y-0.5 shadow-md"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
                    style={{
                      background: `${task.color}15`,
                      border: `1px solid ${task.color}25`,
                    }}
                  >
                    <task.icon size={18} style={{ color: task.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-zinc-100 hover:text-white flex items-center justify-between">
                      <span>{task.label}</span>
                      {task.shortcut && (
                        <span className="text-[9.5px] text-[var(--theme-text-muted-extra)] font-mono font-medium ml-2">
                          {task.shortcut}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 truncate leading-relaxed">
                      {task.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Developer Cockpit Statistics */}
          <div>
            <h2 className="text-[11px] font-bold text-[var(--theme-text-muted)] tracking-wider uppercase mb-3 select-none flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Developer statistics cockpit</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Commits */}
              <div className="bg-black/15 border border-[var(--theme-sidebar-border)] rounded-xl p-3.5 text-center flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#0ea5e9]/20 transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 bg-sky-500/5 rounded-full filter blur-md pointer-events-none" />
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wide">Git Commits</span>
                <span className="text-xl font-extrabold text-sky-400 mt-1.5 select-all">{stats.commits}</span>
                <span className="text-[9.5px] text-[var(--theme-text-muted-extra)] mt-1 font-sans">Index pushes</span>
              </div>

              {/* Files Edited */}
              <div className="bg-black/15 border border-[var(--theme-sidebar-border)] rounded-xl p-3.5 text-center flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#0ea5e9]/20 transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 bg-teal-500/5 rounded-full filter blur-md pointer-events-none" />
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wide">Saved Buffers</span>
                <span className="text-xl font-extrabold text-teal-400 mt-1.5 select-all">{stats.filesSaved}</span>
                <span className="text-[9.5px] text-[var(--theme-text-muted-extra)] mt-1 font-sans">Files edited</span>
              </div>

              {/* Errors Fixed */}
              <div className="bg-black/15 border border-[var(--theme-sidebar-border)] rounded-xl p-3.5 text-center flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#0ea5e9]/20 transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/5 rounded-full filter blur-md pointer-events-none" />
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wide">Lints Fixed</span>
                <span className="text-xl font-extrabold text-amber-400 mt-1.5 select-all">{stats.errorsFixed}</span>
                <span className="text-[9.5px] text-[var(--theme-text-muted-extra)] mt-1 font-sans">Compiler fixes</span>
              </div>

              {/* Coding hours */}
              <div className="bg-black/15 border border-[var(--theme-sidebar-border)] rounded-xl p-3.5 text-center flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#0ea5e9]/20 transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500/5 rounded-full filter blur-md pointer-events-none" />
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wide">Active Hours</span>
                <span className="text-xl font-extrabold text-purple-400 mt-1.5 select-all">{stats.activeHours}h</span>
                <span className="text-[9.5px] text-[var(--theme-text-muted-extra)] mt-1 font-sans">Coding time</span>
              </div>
            </div>

            {/* Micro lines of code counter block */}
            <div className="mt-3 bg-black/10 border border-[var(--theme-sidebar-border)] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[var(--theme-text-secondary)] shadow-sm">
              <span className="font-semibold text-zinc-300">Workspace Volumetrics:</span>
              <div className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
                <span>{stats.codeLineCount.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500 font-sans font-normal">lines written</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Segment: Recent Workspaces & AI Sidekick Tip (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Recent Workspaces list */}
          <div className="flex-1 flex flex-col min-h-[220px]">
            <h2 className="text-[11px] font-bold text-[var(--theme-text-muted)] tracking-wider uppercase mb-3 select-none flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Recent Workspaces</span>
            </h2>

            {recentWorkspaces.length === 0 ? (
              <div className="flex-1 border border-dashed border-[var(--theme-sidebar-border)] bg-black/5 rounded-xl p-6 text-center flex flex-col items-center justify-center">
                <Clock size={28} className="text-zinc-600 mb-2" />
                <p className="text-xs text-[var(--theme-text-muted)] font-medium">No recent workspaces indexed.</p>
                <p className="text-[10px] text-[var(--theme-text-muted-extra)] mt-1">Open folders to register workspace shortcuts.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto max-h-[240px] space-y-1.5 border border-[var(--theme-sidebar-border)] bg-black/5 rounded-xl p-2.5 scrollbar-thin">
                {recentWorkspaces.slice(0, 5).map((ws) => (
                  <button
                    key={ws.path}
                    onClick={() => onOpenRecentWorkspace(ws.path)}
                    onMouseEnter={() => setHovered(`recent-${ws.path}`)}
                    onMouseLeave={() => setHovered(null)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/30 border border-transparent hover:border-[var(--theme-sidebar-border)] rounded-lg cursor-pointer text-left transition-all duration-200"
                  >
                    <FolderOpen size={14} className="text-[#0e9cb2] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-zinc-200 hover:text-white truncate">
                        {ws.name}
                      </div>
                      <div className="text-[10px] text-[var(--theme-text-muted)] font-mono truncate mt-0.5 select-all">
                        {ws.path}
                      </div>
                    </div>
                    <span className="text-[9px] text-[var(--theme-text-muted-extra)] font-medium whitespace-nowrap shrink-0 ml-2">
                      {formatTime(ws.lastOpened)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Goldman AI Information Alert Card */}
          <div className="bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl p-4.5 space-y-2 relative shadow-md">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#0ea5e9] animate-pulse" />
              <span className="text-[10.5px] font-extrabold uppercase text-[#0ea5e9] tracking-wider select-none">
                AI Copilot Service Active
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--theme-text-secondary)] leading-relaxed font-sans font-medium">
              Click the <strong className="text-zinc-200">Bot 🤖</strong> or <strong className="text-zinc-200">Sparkle ✦</strong> buttons to engage Goldman agents. They audit compiler errors, review modifications, and apply drop-in code fixes automatically.
            </p>
            <div className="pt-1.5 border-t border-[#0ea5e9]/10 flex items-center justify-between text-[10px] text-[var(--theme-text-muted)]">
              <span>Model Selection active inside Chat desk.</span>
              {process.env.NODE_ENV !== "production" && (
                <span className="text-[#0e9cb2] font-semibold font-mono">HMR Loaded</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Cockpit Footer */}
      <div className="p-4 px-12 border-t border-[var(--theme-sidebar-border)] bg-black/10 flex items-center justify-between text-[10.5px] text-[var(--theme-text-muted-extra)] shrink-0 font-sans">
        <span>
          5080 IDE v1.4.2 · Electron + React + PieceTree Core
        </span>
        <div className="flex items-center gap-3">
          <span>Press <kbd className="bg-black/35 px-1.5 py-0.5 rounded font-mono text-[9px] border border-zinc-800">F1</kbd> for command palette</span>
          <span>Press <kbd className="bg-black/35 px-1.5 py-0.5 rounded font-mono text-[9px] border border-zinc-800">Ctrl+B</kbd> for sidebar</span>
        </div>
      </div>
    </div>
  );
}
