import { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Clock,
  Code2,
  Terminal,
  Cpu,
  Sparkles,
  BookOpen,
  ChevronRight,
  GitBranch,
  Globe,
  FolderPlus,
  FileCode,
  ArrowRight,
} from "lucide-react";

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
}

const QUICKSTART_TASKS = [
  {
    icon: FolderOpen,
    label: "Open a Folder",
    description: "Browse and open any folder on your computer",
    action: "openFolder",
    color: "#4ec9b0",
    shortcut: "Ctrl+K Ctrl+O",
  },
  {
    icon: FolderPlus,
    label: "New Project",
    description: "Scaffold a new React, Node.js or Python project",
    action: "newProject",
    color: "#7a2a2a",
    shortcut: "Ctrl+Shift+N",
  },
  {
    icon: GitBranch,
    label: "Clone Repository",
    description: "Clone a Git repository from a URL",
    action: "clone",
    color: "#569cd6",
    shortcut: "",
  },
  {
    icon: FileCode,
    label: "New File",
    description: "Create a blank file in the current workspace",
    action: "newFile",
    color: "#dcdcaa",
    shortcut: "Ctrl+N",
  },
];

const FEATURES = [
  { icon: Code2, label: "Monaco Editor", desc: "Same engine as VS Code" },
  { icon: Cpu, label: "C++ PieceTree", desc: "Ultra-low latency core" },
  { icon: Terminal, label: "Integrated Terminal", desc: "Run any shell command" },
  { icon: Sparkles, label: "Goldman AI", desc: "Built-in AI copilot" },
];

export default function WelcomeScreen({
  onOpenFolder,
  onNewProject,
  onOpenRecentWorkspace,
  onCloneRepository,
  onNewFile,
  workspaceName,
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

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--theme-editor-bg, #1e1e1e)",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "48px 64px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(135deg, rgba(122,42,42,0.08) 0%, transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7a2a2a, #c0392b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(122,42,42,0.5)",
              fontSize: 20,
              fontWeight: 900,
              color: "white",
              letterSpacing: -1,
            }}
          >
            50
          </div>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--theme-text-primary, #fff)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              5080 IDE
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0", letterSpacing: 1 }}>
              HIGH-PERFORMANCE CODE EDITOR
            </p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--theme-text-muted, rgba(255,255,255,0.5))", margin: 0 }}>
          {workspaceName
            ? `Workspace: ${workspaceName}`
            : "Open a folder or create a new project to get started."}
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "40px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          maxWidth: 1100,
        }}
      >
        {/* Left — Start */}
        <div>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 20px",
            }}
          >
            Get Started
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICKSTART_TASKS.map((task) => (
              <button
                key={task.action}
                onClick={() => handleAction(task.action)}
                onMouseEnter={() => setHovered(task.action)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background:
                    hovered === task.action
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${hovered === task.action ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  width: "100%",
                  transform: hovered === task.action ? "translateX(4px)" : "none",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: `${task.color}18`,
                    border: `1px solid ${task.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <task.icon size={18} style={{ color: task.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--theme-text-primary, #fff)",
                      marginBottom: 2,
                    }}
                  >
                    {task.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    {task.description}
                  </div>
                </div>
                {task.shortcut && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.2)",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.shortcut}
                  </span>
                )}
                <ChevronRight
                  size={14}
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    flexShrink: 0,
                    opacity: hovered === task.action ? 1 : 0,
                    transition: "opacity 0.15s",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Features */}
          <div style={{ marginTop: 40 }}>
            <h2
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: "0 0 16px",
              }}
            >
              Built-in Features
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  style={{
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <f.icon size={15} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Recent */}
        <div>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 20px",
            }}
          >
            Recent Workspaces
          </h2>

          {recentWorkspaces.length === 0 ? (
            <div
              style={{
                padding: "40px 24px",
                textAlign: "center",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 12,
              }}
            >
              <Clock size={32} style={{ color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                No recent workspaces yet.
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: "6px 0 0" }}>
                Open a folder to get started.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recentWorkspaces.slice(0, 8).map((ws) => (
                <button
                  key={ws.path}
                  onClick={() => onOpenRecentWorkspace(ws.path)}
                  onMouseEnter={() => setHovered(`recent-${ws.path}`)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background:
                      hovered === `recent-${ws.path}`
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                    border: "1px solid transparent",
                    borderColor:
                      hovered === `recent-${ws.path}`
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.12s ease",
                  }}
                >
                  <FolderOpen size={15} style={{ color: "#4ec9b0", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--theme-text-primary, #fff)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ws.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.3)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                      }}
                    >
                      {ws.path}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                    {formatTime(ws.lastOpened)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tips */}
          <div
            style={{
              marginTop: 40,
              padding: "20px",
              background: "rgba(122,42,42,0.08)",
              border: "1px solid rgba(122,42,42,0.2)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Sparkles size={14} style={{ color: "#e74c3c" }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Goldman AI Tip
              </span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
              Click the <strong style={{ color: "rgba(255,255,255,0.7)" }}>✦ sparkle icon</strong> in the
              sidebar to open Goldman, your AI coding assistant. Ask it to explain code, write tests, or refactor files.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <p style={{ fontSize: 11, color: "rgba(255,100,100,0.5)", margin: "10px 0 0" }}>
                ⚡ Set GEMINI_API_KEY in settings to enable full AI features.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 64px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          5080 IDE v1.4.2 · Built with Electron + React + Monaco
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Press <kbd style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>Ctrl+Shift+P</kbd> for commands
        </span>
      </div>
    </div>
  );
}
