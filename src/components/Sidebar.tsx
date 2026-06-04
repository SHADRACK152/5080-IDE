import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  File,
  ChevronDown,
  ChevronRight,
  Plus,
  FolderPlus,
  Trash2,
  RefreshCw,
  Search,
  MessageSquare,
  Cpu,
  GitCommit,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Upload,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Image,
  Bot,
  Key,
  Eye,
  EyeOff,
  Copy,
  FilePen,
  Play,
  ShieldCheck,
  Wrench,
  TestTube2,
  BookOpen,
  Bug,
  Lightbulb,
  CheckCheck,
  ChevronUp,
  Settings
} from "lucide-react";
import { FileNode, GitChange, SearchResult, ChatMessage, WorkspaceSettings, UserProfile, CustomThemeColors, LLMProvider, AIProviderKeys, AgentTask, AgentTaskType } from "../types";
import ExtensionsTab from "./ExtensionsTab";
import ProfileTab from "./ProfileTab";
import PackagesTab from "./PackagesTab";

interface SidebarProps {
  width: number;
  onWidthChange: (w: number) => void;
  isVisible: boolean;
  activeTab: "explorer" | "search" | "git" | "gemini" | "agents" | "settings" | "extensions" | "profile" | "packages";

  // Explorer params
  fileTree: FileNode[];
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onSelectFile: (path: string) => void;
  onAddFile: (parentPath: string, name: string) => void;
  onAddFolder: (parentPath: string, name: string) => void;
  onDeletePath: (path: string) => void;
  onRefreshExplorer: () => void;
  onOpenNewProject?: () => void;
  noFolderOpen?: boolean;
  onOpenFolder?: () => void;

  // Search params
  searchResults: SearchResult[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching: boolean;
  onPerformSearch: (caseSensitive: boolean, wholeWord: boolean, regex: boolean) => void;

  // Git params
  gitBranch: string;
  gitChanges: GitChange[];
  onCommitGit: (msg: string) => void;
  isGitSyncing: boolean;

  // Gemini Chat params
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isAIPending: boolean;

  // Settings params
  settings: WorkspaceSettings;
  onUpdateSetting: (category: "editor" | "workbench" | "ai", key: string, value: any) => void;
  customTheme: CustomThemeColors;
  onUpdateCustomTheme: (colors: Partial<CustomThemeColors>) => void;
  onSaveCustomTheme: (name: string, colors: CustomThemeColors) => void;
  savedThemes: Array<{ id: string; name: string; colors: CustomThemeColors }>;
  onLoadCustomTheme: (colors: CustomThemeColors, id: string) => void;
  onDeleteCustomTheme: (id: string) => void;

  // AI Provider / Agent params
  aiKeys: AIProviderKeys;
  aiProvider: LLMProvider;
  onUpdateAIKeys: (keys: Partial<AIProviderKeys>) => void;
  onUpdateAIProvider: (provider: LLMProvider) => void;
  activeFile?: { path: string; relativePath: string; content: string; name: string } | null;
  onApplyAgentResult?: (content: string, filePath: string) => void;

  // Dynamic model configuration props
  selectedModelId: string;
  onSelectModel: (modelId: string, provider: LLMProvider) => void;
  customModels: any[];
  onAddCustomModel: (model: any) => void;
  onDeleteCustomModel: (id: string) => void;

  // Extensions params
  onApplyTheme?: (themeId: string, themeConfig: { base: string; rules: any[]; colors: any[] }) => void;
  onAddSnippet?: (trigger: string, body: string) => void;
  activeThemeId?: string;
  onActiveThemeChange?: (themeId: string) => void;
  onEnableVimMode?: (enabled: boolean) => void;

  // Personalization/Profile params
  currentUser: UserProfile | null;
  onLogin: (provider: "google" | "github", customName?: string, customEmail?: string, customRole?: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  logOutput: (msg: string) => void;
}

const getFileAndFolderAppearance = (
  name: string,
  isFolder: boolean,
  isExpanded: boolean,
  theme: "vscode-classic" | "material-vibrant" | "cyberpunk-neon" | "monochrome-slate" | "minimalist-wire" | "retro-gold"
) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";

  // 1. VS CODE CLASSIC Theme
  if (theme === "vscode-classic") {
    if (isFolder) {
      return {
        Icon: isExpanded ? FolderOpen : Folder,
        iconColor: "text-amber-500 fill-amber-500/10",
        labelColor: "text-zinc-200 group-hover:text-white"
      };
    }
    if (ext === "ts" || ext === "tsx") {
      return { Icon: FileCode, iconColor: "text-sky-400", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    if (ext === "js" || ext === "jsx") {
      return { Icon: FileCode, iconColor: "text-yellow-400", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    if (ext === "json" || ext === "lock") {
      return { Icon: FileJson, iconColor: "text-amber-500", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    if (ext === "css" || ext === "scss" || ext === "less") {
      return { Icon: FileCode, iconColor: "text-cyan-400", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    if (ext === "html") {
      return { Icon: FileCode, iconColor: "text-orange-500", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    if (ext === "md") {
      return { Icon: FileText, iconColor: "text-indigo-400", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "svg" || ext === "gif") {
      return { Icon: Image, iconColor: "text-teal-400", labelColor: "text-zinc-300 group-hover:text-white" };
    }
    return { Icon: File, iconColor: "text-zinc-400", labelColor: "text-zinc-300 group-hover:text-white" };
  }

  // 2. MATERIAL VIBRANT Theme
  if (theme === "material-vibrant") {
    if (isFolder) {
      return {
        Icon: isExpanded ? FolderOpen : Folder,
        iconColor: "text-emerald-400 fill-emerald-500/10",
        labelColor: "text-emerald-100 group-hover:text-emerald-300 font-medium"
      };
    }
    if (ext === "ts" || ext === "tsx") {
      return { Icon: FileCode, iconColor: "text-[#0ea5e9]", labelColor: "text-sky-100 group-hover:text-[#0ea5e9]" };
    }
    if (ext === "js" || ext === "jsx") {
      return { Icon: FileCode, iconColor: "text-[#f59e0b]", labelColor: "text-amber-100 group-hover:text-[#f59e0b]" };
    }
    if (ext === "json" || ext === "lock") {
      return { Icon: FileJson, iconColor: "text-[#10b981]", labelColor: "text-emerald-100 group-hover:text-[#10b981]" };
    }
    if (ext === "css" || ext === "scss" || ext === "less") {
      return { Icon: FileCode, iconColor: "text-[#ec4899]", labelColor: "text-pink-100 group-hover:text-[#ec4899]" };
    }
    if (ext === "html") {
      return { Icon: FileCode, iconColor: "text-[#ef4444]", labelColor: "text-rose-100 group-hover:text-[#ef4444]" };
    }
    if (ext === "md") {
      return { Icon: FileText, iconColor: "text-[#8b5cf6]", labelColor: "text-violet-100 group-hover:text-[#8b5cf6]" };
    }
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "svg" || ext === "gif") {
      return { Icon: Image, iconColor: "text-[#f43f5e]", labelColor: "text-rose-100 group-hover:text-[#f43f5e]" };
    }
    return { Icon: File, iconColor: "text-zinc-300", labelColor: "text-zinc-100 group-hover:text-white" };
  }

  // 3. CYBERPUNK NEON Theme
  if (theme === "cyberpunk-neon") {
    if (isFolder) {
      return {
        Icon: isExpanded ? FolderOpen : Folder,
        iconColor: "text-[#ff007f] drop-shadow-[0_0_8px_rgba(255,0,127,0.5)] fill-[#ff007f]/25",
        labelColor: "text-[#ff00e4] hover:text-white font-mono"
      };
    }
    if (ext === "ts" || ext === "tsx") {
      return { Icon: FileCode, iconColor: "text-[#00f5ff] drop-shadow-[0_0_6px_rgba(0,245,255,0.4)]", labelColor: "text-[#00f5ff]/90 group-hover:text-white" };
    }
    if (ext === "js" || ext === "jsx") {
      return { Icon: FileCode, iconColor: "text-[#d4ff00] drop-shadow-[0_0_6px_rgba(212,255,0,0.4)]", labelColor: "text-[#d4ff00]/90 group-hover:text-white" };
    }
    if (ext === "json" || ext === "lock") {
      return { Icon: FileJson, iconColor: "text-[#bd00ff] drop-shadow-[0_0_6px_rgba(189,0,255,0.4)]", labelColor: "text-[#bd00ff]/90 group-hover:text-white" };
    }
    if (ext === "css" || ext === "scss" || ext === "less") {
      return { Icon: FileCode, iconColor: "text-[#ff00e4] drop-shadow-[0_0_6px_rgba(255,0,228,0.4)]", labelColor: "text-[#ff00e4]/90 group-hover:text-white" };
    }
    if (ext === "html") {
      return { Icon: FileCode, iconColor: "text-[#ff2a2a] drop-shadow-[0_0_6px_rgba(255,42,42,0.4)]", labelColor: "text-[#ff2a2a]/90 group-hover:text-white" };
    }
    if (ext === "md") {
      return { Icon: FileText, iconColor: "text-[#00ff66] drop-shadow-[0_0_6px_rgba(0,255,102,0.4)]", labelColor: "text-[#00ff66]/95 group-hover:text-white" };
    }
    return { Icon: File, iconColor: "text-zinc-400", labelColor: "text-zinc-300 group-hover:text-white" };
  }

  // 4. MONOCHROME SLATE Theme
  if (theme === "monochrome-slate") {
    if (isFolder) {
      return {
        Icon: isExpanded ? FolderOpen : Folder,
        iconColor: "text-slate-500 fill-slate-300/10",
        labelColor: "text-slate-300 group-hover:text-slate-100"
      };
    }
    if (ext === "ts" || ext === "tsx" || ext === "js" || ext === "jsx") {
      return { Icon: FileCode, iconColor: "text-slate-400", labelColor: "text-slate-300 group-hover:text-white" };
    }
    if (ext === "json" || ext === "lock") {
      return { Icon: FileJson, iconColor: "text-slate-500", labelColor: "text-slate-300 group-hover:text-white" };
    }
    if (ext === "css" || ext === "html" || ext === "md") {
      return { Icon: FileCode, iconColor: "text-slate-400", labelColor: "text-slate-300 group-hover:text-white" };
    }
    return { Icon: File, iconColor: "text-slate-600", labelColor: "text-slate-400 group-hover:text-slate-200" };
  }

  // 5. MINIMALIST WIRE Theme
  if (theme === "minimalist-wire") {
    if (isFolder) {
      return {
        Icon: Folder,
        iconColor: "text-zinc-500",
        labelColor: "text-zinc-400 group-hover:text-zinc-200 font-light"
      };
    }
    return {
      Icon: File,
      iconColor: "text-zinc-500",
      labelColor: "text-zinc-400 group-hover:text-zinc-200 font-light"
    };
  }

  // 6. RETRO GOLD Theme
  if (theme === "retro-gold") {
    if (isFolder) {
      return {
        Icon: isExpanded ? FolderOpen : Folder,
        iconColor: "text-amber-700/80 fill-amber-600/10",
        labelColor: "text-[#fef08a] group-hover:text-yellow-400 italic"
      };
    }
    if (ext === "ts" || ext === "tsx") {
      return { Icon: FileCode, iconColor: "text-[#7c8f7d]", labelColor: "text-[#fed7aa] group-hover:text-amber-200" };
    }
    if (ext === "js" || ext === "jsx") {
      return { Icon: FileCode, iconColor: "text-[#d9a05b]", labelColor: "text-[#fef08a] group-hover:text-yellow-100" };
    }
    if (ext === "json" || ext === "lock") {
      return { Icon: FileJson, iconColor: "text-[#b45309]", labelColor: "text-amber-200 group-hover:text-amber-100" };
    }
    if (ext === "css" || ext === "html") {
      return { Icon: FileCode, iconColor: "text-[#c2410c]", labelColor: "text-orange-200 group-hover:text-white" };
    }
    if (ext === "md") {
      return { Icon: FileText, iconColor: "text-[#e6c280]", labelColor: "text-gray-100 group-hover:text-white" };
    }
    return { Icon: File, iconColor: "text-amber-800/60", labelColor: "text-amber-100/90 group-hover:text-white" };
  }

  // Fallback
  return {
    Icon: isFolder ? (isExpanded ? FolderOpen : Folder) : File,
    iconColor: isFolder ? "text-amber-500" : "text-zinc-400",
    labelColor: "text-zinc-300 group-hover:text-white"
  };
};

export default function Sidebar({
  width,
  onWidthChange,
  isVisible,
  activeTab,

  // Explorer
  fileTree,
  expandedPaths,
  onToggleExpand,
  onSelectFile,
  onAddFile,
  onAddFolder,
  onDeletePath,
  onRefreshExplorer,
  noFolderOpen,
  onOpenFolder,

  // Search
  searchResults,
  searchQuery,
  setSearchQuery,
  isSearching,
  onPerformSearch,

  // Git
  gitBranch,
  gitChanges,
  onCommitGit,
  isGitSyncing,

  // Gemini
  chatMessages,
  onSendMessage,
  isAIPending,

  // Settings
  settings,
  onUpdateSetting,
  onOpenNewProject,
  customTheme,
  onUpdateCustomTheme,
  onSaveCustomTheme,
  savedThemes,
  onLoadCustomTheme,
  onDeleteCustomTheme,

  // AI Providers
  aiKeys,
  aiProvider,
  onUpdateAIKeys,
  onUpdateAIProvider,
  activeFile,
  onApplyAgentResult,

  selectedModelId,
  onSelectModel,
  customModels,
  onAddCustomModel,
  onDeleteCustomModel,

  // Extensions
  onApplyTheme,
  onAddSnippet,
  activeThemeId,
  onActiveThemeChange,
  onEnableVimMode,

  // Personalization
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  logOutput,
}: SidebarProps) {
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [addingToPath, setAddingToPath] = useState<{ path: string; type: "file" | "folder" } | null>(null);
  const [gitCommitMessage, setGitCommitMessage] = useState("");
  const [geminiInput, setGeminiInput] = useState("");
  const [isOutlineExpanded, setIsOutlineExpanded] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  // Custom theme maker selections
  const [colorGroup, setColorGroup] = useState<"editor" | "syntax" | "workbench">("editor");
  const [themeSaveName, setThemeSaveName] = useState("");

  // Search filters
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Upload and Drag & Drop states
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // AI Key visibility toggles
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [localKeys, setLocalKeys] = useState<AIProviderKeys>(aiKeys);
  const [keysSaved, setKeysSaved] = useState(false);

  // Agent state
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [copiedTask, setCopiedTask] = useState<string | null>(null);
  const [agentCustomPrompt, setAgentCustomPrompt] = useState("");

  // Custom Model Configuration States
  const [isSidebarModelListOpen, setIsSidebarModelListOpen] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  const [customModelIdVal, setCustomModelIdVal] = useState("");
  const [customModelProvider, setCustomModelProvider] = useState<LLMProvider>("openai");
  const [customModelSpeed, setCustomModelSpeed] = useState<"Fast" | "Medium" | "Slow">("Fast");
  const sidebarModelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropup when clicking outside in sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarModelDropdownRef.current && !sidebarModelDropdownRef.current.contains(event.target as Node)) {
        setIsSidebarModelListOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUploadFiles = async (files: FileList, targetParentPath = "") => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(`Preparing to upload ${files.length} items...`);
    let uploadedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;
        const destinationPath = targetParentPath ? `${targetParentPath}/${relativePath}` : relativePath;

        setUploadStatus(`Uploading: ${file.name} (${i + 1}/${files.length})`);

        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const result = e.target?.result as string;
            if (result) {
              const base64 = result.split(",")[1];
              try {
                const res = await fetch("/api/fs/write", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    filePath: destinationPath,
                    content: base64,
                    encoding: "base64",
                  }),
                });
                if (res.ok) {
                  uploadedCount++;
                } else {
                  const data = await res.json();
                  console.error(`Upload error details: ${data.error}`);
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            } else {
              resolve();
            }
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        });
      }
      onRefreshExplorer();
      setUploadStatus(`Upload of ${uploadedCount} file(s) completed!`);
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    setIsUploading(true);
    setUploadStatus("Processing dropped files...");
    let uploadedCount = 0;

    const uploadFileEntry = (file: File, relativePath: string): Promise<void> => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          if (result) {
            const base64 = result.split(",")[1];
            try {
              const res = await fetch("/api/fs/write", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  filePath: relativePath,
                  content: base64,
                  encoding: "base64",
                }),
              });
              if (res.ok) uploadedCount++;
            } catch (err) {
              console.error(err);
            }
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
    };

    const traverseEntry = async (entry: any, pathPrefix = "") => {
      if (entry.isFile) {
        await new Promise<void>((resolve) => {
          entry.file(async (file: File) => {
            const dest = pathPrefix ? `${pathPrefix}/${file.name}` : file.name;
            setUploadStatus(`Writing file: ${dest}`);
            await uploadFileEntry(file, dest);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const newPrefix = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;

        setUploadStatus(`Structuring folder: ${newPrefix}`);
        // Create matching folder structure on disk
        await fetch("/api/fs/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "directory", name: entry.name, parentPath: pathPrefix }),
        });

        const getEntries = (): Promise<any[]> => {
          return new Promise<any[]>((resolve) => {
            dirReader.readEntries((entries: any[]) => resolve(entries));
          });
        };

        let entries = await getEntries();
        while (entries.length > 0) {
          for (const ent of entries) {
            await traverseEntry(ent, newPrefix);
          }
          entries = await getEntries();
        }
      }
    };

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await traverseEntry(entry);
          } else {
            const file = item.getAsFile();
            if (file) {
              await uploadFileEntry(file, file.name);
            }
          }
        }
      }
      onRefreshExplorer();
      setUploadStatus(`Import successful! Added ${uploadedCount} items.`);
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err: any) {
      setUploadStatus(`Import error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isVisible) return null;

  // Helper to render tree nodes recursively
  const renderTreeNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isFolder = node.type === "directory";
    const fileTheme = settings.workbench.fileIconTheme || "vscode-classic";

    const { Icon, iconColor, labelColor } = getFileAndFolderAppearance(
      node.name,
      isFolder,
      isExpanded,
      fileTheme
    );

    // Compute Git change status
    const gitStatus = (() => {
      if (!gitChanges) return null;
      const match = gitChanges.find(c => c.path === node.path || c.relativePath === node.relativePath);
      if (!match) return null;
      const s = match.status.trim();
      if (s === "M" || s.toUpperCase() === "MODIFIED") return { text: "M", color: "text-[#fbbf24]" }; // Amber
      if (s === "??" || s === "U" || s.toUpperCase() === "UNTRACKED") return { text: "U", color: "text-[#34d399]" }; // Green
      if (s === "A" || s.toUpperCase() === "ADDED") return { text: "A", color: "text-[#34d399]" }; // Green
      return { text: s, color: "text-[#34d399]" };
    })();

    return (
      <div key={node.path} className="select-none font-sans relative">
        {/* Node strip */}
        <div
          className="flex items-center justify-between group h-6.5 text-[12.5px] hover:bg-[#2a2d2e]/60 px-2 rounded cursor-pointer transition-colors relative"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              onToggleExpand(node.path);
            } else {
              onSelectFile(node.path);
            }
          }}
        >
          {/* Indentation guide lines */}
          {Array.from({ length: depth }).map((_, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-r border-[#204a57]/20 pointer-events-none"
              style={{ left: `${idx * 12 + 14}px`, width: "1px" }}
            />
          ))}

          <div className="flex items-center gap-1.5 truncate flex-1 mr-2">
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              </>
            ) : (
              <>
                <div className="w-3.5 shrink-0" /> {/* Spacer spacer */}
                <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              </>
            )}
            <span className={`truncate ${labelColor} font-sans`}>{node.name}</span>
          </div>

          {/* Git Status Badge */}
          {gitStatus && (
            <span className={`text-[10px] font-bold mr-1 w-4 h-4 flex items-center justify-center shrink-0 ${gitStatus.color} group-hover:hidden`}>
              {gitStatus.text}
            </span>
          )}

          {/* Quick hover buttons to add or delete */}
          <div className="hidden group-hover:flex items-center gap-1 absolute right-2 z-10 bg-[var(--theme-sidebar-bg)] pl-1.5">
            {isFolder && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingToPath({ path: node.path, type: "file" });
                  }}
                  className="p-0.5 hover:bg-neutral-800 rounded text-gray-400 hover:text-white"
                  title="New File..."
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingToPath({ path: node.path, type: "folder" });
                  }}
                  className="p-0.5 hover:bg-neutral-800 rounded text-gray-400 hover:text-white"
                  title="New Folder..."
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Do you want to delete ${node.name}? This cannot be undone.`)) {
                  onDeletePath(node.path);
                }
              }}
              className="p-0.5 hover:bg-neutral-800 rounded text-red-400 hover:text-red-200"
              title="Delete Item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Create Input directly under node */}
        {addingToPath?.path === node.path && (
          <div className="pl-6 pr-2 py-1 bg-neutral-900 border-l border-[#7A2A2A]" style={{ paddingLeft: `${depth * 12 + 24}px` }}>
            <div className="flex items-center gap-1.5 font-sans">
              <input
                type="text"
                value={addingToPath.type === "file" ? newFileName : newFolderName}
                onChange={(e) => {
                  if (addingToPath.type === "file") setNewFileName(e.target.value);
                  else setNewFolderName(e.target.value);
                }}
                className="flex-1 bg-black text-white text-[11px] px-1.5 py-1 rounded outline-none border border-[#7A2A2A] font-mono"
                placeholder={addingToPath.type === "file" ? "file.ts..." : "folder..."}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (addingToPath.type === "file") {
                      if (newFileName.trim()) {
                        onAddFile(node.path, newFileName.trim());
                        setNewFileName("");
                        setAddingToPath(null);
                      }
                    } else {
                      if (newFolderName.trim()) {
                        onAddFolder(node.path, newFolderName.trim());
                        setNewFolderName("");
                        setAddingToPath(null);
                      }
                    }
                  } else if (e.key === "Escape") {
                    setAddingToPath(null);
                  }
                }}
              />
              <button
                onClick={() => setAddingToPath(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inner children tree */}
        {isFolder && isExpanded && node.children && (
          <div className="mt-0.5">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPerformSearch(caseSensitive, wholeWord, useRegex);
  };

  const handleGeminiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiInput.trim()) return;
    onSendMessage(geminiInput.trim());
    setGeminiInput("");
  };

  const activeCopilotPreset = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div
      id="sidebar-container"
      style={{ width: `${width}px` }}
      className="bg-[#252526] border-r border-[#1E1E1E] flex flex-col h-full shrink-0 relative overflow-hidden"
    >
      {/* Resizable handle sidebar drag */}
      <div
        className="w-1 cursor-col-resize hover:bg-[#7A2A2A]/40 absolute right-0 top-0 bottom-0 z-50 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = width;

          const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            onWidthChange(Math.max(160, Math.min(500, startWidth + deltaX)));
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      />

      {/* Panel Top label */}
      <div className="h-9 px-3 border-b border-[#1E1E1E] flex items-center justify-between select-none shrink-0 bg-[#38383833]">
        <span className="text-zinc-400 font-bold uppercase tracking-tight text-[11px]">
          {activeTab === "explorer" && "Workspace Explorer"}
          {activeTab === "search" && "Global Fuzzy Search"}
          {activeTab === "git" && "Source Control (Git)"}
          {activeTab === "gemini" && "Gemini AI Sidekick"}
          {activeTab === "settings" && "IDE Preferences"}
          {activeTab === "extensions" && "Extensions & Custom Themes"}
        </span>

        {activeTab === "explorer" && (
          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={() => setAddingToPath({ path: "", type: "file" })}
              className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="New File at root..."
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAddingToPath({ path: "", type: "folder" })}
              className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="New Folder at root..."
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            {onOpenNewProject && (
              <button
                onClick={onOpenNewProject}
                className="p-1 text-rose-400 hover:text-rose-200 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Scaffold New Project template..."
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Upload file(s) from computer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Upload folder from computer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRefreshExplorer}
              className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Refresh Workspace Tree"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Internal scrollable container */}
      <div className="flex-1 overflow-auto p-2 text-gray-300">
        {/* 1. EXPLORER VIEW */}
        {activeTab === "explorer" && (
          <div 
            className="flex flex-col h-full space-y-1 font-sans relative select-none"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Native browser upload elements, hidden but linked safely */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  handleUploadFiles(e.target.files);
                }
              }}
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  handleUploadFiles(e.target.files);
                }
              }}
              {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
              className="hidden"
            />

            {addingToPath === null ? (
              <div className="flex items-center justify-between bg-[#38383833] py-1 px-2 text-[#858585] text-[10.5px] font-bold uppercase tracking-wider mb-1.5 select-none border-t border-b border-[#1E1E1E]">
                <span>Open Codebase</span>
                {isUploading && (
                  <span className="text-amber-400 font-medium animate-pulse text-[10px]">Syncing Drive...</span>
                )}
              </div>
            ) : addingToPath.path === "" && (
              /* Root-level new file / folder input — shown when header toolbar + / folder icons are clicked */
              <div className="mx-1 mb-2 px-2 py-1.5 bg-neutral-900 border border-[#7A2A2A] rounded">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 select-none">
                  <span>{addingToPath.type === "file" ? "📄 New file at workspace root" : "📁 New folder at workspace root"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={addingToPath.type === "file" ? newFileName : newFolderName}
                    onChange={(e) => {
                      if (addingToPath.type === "file") setNewFileName(e.target.value);
                      else setNewFolderName(e.target.value);
                    }}
                    className="flex-1 bg-black text-white text-[11px] px-1.5 py-1 rounded outline-none border border-[#7A2A2A] font-mono"
                    placeholder={addingToPath.type === "file" ? "filename.ts" : "folder-name"}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (addingToPath.type === "file") {
                          if (newFileName.trim()) {
                            onAddFile("", newFileName.trim());
                            setNewFileName("");
                            setAddingToPath(null);
                          }
                        } else {
                          if (newFolderName.trim()) {
                            onAddFolder("", newFolderName.trim());
                            setNewFolderName("");
                            setAddingToPath(null);
                          }
                        }
                      } else if (e.key === "Escape") {
                        setAddingToPath(null);
                        if (addingToPath.type === "file") setNewFileName("");
                        else setNewFolderName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = addingToPath.type === "file" ? newFileName.trim() : newFolderName.trim();
                      if (val) {
                        if (addingToPath.type === "file") {
                          onAddFile("", val);
                          setNewFileName("");
                        } else {
                          onAddFolder("", val);
                          setNewFolderName("");
                        }
                        setAddingToPath(null);
                      }
                    }}
                    className="text-[11px] bg-[#7A2A2A] hover:bg-[#632020] text-white px-2 py-1 rounded transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToPath(null);
                      setNewFileName("");
                      setNewFolderName("");
                    }}
                    className="text-[11px] text-gray-400 hover:text-white px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Uploading progress status bar */}
            {uploadStatus && (
              <div className="mx-1 mb-2 p-2 bg-neutral-900/80 border border-neutral-800 rounded text-[11px] text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#7A2A2A]/20 border-t-[#7A2A2A] rounded-full animate-spin shrink-0" />
                <span className="truncate">{uploadStatus}</span>
              </div>
            )}

            {noFolderOpen ? (
              <div className="p-4 rounded border border-dashed border-neutral-800 bg-[#38383811]/40 text-center space-y-4 my-4 mx-2 select-none font-sans">
                <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center mx-auto text-zinc-400">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-200">No Folder Opened</h3>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-[180px] mx-auto leading-relaxed">
                    You have not yet opened a folder. Open a folder to start editing files.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={onOpenFolder}
                    className="w-full bg-[#7A2A2A] hover:bg-[#632020] text-gray-100 text-[10.5px] font-semibold py-1.5 rounded cursor-pointer transition-colors"
                  >
                    Open Folder
                  </button>
                  {onOpenNewProject && (
                    <button
                      type="button"
                      onClick={onOpenNewProject}
                      className="w-full bg-neutral-850 hover:bg-neutral-800 text-gray-200 text-[10.5px] font-semibold py-1.5 rounded cursor-pointer transition-colors border border-neutral-800"
                    >
                      New Project...
                    </button>
                  )}
                </div>
              </div>
            ) : fileTree.length === 0 ? (
              <div className="p-4 rounded border border-dashed border-neutral-800 bg-[#38383811] text-center space-y-4 my-4 mx-2 select-none">
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-rose-300/80">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-200">Workspace is empty</h3>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-[180px] mx-auto leading-relaxed">
                    Scaffold template projects or import files/directories directly from your local computer.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  {onOpenNewProject && (
                    <button
                      type="button"
                      onClick={onOpenNewProject}
                      className="w-full bg-[#7A2A2A] hover:bg-[#632020] text-gray-100 text-[10.5px] font-semibold py-1.5 rounded cursor-pointer transition-colors"
                    >
                      Scaffold New Project
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-[10.5px] font-semibold py-1.5 rounded cursor-pointer transition-colors"
                  >
                    Upload Files
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-[10.5px] font-semibold py-1.5 rounded cursor-pointer transition-colors"
                  >
                    Upload Project Folder
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 font-medium pt-2 border-t border-neutral-800/40">
                  Or drag & drop files here
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {fileTree.map((rootNode) => renderTreeNode(rootNode))}
              </div>
            )}

            {/* Outline collapsible section */}
            <div className="mt-4 border-t border-[#1E1E1E]">
              <button
                type="button"
                onClick={() => setIsOutlineExpanded(!isOutlineExpanded)}
                className="w-full flex items-center justify-between py-1 px-1.5 hover:bg-[#38383833] text-[#858585] text-[10px] font-bold uppercase tracking-wider select-none border-b border-[#1E1E1E]"
              >
                <div className="flex items-center gap-1.5">
                  {isOutlineExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Outline</span>
                </div>
              </button>
              {isOutlineExpanded && (
                <div className="p-3 text-[11px] text-zinc-500 italic select-none">
                  No symbols found in this file.
                </div>
              )}
            </div>

            {/* Timeline collapsible section */}
            <div className="border-t border-[#1E1E1E]">
              <button
                type="button"
                onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                className="w-full flex items-center justify-between py-1 px-1.5 hover:bg-[#38383833] text-[#858585] text-[10px] font-bold uppercase tracking-wider select-none border-b border-[#1E1E1E]"
              >
                <div className="flex items-center gap-1.5">
                  {isTimelineExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Timeline</span>
                </div>
              </button>
              {isTimelineExpanded && (
                <div className="p-3 text-[11px] text-zinc-500 italic select-none">
                  No timeline history loaded.
                </div>
              )}
            </div>

            {/* Dropping hover view handler overlay */}
            {isDraggingOver && (
              <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-[#7A2A2A] rounded m-1 transition-all">
                <Upload className="w-8 h-8 text-rose-400 animate-bounce mb-2" />
                <span className="text-zinc-100 font-bold block text-xs">Import to Workspace</span>
                <span className="text-[10.5px] text-gray-400 mt-1 leading-relaxed max-w-[170px]">
                  Drop files or folders here to write them directly into your container environment!
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. SEARCH VIEW */}
        {activeTab === "search" && (
          <div className="flex flex-col h-full space-y-4 font-sans text-[12px]">
            <form onSubmit={handleSearchSubmit} className="space-y-2 font-sans">
              <div className="relative font-sans">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded pl-8 pr-2 py-1 px-1.5 text-white placeholder-gray-500 outline-none text-xs focus:border-[#7A2A2A]"
                  placeholder="Insert search syntax..."
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1.5" />
              </div>

              {/* Option checkboxes Aa, wholeWord, regex */}
              <div className="flex items-center gap-2 select-none">
                <button
                  type="button"
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  className={`px-2 py-1 rounded text-[10.5px] border font-bold transition-all ${
                    caseSensitive
                      ? "bg-[#7A2A2A] text-white border-[#7A2A2A]"
                      : "bg-neutral-800 text-gray-400 border-transparent hover:bg-neutral-700"
                  }`}
                  title="Match Case [Aa]"
                >
                  Aa
                </button>
                <button
                  type="button"
                  onClick={() => setWholeWord(!wholeWord)}
                  className={`px-2 py-1 rounded text-[10.5px] border font-bold transition-all ${
                    wholeWord
                      ? "bg-[#7A2A2A] text-white border-[#7A2A2A]"
                      : "bg-neutral-800 text-gray-400 border-transparent hover:bg-neutral-700"
                  }`}
                  title="Match Whole Word"
                >
                  " "
                </button>
                <button
                  type="button"
                  onClick={() => setUseRegex(!useRegex)}
                  className={`px-2 py-1 rounded text-[10.5px] border font-mono transition-all ${
                    useRegex
                      ? "bg-[#7A2A2A] text-white border-[#7A2A2A]"
                      : "bg-neutral-800 text-gray-400 border-transparent hover:bg-neutral-700"
                  }`}
                  title="Match Regular Expression [.*]"
                >
                  .*
                </button>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="ml-auto bg-[#7A2A2A] text-white px-3 py-1 font-semibold rounded text-[11px] cursor-pointer hover:bg-[#632020] disabled:opacity-50 transition-colors"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            <div className="border-t border-[#2a2a2a] pt-3 flex-1 overflow-auto space-y-3 font-sans">
              <span className="text-[10.5px] text-gray-400 font-semibold block uppercase select-none">
                {searchResults.length === 0 ? "No results found" : `Results grouped recursively`}
              </span>

              {searchResults.length > 0 && (
                <div className="space-y-3.5">
                  {searchResults.map((result, idx) => {
                    const fileTheme = settings.workbench.fileIconTheme || "vscode-classic";
                    const { Icon: SearchFileIcon, iconColor: searchFileColor } = getFileAndFolderAppearance(
                      result.relativePath,
                      false,
                      false,
                      fileTheme
                    );
                    return (
                      <div key={idx} className="bg-neutral-900/40 border border-neutral-800/80 p-2.5 rounded hover:border-[#7A2A2A]/50 transition-all">
                        <div className="font-semibold text-gray-200 truncate flex items-center gap-1.5 border-b border-neutral-800 pb-1.5 mb-2 select-none mb-1 text-[11px]">
                          <SearchFileIcon className={`w-3.5 h-3.5 shrink-0 ${searchFileColor}`} />
                          <span className="truncate">{result.relativePath}</span>
                        </div>
                      <div className="space-y-1.5 pl-2">
                        {result.matches.map((match, mIdx) => (
                          <div
                            key={mIdx}
                            onClick={() => onSelectFile(result.filePath)}
                            className="hover:bg-cyan-900/25 p-1 px-1.5 rounded cursor-pointer text-gray-300 hover:text-white flex items-start gap-2.5 text-[11.5px] font-mono leading-relaxed"
                          >
                            <span className="text-[#AA4A4A] font-semibold text-[10px] shrink-0 mt-0.5">
                              L{match.lineNumber}
                            </span>
                            <span className="break-all">{match.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. GIT SOURCE VIEWER STATE */}
        {activeTab === "git" && (
          <div className="flex flex-col h-full space-y-3 font-sans text-[12px]">
            <div className="border border-[#7A2A2A]/40 bg-[#7A2A2A]/10 rounded p-3 select-none flex items-start gap-2 border-l-3 border-l-[#7A2A2A] mb-1">
              <CheckCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-100 text-xs">Version Hub active</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">Currently monitoring file change states on block branch: <span className="font-mono text-rose-300 font-semibold">{gitBranch}</span></p>
              </div>
            </div>

            {/* Commit Message Textarea Form */}
            <div className="space-y-2 border-b border-[#2a2a2a] pb-4">
              <textarea
                value={gitCommitMessage}
                onChange={(e) => setGitCommitMessage(e.target.value)}
                placeholder="Commit transaction message... (Ctrl+Enter to sync)"
                rows={3}
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-white outline-none placeholder-gray-500 text-xs focus:border-[#7A2A2A] font-sans"
              />
              <button
                onClick={() => {
                  if (!gitCommitMessage.trim()) return;
                  onCommitGit(gitCommitMessage);
                  setGitCommitMessage("");
                }}
                disabled={!gitCommitMessage.trim() || isGitSyncing}
                className="w-full bg-[#7A2A2A] text-white hover:bg-[#632020] py-1.5 px-3 rounded font-semibold text-xs text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none transition-colors"
              >
                <GitCommit className="w-4 h-4" />
                <span>{isGitSyncing ? "Syncing Workspace..." : "Commit transaction"}</span>
              </button>
            </div>

            {/* Changes files lists */}
            <div className="flex-1 overflow-auto space-y-3 pt-2">
              <span className="text-[10.5px] text-zinc-400 font-semibold block uppercase select-none">
                File State Changes Tracker
              </span>

              {gitChanges.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 flex flex-col items-center select-none">
                  <CheckCircle className="w-7 h-7 text-neutral-600 mb-2" />
                  <span>No dirty file buffers or untracked state adjustments. Codebase clean!</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {gitChanges.map((change, idx) => {
                    const fileTheme = settings.workbench.fileIconTheme || "vscode-classic";
                    const { Icon: GitFileIcon, iconColor: gitFileColor } = getFileAndFolderAppearance(
                      change.relativePath,
                      false,
                      false,
                      fileTheme
                    );
                    return (
                      <div
                        key={idx}
                        onClick={() => onSelectFile(change.path)}
                        className="flex items-center justify-between text-[11.5px] leading-6 hover:bg-neutral-800 p-2 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <GitFileIcon className={`w-3.5 h-3.5 shrink-0 ${gitFileColor}`} />
                          <span className="truncate text-gray-300 hover:text-white font-sans">{change.relativePath}</span>
                        </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] items-center font-bold tracking-wider font-mono shrink-0 select-none ${
                        change.status === "??" ? "bg-amber-800/30 text-amber-300 border border-amber-800/50" :
                        change.status === "M" ? "bg-emerald-800/30 text-emerald-300 border border-emerald-800/50" :
                        "bg-red-800/30 text-red-300 border border-red-800/50"
                      }`}>
                        {change.status === "??" ? "UNTRACKED" : change.status === "M" ? "MODIFIED" : "DELETED"}
                      </span>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. GEMINI AI ASSIST COPILOT */}
        {activeTab === "gemini" && (
          <div className="flex flex-col h-full font-sans text-xs">
            {/* Context active file indicator */}
            <div className="border border-cyan-500/30 bg-cyan-950/20 rounded p-2.5 flex items-start gap-1.5 border-l-2 border-l-cyan-400 mb-3 select-none">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200 block text-xs">Goldman Copilot Sidekick (Gemini)</span>
                <span className="text-[11px] text-zinc-400 mt-1 block">Contextualized diagnostics are live. Explain files, write tests, diagnose code block live.</span>
              </div>
            </div>

            {/* Chat message listing scrollpane */}
            <div className="flex-1 overflow-auto space-y-3.5 mb-3 select-text max-h-[40vh] border-b border-neutral-800 pb-3 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col leading-relaxed bg-[#1a1a1b] p-2.5 rounded border ${
                    msg.sender === "ai"
                      ? "border-cyan-900/40 text-gray-200"
                      : "border-gray-800 text-gray-300 align-end"
                  }`}
                >
                  <div className="flex items-center gap-1.5 select-none mb-1.5 border-b border-neutral-800 pb-1 text-[10px]">
                    {msg.sender === "ai" ? (
                      <>
                        <Cpu className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/10" />
                        <span className="font-bold text-cyan-400">GOLDMAN AI</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-gray-400">DEVELOPER</span>
                      </>
                    )}
                    <span className="ml-auto text-gray-600 text-[9px]">{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed select-text font-sans text-[11.5px] font-medium tracking-normal">
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAIPending && (
                <div className="bg-[#1a1a1b] border border-cyan-900/40 p-3 rounded flex items-center gap-2 text-cyan-400 select-none animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Assistant analyzing code...</span>
                </div>
              )}
            </div>

            {/* Quick assistant actions preset list */}
            {chatMessages.length <= 1 && !isAIPending && (
              <div className="space-y-1.5 mb-3 select-none">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Suggested Prompts</span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => activeCopilotPreset("Explain the active workspace file to me in detail")}
                    className="bg-neutral-800 hover:bg-neutral-700 hover:text-white p-2 text-[11px] flex justify-between items-center text-gray-300 rounded text-left transition-all cursor-pointer font-sans"
                  >
                    <span>Explain active code file</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  </button>
                  <button
                    onClick={() => activeCopilotPreset("Compose detailed Jest / Mocha coverage Unit Tests for my active code blocks")}
                    className="bg-neutral-800 hover:bg-neutral-700 hover:text-white p-2 text-[11px] flex justify-between items-center text-gray-300 rounded text-left transition-all cursor-pointer font-sans"
                  >
                    <span>Generate detailed Unit Tests</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  </button>
                  <button
                    onClick={() => activeCopilotPreset("Refactor files to optimize performance, memory, and clean code styling guidelines")}
                    className="bg-neutral-800 hover:bg-neutral-700 hover:text-white p-2 text-[11px] flex justify-between items-center text-gray-300 rounded text-left transition-all cursor-pointer font-sans"
                  >
                    <span>Refactor logic for performance</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* AI Prompter submission box */}
            {(() => {
              const DEFAULT_MODELS = [
                { id: "gemini-2.5-flash-medium", name: "Gemini 3.5 Flash (Medium)", displayName: "Gemini 3.5 Flash (Medium)", provider: "gemini" as LLMProvider, speed: "Fast" as const },
                { id: "gemini-2.5-flash-high", name: "Gemini 3.5 Flash (High)", displayName: "Gemini 3.5 Flash (High)", provider: "gemini" as LLMProvider, speed: "Fast" as const },
                { id: "gemini-2.5-flash-low", name: "Gemini 3.5 Flash (Low)", displayName: "Gemini 3.5 Flash (Low)", provider: "gemini" as LLMProvider, speed: "Fast" as const },
                { id: "gemini-1.5-pro-low", name: "Gemini 3.1 Pro (Low)", displayName: "Gemini 3.1 Pro (Low)", provider: "gemini" as LLMProvider, speed: "Medium" as const },
                { id: "gemini-1.5-pro-high", name: "Gemini 3.1 Pro (High)", displayName: "Gemini 3.1 Pro (High)", provider: "gemini" as LLMProvider, speed: "Medium" as const },
                { id: "claude-3-5-sonnet", name: "Claude Sonnet 4.6 (Thinking)", displayName: "Claude Sonnet 4.6 (Thinking)", provider: "claude" as LLMProvider, speed: "Medium" as const, hasWarning: true },
                { id: "claude-3-opus", name: "Claude Opus 4.6 (Thinking)", displayName: "Claude Opus 4.6 (Thinking)", provider: "claude" as LLMProvider, speed: "Slow" as const, hasWarning: true },
                { id: "gpt-oss-120b", name: "GPT-OSS 120B (Medium)", displayName: "GPT-OSS 120B (Medium)", provider: "openai" as LLMProvider, speed: "Fast" as const, hasWarning: true },
                { id: "grok-3-mini", name: "Grok 3 Mini", displayName: "Grok 3 Mini", provider: "grok" as LLMProvider, speed: "Fast" as const }
              ];

              const allModels = [
                ...DEFAULT_MODELS,
                ...customModels.map((m) => ({
                  id: m.modelId,
                  name: m.name,
                  displayName: m.name,
                  provider: m.provider,
                  speed: m.speed,
                  hasWarning: true
                }))
              ];

              const activeModelConfig = allModels.find(m => m.id === selectedModelId) || allModels[0];
              const isKeySet = !!(aiKeys as any)[activeModelConfig?.provider || "gemini"];

              return (
                <div ref={sidebarModelDropdownRef} className="px-3 py-1.5 border-t border-zinc-800/80 bg-[#151c22]/90 flex items-center justify-between text-[11px] text-zinc-400 relative select-none shrink-0 mb-1.5 rounded">
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      className="p-1 hover:text-white rounded hover:bg-neutral-800/50 transition-colors"
                      title="Options"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Active Model Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsSidebarModelListOpen(!isSidebarModelListOpen)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/30 border border-zinc-850 hover:bg-neutral-800/60 hover:text-white transition-colors cursor-pointer font-medium font-sans text-cyan-300 animate-fade-in"
                    >
                      <span>{activeModelConfig ? activeModelConfig.name : selectedModelId}</span>
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  </div>

                  {/* Key/MCP Status indicator */}
                  <div className="flex items-center gap-1.5">
                    {isKeySet ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold" title="API Key is missing for this model's provider">
                        <span className="text-[10px]">⚠️</span>
                        <span>MCP Error</span>
                        <span className="w-2.5 h-2.5 bg-rose-500 inline-block rounded-sm animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Floating Drop-Up menu */}
                  {isSidebarModelListOpen && (
                    <div className="absolute bottom-full left-2 right-2 mb-1.5 z-[100] bg-[#0c1e24] border border-zinc-850 rounded-lg p-2.5 shadow-2xl flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 px-1.5 select-none border-b border-zinc-850 pb-1">
                        Model
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {allModels.map((m) => {
                          const isSel = selectedModelId === m.id;
                          const isKeySetForModel = !!(aiKeys as any)[m.provider];
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                onSelectModel(m.id, m.provider);
                                setIsSidebarModelListOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-1.5 px-2.5 rounded text-left transition-colors cursor-pointer text-[11px] font-sans ${
                                isSel ? "bg-[#0f323c] text-cyan-300 border border-cyan-800/40" : "text-zinc-300 hover:bg-[#122830] hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="truncate">{m.name}</span>
                                {m.speed && (
                                  <span className="text-[8px] bg-black/40 text-zinc-400 border border-zinc-800 px-1 py-0.5 rounded font-bold uppercase shrink-0">
                                    {m.speed}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {m.hasWarning && !isKeySetForModel && (
                                  <span className="text-amber-500 font-bold" title="API Key is missing">⚠️</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <form onSubmit={handleGeminiSubmit} className="flex gap-2 font-sans shrink-0">
              <input
                type="text"
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
                placeholder="Ask Goldman Copilot about your files..."
                disabled={isAIPending}
                className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] text-white px-2.5 py-1.5 text-xs outline-none rounded focus:border-[#7A2A2A] font-sans"
              />
              <button
                type="submit"
                disabled={isAIPending || !geminiInput.trim()}
                className="bg-[#7A2A2A] hover:bg-[#632020] text-white py-1 px-3 font-semibold rounded text-xs select-none disabled:opacity-40 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        )}

        {/* 5B. AGENTS PANEL */}
        {activeTab === "agents" && (
          <div className="flex flex-col h-full font-sans text-xs">
            {/* Header */}
            <div className="border border-violet-500/30 bg-violet-950/20 rounded p-2.5 flex items-start gap-1.5 border-l-2 border-l-violet-400 mb-3 select-none">
              <Bot className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200 block text-xs">AI Coding Agents</span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  {activeFile ? `Active: ${activeFile.name}` : "Open a file to run agents on it"}
                  {" · "}
                  <span className="text-violet-400 font-medium">{aiProvider}</span>
                </span>
              </div>
            </div>

            {/* Agent cards grid */}
            <div className="space-y-2 mb-3 overflow-y-auto flex-shrink-0">
              {([
                { type: "code-review" as AgentTaskType, label: "Code Review", desc: "Deep review: bugs, security, style", Icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-800/40" },
                { type: "refactor" as AgentTaskType, label: "Refactor Code", desc: "Improve structure, types, performance", Icon: Wrench, color: "text-amber-400", bg: "bg-amber-950/20 border-amber-800/40" },
                { type: "unit-tests" as AgentTaskType, label: "Generate Unit Tests", desc: "Jest/Vitest full test coverage", Icon: TestTube2, color: "text-sky-400", bg: "bg-sky-950/20 border-sky-800/40" },
                { type: "documentation" as AgentTaskType, label: "Add Documentation", desc: "JSDoc/TSDoc for all functions", Icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-950/20 border-indigo-800/40" },
                { type: "bug-finder" as AgentTaskType, label: "Bug Finder", desc: "Security vulnerabilities & logic bugs", Icon: Bug, color: "text-rose-400", bg: "bg-rose-950/20 border-rose-800/40" },
                { type: "explain" as AgentTaskType, label: "Explain Code", desc: "Plain-English walkthrough of the file", Icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-950/20 border-yellow-800/40" },
              ]).map(({ type, label, desc, Icon, color, bg }) => {
                const isRunning = runningAgent === type;
                const lastResult = [...agentTasks].reverse().find(t => t.type === type && t.status === "done");
                return (
                  <div key={type} className={`border ${bg} rounded p-2.5 transition-all`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                        <div>
                          <span className={`text-[11.5px] font-semibold ${color}`}>{label}</span>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isRunning || !activeFile}
                        onClick={async () => {
                          if (!activeFile) return;
                          setRunningAgent(type);
                          const taskId = `${type}-${Date.now()}`;
                          const newTask: AgentTask = {
                            id: taskId,
                            type,
                            provider: aiProvider,
                            status: "running",
                            prompt: `Analyze: ${activeFile.relativePath}`,
                            filePath: activeFile.relativePath,
                            timestamp: new Date().toLocaleTimeString(),
                          };
                          setAgentTasks(prev => [newTask, ...prev]);
                          setExpandedTask(taskId);
                          try {
                            const res = await fetch("/api/ai/agent", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                provider: aiProvider,
                                apiKey: (aiKeys as any)[aiProvider],
                                agentType: type,
                                fileContent: activeFile.content,
                                filePath: activeFile.relativePath,
                              }),
                            });
                            const data = await res.json();
                            setAgentTasks(prev => prev.map(t =>
                              t.id === taskId
                                ? { ...t, status: data.error ? "error" : "done", result: data.reply || data.error }
                                : t
                            ));
                          } catch (err: any) {
                            setAgentTasks(prev => prev.map(t =>
                              t.id === taskId ? { ...t, status: "error", result: `Network error: ${err.message}` } : t
                            ));
                          } finally {
                            setRunningAgent(null);
                          }
                        }}
                        className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-semibold transition-all cursor-pointer ${
                          isRunning ? "bg-violet-700/40 text-violet-300 animate-pulse" :
                          !activeFile ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" :
                          "bg-violet-700 hover:bg-violet-600 text-white"
                        }`}
                        title={!activeFile ? "Open a file first" : `Run ${label} agent`}
                      >
                        {isRunning
                          ? <><RefreshCw className="w-3 h-3 animate-spin" /><span>Running...</span></>
                          : <><Play className="w-3 h-3" /><span>Run</span></>}
                      </button>
                    </div>

                    {/* Show last result badge */}
                    {lastResult && (
                      <button
                        type="button"
                        onClick={() => setExpandedTask(expandedTask === lastResult.id ? null : lastResult.id)}
                        className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                        <span>Last result · {lastResult.timestamp}</span>
                        {expandedTask === lastResult.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom prompt input */}
            <div className="border border-zinc-800 rounded p-2 mb-2 flex-shrink-0">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Custom Agent Prompt</span>
              <div className="flex gap-1.5">
                <textarea
                  value={agentCustomPrompt}
                  onChange={(e) => setAgentCustomPrompt(e.target.value)}
                  placeholder="Custom instruction for the agent..."
                  rows={2}
                  className="flex-1 bg-black border border-zinc-700 text-white text-[11px] px-2 py-1 rounded outline-none resize-none font-sans focus:border-violet-500 transition-colors"
                />
                <button
                  type="button"
                  disabled={!agentCustomPrompt.trim() || !activeFile || !!runningAgent}
                  onClick={async () => {
                    if (!activeFile || !agentCustomPrompt.trim()) return;
                    setRunningAgent("custom");
                    const taskId = `custom-${Date.now()}`;
                    const newTask: AgentTask = {
                      id: taskId, type: "explain", provider: aiProvider, status: "running",
                      prompt: agentCustomPrompt, filePath: activeFile.relativePath, timestamp: new Date().toLocaleTimeString(),
                    };
                    setAgentTasks(prev => [newTask, ...prev]);
                    setExpandedTask(taskId);
                    try {
                      const res = await fetch("/api/ai/agent", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          provider: aiProvider, apiKey: (aiKeys as any)[aiProvider],
                          agentType: "explain", fileContent: activeFile.content,
                          filePath: activeFile.relativePath, customPrompt: agentCustomPrompt,
                        }),
                      });
                      const data = await res.json();
                      setAgentTasks(prev => prev.map(t =>
                        t.id === taskId ? { ...t, status: data.error ? "error" : "done", result: data.reply || data.error } : t
                      ));
                    } catch (err: any) {
                      setAgentTasks(prev => prev.map(t =>
                        t.id === taskId ? { ...t, status: "error", result: `Error: ${err.message}` } : t
                      ));
                    } finally {
                      setRunningAgent(null);
                      setAgentCustomPrompt("");
                    }
                  }}
                  className="px-2 bg-violet-700 hover:bg-violet-600 text-white rounded text-[10.5px] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Agent results */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {agentTasks.length === 0 && (
                <div className="text-center py-8 text-zinc-600 select-none">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                  <p className="text-[11px]">Run an agent on the active file to see results here.</p>
                </div>
              )}
              {agentTasks.map(task => (
                <div key={task.id} className={`border rounded transition-all ${
                  task.status === "error" ? "border-rose-800/50 bg-rose-950/10" :
                  task.status === "running" ? "border-violet-700/50 bg-violet-950/10 animate-pulse" :
                  "border-zinc-800 bg-zinc-900/20"
                }`}>
                  <button
                    type="button"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="w-full flex items-center justify-between p-2 cursor-pointer hover:bg-zinc-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {task.status === "running" && <RefreshCw className="w-3 h-3 text-violet-400 animate-spin" />}
                      {task.status === "done" && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                      {task.status === "error" && <Bug className="w-3 h-3 text-rose-400" />}
                      <span className="text-[11px] font-semibold text-zinc-300 capitalize">{task.type.replace("-", " ")}</span>
                      <span className="text-[9px] text-violet-400 font-mono">{task.provider}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500">{task.timestamp}</span>
                      {expandedTask === task.id ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedTask === task.id && task.result && (
                    <div className="px-2 pb-2 space-y-1.5">
                      <div className="bg-black rounded p-2 max-h-56 overflow-y-auto">
                        <pre className="text-[10.5px] text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono select-text">{task.result}</pre>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(task.result || "");
                            setCopiedTask(task.id);
                            setTimeout(() => setCopiedTask(null), 2000);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1 rounded text-[10.5px] cursor-pointer transition-colors"
                        >
                          {copiedTask === task.id ? <><CheckCheck className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                        {onApplyAgentResult && task.filePath && (
                          <button
                            type="button"
                            onClick={() => {
                              // Extract code block if result contains one, otherwise use raw result
                              const codeMatch = task.result?.match(/```[\w]*\n([\s\S]*?)\n```/);
                              const content = codeMatch ? codeMatch[1] : (task.result || "");
                              onApplyAgentResult(content, task.filePath!);
                              logOutput(`Applied agent result to ${task.filePath}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-violet-700 hover:bg-violet-600 text-white py-1 rounded text-[10.5px] cursor-pointer transition-colors"
                          >
                            <FilePen className="w-3 h-3" /> Apply to File
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. WORKSPACE PREFERENCES SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex flex-col h-full space-y-4 font-sans text-[12px] overflow-y-auto pr-1">

            {/* 5-NEW: AI Providers & API Keys */}
            <div className="flex flex-col gap-3 border border-violet-900/50 p-3 rounded bg-violet-950/20 leading-relaxed font-sans shrink-0">
              <div className="flex items-center gap-2 border-b border-violet-900/40 pb-1.5 select-none">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] text-violet-300 font-bold uppercase tracking-wider">AI Providers & API Keys</span>
              </div>

              {/* Active provider selector */}
              <div className="flex items-center justify-between gap-2 select-none">
                <span className="text-zinc-300 font-semibold text-[11px]">Active Provider</span>
                <select
                  value={aiProvider}
                  onChange={(e) => onUpdateAIProvider(e.target.value as LLMProvider)}
                  className="bg-black border border-violet-800/50 text-white p-1 rounded font-sans cursor-pointer outline-none text-[11px] hover:border-violet-500 transition-colors"
                >
                  <option value="gemini">✨ Google Gemini</option>
                  <option value="openai">🤖 OpenAI ChatGPT</option>
                  <option value="claude">🧠 Anthropic Claude</option>
                  <option value="grok">⚡ xAI Grok</option>
                </select>
              </div>

              {/* Key inputs for each provider */}
              {([
                { id: "gemini", label: "Gemini API Key", placeholder: "AIza...", link: "https://aistudio.google.com/apikey" },
                { id: "openai", label: "OpenAI API Key", placeholder: "sk-...", link: "https://platform.openai.com/api-keys" },
                { id: "claude", label: "Anthropic Claude Key", placeholder: "sk-ant-...", link: "https://console.anthropic.com/account/keys" },
                { id: "grok", label: "xAI Grok Key", placeholder: "xai-...", link: "https://console.x.ai" },
              ] as const).map(({ id, label, placeholder, link }) => (
                <div key={id} className={`space-y-1 p-2 rounded border transition-colors ${
                  aiProvider === id ? "border-violet-500/50 bg-violet-950/30" : "border-zinc-800 bg-transparent"
                }`}>
                  <div className="flex items-center justify-between">
                    <label className={`text-[10.5px] font-bold ${
                      aiProvider === id ? "text-violet-300" : "text-zinc-400"
                    }`}>
                      {label}
                      {aiProvider === id && <span className="ml-1.5 text-[9px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1 py-0.5 rounded">ACTIVE</span>}
                    </label>
                    <a href={link} target="_blank" rel="noreferrer" className="text-[9px] text-violet-400 hover:text-violet-300 underline">
                      Get key ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type={showKeys[id] ? "text" : "password"}
                      value={localKeys[id] || ""}
                      onChange={(e) => setLocalKeys(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder={placeholder}
                      className="flex-1 bg-black border border-zinc-700 text-white px-2 py-1 rounded outline-none text-[11px] font-mono focus:border-violet-500 transition-colors placeholder-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))}
                      className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                      title={showKeys[id] ? "Hide key" : "Show key"}
                    >
                      {showKeys[id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Save keys button */}
              <button
                type="button"
                onClick={() => {
                  onUpdateAIKeys(localKeys);
                  setKeysSaved(true);
                  setTimeout(() => setKeysSaved(false), 2500);
                  logOutput("AI provider keys saved to local storage.");
                }}
                className="w-full bg-violet-700 hover:bg-violet-600 text-white py-1.5 rounded font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {keysSaved ? <><CheckCheck className="w-3.5 h-3.5" /> Keys Saved!</> : <><Key className="w-3.5 h-3.5" /> Save API Keys</>}
              </button>
              <p className="text-[9.5px] text-zinc-500 leading-relaxed">
                🔒 Keys are stored in browser localStorage. They are never sent to any server except the LLM provider you select.
              </p>
            </div>


            {/* Custom Models Configuration Section */}
            <div className="flex flex-col gap-3 border border-violet-900/40 p-3 rounded bg-violet-950/15 leading-relaxed font-sans shrink-0">
              <div className="flex items-center gap-2 border-b border-violet-900/30 pb-1.5 select-none">
                <Settings className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] text-violet-300 font-bold uppercase tracking-wider">Configure Custom Models</span>
              </div>

              {/* List of custom models */}
              {customModels.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Active Custom Models</span>
                  <div className="flex flex-col gap-1.5">
                    {customModels.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded border border-zinc-850 bg-black/25">
                        <div className="min-w-0">
                          <span className="text-zinc-200 font-semibold text-[11px] block truncate">{m.name}</span>
                          <span className="text-zinc-500 text-[9px] block truncate">{m.provider} · {m.modelId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteCustomModel(m.id)}
                          className="text-zinc-500 hover:text-rose-450 p-1 transition-colors cursor-pointer shrink-0"
                          title="Delete Model"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10.5px] text-zinc-500 italic font-medium leading-relaxed">No custom models configured yet. Add one below!</p>
              )}

              {/* Add Custom Model form */}
              <div className="h-px bg-zinc-800/60 my-1" />
              <div className="space-y-2.5">
                <span className="text-[10px] text-violet-400 font-bold block uppercase">Add Custom Model</span>
                
                <div className="space-y-1">
                  <label className="text-[9.5px] text-zinc-400 block font-semibold">Model Name</label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    placeholder="e.g. DeepSeek Coder"
                    className="w-full bg-black border border-zinc-700 text-white px-2 py-1 rounded text-[11px] outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] text-zinc-400 block font-semibold">Model ID (on provider)</label>
                  <input
                    type="text"
                    value={customModelIdVal}
                    onChange={(e) => setCustomModelIdVal(e.target.value)}
                    placeholder="e.g. deepseek-coder"
                    className="w-full bg-black border border-zinc-700 text-white px-2 py-1 rounded text-[11px] outline-none font-mono focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9.5px] text-zinc-400 block font-semibold">Provider</label>
                    <select
                      value={customModelProvider}
                      onChange={(e) => setCustomModelProvider(e.target.value as LLMProvider)}
                      className="w-full bg-black border border-zinc-700 text-white p-1 rounded text-[11px] outline-none cursor-pointer focus:border-violet-500"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="claude">Claude</option>
                      <option value="grok">Grok</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] text-zinc-400 block font-semibold">Speed</label>
                    <select
                      value={customModelSpeed}
                      onChange={(e) => setCustomModelSpeed(e.target.value as any)}
                      className="w-full bg-black border border-zinc-700 text-white p-1 rounded text-[11px] outline-none cursor-pointer focus:border-violet-500"
                    >
                      <option value="Fast">Fast</option>
                      <option value="Medium">Medium</option>
                      <option value="Slow">Slow</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!customModelName.trim() || !customModelIdVal.trim()}
                  onClick={() => {
                    const model = {
                      id: `${customModelProvider}-${customModelIdVal.trim()}-${Date.now()}`,
                      name: customModelName.trim(),
                      provider: customModelProvider,
                      modelId: customModelIdVal.trim(),
                      speed: customModelSpeed
                    };
                    onAddCustomModel(model);
                    setCustomModelName("");
                    setCustomModelIdVal("");
                    logOutput(`Custom model configured: ${model.name}`);
                  }}
                  className="w-full bg-violet-750 hover:bg-violet-650 disabled:opacity-40 text-white py-1.5 rounded font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Custom Model</span>
                </button>
              </div>
            </div>

            {/* 5A. Basic Editor Config */}
            <div className="flex flex-col gap-3 border border-zinc-800 p-3 rounded bg-zinc-900/20 leading-relaxed font-sans shrink-0">
              <span className="text-[11px] text-[#AA4A4A] font-bold block select-none border-b border-zinc-800 pb-1 uppercase tracking-wider font-sans">Editor configuration</span>

              {/* Setting row: font size */}
              <div className="flex items-center justify-between gap-1 select-none">
                <label className="text-zinc-300 font-semibold font-sans">Font Size</label>
                <input
                  type="number"
                  value={settings.editor.fontSize}
                  onChange={(e) => onUpdateSetting("editor", "fontSize", parseInt(e.target.value) || 12)}
                  className="bg-black border border-zinc-700 text-white p-1 rounded font-mono outline-none text-[11px] text-center w-16"
                />
              </div>

              {/* Setting row: Toggle minimap */}
              <div className="flex items-center justify-between gap-1 select-none">
                <span className="text-zinc-300 font-semibold font-sans">Enable Minimap</span>
                <input
                  type="checkbox"
                  checked={settings.editor.minimap}
                  onChange={(e) => onUpdateSetting("editor", "minimap", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#7A2A2A]"
                />
              </div>

              {/* Setting row: wordwrap */}
              <div className="flex items-center justify-between gap-1 select-none">
                <span className="text-zinc-300 font-semibold font-sans">Word wrap</span>
                <select
                  value={settings.editor.wordWrap}
                  onChange={(e) => onUpdateSetting("editor", "wordWrap", e.target.value)}
                  className="bg-black border border-zinc-700 text-white p-1 rounded font-sans cursor-pointer outline-none text-[11px]"
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>

              {/* Setting row: autoSave */}
              <div className="flex items-center justify-between gap-1 select-none">
                <span className="text-zinc-300 font-semibold font-sans">Format on Save</span>
                <input
                  type="checkbox"
                  checked={settings.editor.formatOnSave}
                  onChange={(e) => onUpdateSetting("editor", "formatOnSave", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#7A2A2A]"
                />
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="flex flex-col gap-3 border border-zinc-800 p-3 rounded bg-zinc-900/20 leading-relaxed font-sans shrink-0">
              <span className="text-[11px] text-[#AA4A4A] font-bold block select-none border-b border-zinc-800 pb-1 uppercase tracking-wider font-sans">Color Theme</span>

              <div className="flex flex-col gap-2">
                <p className="text-zinc-400 text-[10.5px] leading-relaxed">
                  Select a coordinate workspace visual palette that completely colors the sidebar, terminals, statusbar indicators, and Monaco active compiler windows.
                </p>
                <select
                  value={settings.workbench.theme || "5080-dark"}
                  onChange={(e) => onUpdateSetting("workbench", "theme", e.target.value)}
                  className="w-full bg-black border border-zinc-700 text-white p-2 rounded font-sans cursor-pointer outline-none text-[11px] hover:border-[#7A2A2A] transition-colors"
                >
                  <option value="5080-dark">Classic Dark / Obsidian Rouge (Crimson Dark)</option>
                  <option value="classic-light">Classic Light / Pure Studio (Warm Crisp Light)</option>
                  <option value="nordic-frost">Nordic Frost Arctic (Cool Deep Blue-Grey)</option>
                  <option value="dracula-eclipse">Dracula Eclipse Gothic (Lush Neon Violet)</option>
                  <option value="cyberpunk-neon">Cyberpunk Neon Outrun (Fluorescent Violet-Fuchsia)</option>
                  <option value="luxury-gold">Luxury Amber Gold (Antique Mahogany Vintage)</option>
                </select>
              </div>
            </div>

            {/* VS Code Style File Icon Theme Selection */}
            <div className="flex flex-col gap-3 border border-zinc-800 p-3 rounded bg-zinc-900/20 leading-relaxed font-sans shrink-0">
              <span className="text-[11px] text-[#AA4A4A] font-bold block select-none border-b border-zinc-800 pb-1 uppercase tracking-wider font-sans">File Icon Theme (VS Code)</span>

              <div className="flex flex-col gap-2">
                <p className="text-zinc-400 text-[10.5px] leading-relaxed">
                  Choose from 6 distinctive editor icon appearance configurations that transform how stripes, files, extensions, and directory structures are styled in the Explorer.
                </p>
                <select
                  value={settings.workbench.fileIconTheme || "vscode-classic"}
                  onChange={(e) => onUpdateSetting("workbench", "fileIconTheme", e.target.value)}
                  className="w-full bg-black border border-zinc-700 text-white p-2 rounded font-sans cursor-pointer outline-none text-[11px] hover:border-[#7A2A2A] transition-colors"
                >
                  <option value="vscode-classic">Classic VS Code (Vibrant & Familiar)</option>
                  <option value="material-vibrant">Material Design (High Key Contrast)</option>
                  <option value="cyberpunk-neon">Cyberpunk Neon (Glowing Laser & Fuchsia)</option>
                  <option value="monochrome-slate">Monochrome Slate (Corporate Technical Noir)</option>
                  <option value="minimalist-wire">Minimalist Wireframe (Clean Simple Outline)</option>
                  <option value="retro-gold">Retro Luxury Gold (Antique Mahogany & Wheat)</option>
                </select>
              </div>
            </div>

            {/* 5B. Live Color-Variable Customizer */}
            <div className="flex flex-col gap-3 border border-zinc-800 p-3 rounded bg-zinc-900/20 leading-relaxed font-sans mt-2">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-1 select-none">
                <span className="text-[11px] text-[#AA4A4A] font-bold block uppercase tracking-wider font-sans">Live UI Theme Customizer</span>
                <button
                  type="button"
                  onClick={() => onUpdateCustomTheme({
                    editorBg: "#1e1e1e",
                    editorFg: "#d4d4d4",
                    editorCursor: "#ff79c6",
                    editorLineNumber: "#6272a4",
                    syntaxKeyword: "#ec5da5",
                    syntaxString: "#a8e163",
                    syntaxNumber: "#bd93f9",
                    syntaxComment: "#6b7582",
                    syntaxFunction: "#4ea6ff",
                    syntaxType: "#8be9fd",
                    sidebarBg: "#252526",
                    sidebarBorder: "#1e1e1e",
                    activityBarBg: "#333333",
                    activityBarAccent: "#7a2a2a",
                    statusBarBg: "#7a2a2a",
                    statusBarFg: "#ffffff",
                    bottomPanelBg: "#1e1e1e",
                    titleBarBg: "#1d1d1d"
                  })}
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer select-none"
                  title="Reset layout colors to baseline dark configurations"
                >
                  Reset Colors
                </button>
              </div>
              
              {/* Theme customizer categories tab selector */}
              <div className="flex border border-zinc-800 rounded bg-black/40 overflow-hidden shrink-0">
                {(["editor", "syntax", "workbench"] as const).map((group) => (
                  <button
                    key={group}
                    onClick={() => setColorGroup(group)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors capitalize cursor-pointer ${
                      colorGroup === group ? "bg-[#7A2A2A] text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {/* Active group color pickers list */}
              <div className="space-y-2 mt-1 max-h-[300px] overflow-y-auto pr-1">
                {(colorGroup === "editor" 
                  ? [
                      { key: "editorBg", label: "Editor Background" },
                      { key: "editorFg", label: "Editor Foreground" },
                      { key: "editorCursor", label: "Cursor Indicator" },
                      { key: "editorLineNumber", label: "Line Numbers" },
                    ]
                  : colorGroup === "syntax"
                  ? [
                      { key: "syntaxKeyword", label: "Keywords Token" },
                      { key: "syntaxString", label: "String Literals" },
                      { key: "syntaxNumber", label: "Numeric Values" },
                      { key: "syntaxComment", label: "Code Comments" },
                      { key: "syntaxFunction", label: "Functions / Methods" },
                      { key: "syntaxType", label: "Types / Classes" },
                    ]
                  : [
                      { key: "sidebarBg", label: "Sidebar Background" },
                      { key: "sidebarBorder", label: "Workspace Borders" },
                      { key: "activityBarBg", label: "Activity Bar Back" },
                      { key: "activityBarAccent", label: "Active Highlight" },
                      { key: "statusBarBg", label: "Status Bar Back" },
                      { key: "bottomPanelBg", label: "Console Background" },
                      { key: "titleBarBg", label: "Title Bar Back" },
                    ]
                ).map(({ key, label }) => {
                  const val = customTheme[key as keyof CustomThemeColors] || "#FFFFFF";
                  return (
                    <div key={key} className="flex items-center justify-between gap-2 py-0.5 border-b border-zinc-900">
                      <span className="text-zinc-400 font-medium truncate select-none text-[11px]">{label}</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">{val}</span>
                        <input
                          type="color"
                          value={val}
                          onChange={(e) => {
                            onUpdateCustomTheme({ [key]: e.target.value });
                          }}
                          className="w-6 h-5 border border-zinc-800 bg-transparent rounded cursor-pointer outline-none shrink-0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5C. Save Theme & Presets Timeline */}
            <div className="flex flex-col gap-3 border border-zinc-800 p-3 rounded bg-zinc-900/20 leading-relaxed font-sans">
              <span className="text-[11px] text-[#AA4A4A] font-bold block select-none border-b border-zinc-800 pb-1 uppercase tracking-wider">Save Custom Theme Config</span>
              
              <div className="flex flex-col gap-2 font-sans">
                <input
                  type="text"
                  placeholder="Custom Theme Name..."
                  value={themeSaveName}
                  onChange={(e) => setThemeSaveName(e.target.value)}
                  className="bg-black border border-zinc-700 text-white p-1.5 rounded outline-none text-[11px] w-full font-sans"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = themeSaveName.trim();
                    if (!trimmed) return;
                    onSaveCustomTheme(trimmed, customTheme);
                    setThemeSaveName("");
                  }}
                  disabled={!themeSaveName.trim()}
                  className="bg-[#7A2A2A] hover:bg-[#632020] text-white py-1.5 px-3 rounded font-semibold text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer select-none disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Custom Theme</span>
                </button>
              </div>

              {/* Custom Themes Presets list */}
              {savedThemes.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Theme Presets Library</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {savedThemes.map((thm) => {
                      const isActiveThm = activeThemeId === thm.id;
                      return (
                        <div key={thm.id} className={`flex items-center justify-between p-1.5 px-2 rounded border transition-colors ${
                          isActiveThm ? "bg-[#7A2A2A]/10 border-[#7A2A2A] text-white" : "bg-black/20 border-zinc-800 text-zinc-400"
                        }`}>
                          <button
                            type="button"
                            onClick={() => onLoadCustomTheme(thm.colors, thm.id)}
                            className="flex-1 text-left font-semibold truncate hover:text-white cursor-pointer text-[11px]"
                          >
                            {thm.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCustomTheme(thm.id)}
                            className="text-zinc-500 hover:text-rose-450 p-0.5 transition-colors cursor-pointer shrink-0"
                            title="Delete custom theme"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 5D. IDE Info */}
            <div className="flex flex-col gap-3.5 border border-zinc-800 p-3 rounded bg-zinc-900/20 leading-relaxed">
              <span className="text-[11px] text-[#AA4A4A] font-bold block select-none border-b border-zinc-800 pb-1 uppercase tracking-wider">IDE branding info</span>
              <div className="space-y-1.5 text-zinc-400 text-[11px] select-text">
                <p>App Name: <span className="text-white font-semibold font-mono">5080 IDE Suite</span></p>
                <p>Status: <span className="text-emerald-400 font-bold font-mono">Stable Container Node</span></p>
                <p>Licensing: <span className="text-gray-400 font-semibold">SPDX-License-Identifier: Apache-2.0</span></p>
                <p className="mt-2 text-zinc-500 font-medium">Built as an isolated browser container workspace, 5080 reads and modifies local system directories directly in real-time, matching complete native desktop workflow experiences.</p>
              </div>
            </div>
          </div>
        )}

        {/* 6. EXTENSIONS TAB */}
        {activeTab === "extensions" && (
          <ExtensionsTab
            onApplyTheme={onApplyTheme}
            onAddSnippet={onAddSnippet}
            activeThemeId={activeThemeId}
            onActiveThemeChange={onActiveThemeChange}
            onEnableVimMode={onEnableVimMode}
          />
        )}

        {/* 7. PROFILE & LAYOUT PERSONALIZATION */}
        {activeTab === "profile" && (
          <ProfileTab
            currentUser={currentUser}
            onLogin={onLogin}
            onLogout={onLogout}
            onUpdateProfile={onUpdateProfile}
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            logOutput={logOutput}
          />
        )}

        {/* 8. PACKAGES / DEPENDENCY MANAGER TAB */}
        {activeTab === "packages" && (
          <PackagesTab />
        )}
      </div>
    </div>
  );
}
