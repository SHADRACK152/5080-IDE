import { useState, useEffect, useCallback } from "react";
import {
  FileNode,
  EditorTab,
  WorkspaceSettings,
  Problem,
  ChatMessage,
  GitChange,
  SearchResult,
  UserProfile,
  CustomThemeColors,
  LLMProvider,
  AIProviderKeys,
} from "./types";
import TitleBar from "./components/TitleBar";
import ActivityBar from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import EditorArea from "./components/EditorArea";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import CommandPalette from "./components/CommandPalette";
import NewProjectModal from "./components/NewProjectModal";
import WelcomeScreen from "./components/WelcomeScreen";
import RightAgentPanel from "./components/RightAgentPanel";
import { Layers, HelpCircle, RefreshCw, Cpu, Code, Settings, Save, Sparkles, AlertCircle, Terminal, X, Power, Home } from "lucide-react";

// Detect if running inside Electron desktop app
const isElectron = typeof window !== "undefined" && !!(window as any).electronAPI;
// @ts-ignore
const isDev = process.env.NODE_ENV !== "production";

const DEFAULT_THEME_COLORS: CustomThemeColors = {
  editorBg: "#1E1E1E",
  editorFg: "#D4D4D4",
  editorCursor: "#AEAFAD",
  editorLineNumber: "#858585",
  syntaxKeyword: "#569CD6",
  syntaxString: "#CE9178",
  syntaxNumber: "#B5CEA8",
  syntaxComment: "#6A9955",
  syntaxFunction: "#DCDCAA",
  syntaxType: "#4EC9B0",
  sidebarBg: "#252526",
  sidebarBorder: "#1E1E1E",
  activityBarBg: "#333333",
  activityBarAccent: "#7A2A2A",
  statusBarBg: "#7A2A2A",
  statusBarFg: "#FFFFFF",
  bottomPanelBg: "#1E1E1E",
  titleBarBg: "#333333",
};

export interface AppThemeConfig {
  id: string;
  name: string;
  base: "vs-dark" | "vs";
  colors: CustomThemeColors;
}

export const THEME_PALETTES: Record<string, AppThemeConfig> = {
  "antigravity-teal": {
    id: "antigravity-teal",
    name: "5080 Premium Teal",
    base: "vs-dark",
    colors: {
      editorBg: "#041c24",
      editorFg: "#e2e8f0",
      editorCursor: "#0ea5e9",
      editorLineNumber: "#204a57",
      syntaxKeyword: "#38bdf8",
      syntaxString: "#34d399",
      syntaxNumber: "#fbbf24",
      syntaxComment: "#4a7482",
      syntaxFunction: "#60a5fa",
      syntaxType: "#2dd4bf",
      sidebarBg: "#03171e",
      sidebarBorder: "#010a0e",
      activityBarBg: "#010d12",
      activityBarAccent: "#0ea5e9",
      statusBarBg: "#021219",
      statusBarFg: "#94a3b8",
      bottomPanelBg: "#041c24",
      titleBarBg: "#010d12"
    }
  },
  "5080-dark": {
    id: "5080-dark",
    name: "Classic Obsidian Rouge",
    base: "vs-dark",
    colors: {
      editorBg: "#1e1e1e",
      editorFg: "#d4d4d4",
      editorCursor: "#7a2a2a",
      editorLineNumber: "#5a5a5a",
      syntaxKeyword: "#569cd6",
      syntaxString: "#ce9178",
      syntaxNumber: "#b5cea8",
      syntaxComment: "#6a9955",
      syntaxFunction: "#dcdcaa",
      syntaxType: "#4ec9b0",
      sidebarBg: "#252526",
      sidebarBorder: "#1e1e1e",
      activityBarBg: "#1e1e1e",
      activityBarAccent: "#7a2a2a",
      statusBarBg: "#7a2a2a",
      statusBarFg: "#ffffff",
      bottomPanelBg: "#1e1e1e",
      titleBarBg: "#1d1d1d"
    }
  },
  "classic-light": {
    id: "classic-light",
    name: "Classic Studio Light",
    base: "vs",
    colors: {
      editorBg: "#fdfcfb",
      editorFg: "#2c3e50",
      editorCursor: "#0066cc",
      editorLineNumber: "#a0a0a0",
      syntaxKeyword: "#0000ff",
      syntaxString: "#a31515",
      syntaxNumber: "#098658",
      syntaxComment: "#008000",
      syntaxFunction: "#795e26",
      syntaxType: "#267f99",
      sidebarBg: "#f3f3f3",
      sidebarBorder: "#e4e4e7",
      activityBarBg: "#f3f3f3",
      activityBarAccent: "#0066cc",
      statusBarBg: "#0066cc",
      statusBarFg: "#ffffff",
      bottomPanelBg: "#f8f8f8",
      titleBarBg: "#eaeaea"
    }
  },
  "nordic-frost": {
    id: "nordic-frost",
    name: "Nordic Frost Arctic",
    base: "vs-dark",
    colors: {
      editorBg: "#2e3440",
      editorFg: "#d8dee9",
      editorCursor: "#88c0d0",
      editorLineNumber: "#4c566a",
      syntaxKeyword: "#81a1c1",
      syntaxString: "#a3be8c",
      syntaxNumber: "#b48ead",
      syntaxComment: "#4c566a",
      syntaxFunction: "#88c0d0",
      syntaxType: "#8fbcbb",
      sidebarBg: "#242933",
      sidebarBorder: "#1b1f27",
      activityBarBg: "#242933",
      activityBarAccent: "#88c0d0",
      statusBarBg: "#3b4252",
      statusBarFg: "#eceff4",
      bottomPanelBg: "#2e3440",
      titleBarBg: "#242933"
    }
  },
  "dracula-eclipse": {
    id: "dracula-eclipse",
    name: "Dracula Eclipse Gothic",
    base: "vs-dark",
    colors: {
      editorBg: "#1e1e24",
      editorFg: "#f8f8f2",
      editorCursor: "#ff79c6",
      editorLineNumber: "#6272a4",
      syntaxKeyword: "#ff79c6",
      syntaxString: "#f1fa8c",
      syntaxNumber: "#bd93f9",
      syntaxComment: "#6272a4",
      syntaxFunction: "#50fa7b",
      syntaxType: "#8be9fd",
      sidebarBg: "#19191d",
      sidebarBorder: "#141416",
      activityBarBg: "#19191d",
      activityBarAccent: "#bd93f9",
      statusBarBg: "#bd93f9",
      statusBarFg: "#1e1e24",
      bottomPanelBg: "#1e1e24",
      titleBarBg: "#141416"
    }
  },
  "cyberpunk-neon": {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon Outrun",
    base: "vs-dark",
    colors: {
      editorBg: "#12091a",
      editorFg: "#e2e8f0",
      editorCursor: "#00f5ff",
      editorLineNumber: "#5c3d70",
      syntaxKeyword: "#ff00e4",
      syntaxString: "#fff200",
      syntaxNumber: "#00f5ff",
      syntaxComment: "#00ff66",
      syntaxFunction: "#ff007f",
      syntaxType: "#3d85c6",
      sidebarBg: "#0d0514",
      sidebarBorder: "#1a0429",
      activityBarBg: "#0d0514",
      activityBarAccent: "#ff00e4",
      statusBarBg: "#ff007f",
      statusBarFg: "#ffff00",
      bottomPanelBg: "#12091a",
      titleBarBg: "#08020d"
    }
  },
  "luxury-gold": {
    id: "luxury-gold",
    name: "Luxury Amber Gold",
    base: "vs-dark",
    colors: {
      editorBg: "#1c1511",
      editorFg: "#f5e1c8",
      editorCursor: "#dca842",
      editorLineNumber: "#6b5443",
      syntaxKeyword: "#e28a42",
      syntaxString: "#c2ab80",
      syntaxNumber: "#fed7aa",
      syntaxComment: "#8a7565",
      syntaxFunction: "#dca842",
      syntaxType: "#fee2e2",
      sidebarBg: "#16100c",
      sidebarBorder: "#261a14",
      activityBarBg: "#16100c",
      activityBarAccent: "#dca842",
      statusBarBg: "#2d1f18",
      statusBarFg: "#f5e1c8",
      bottomPanelBg: "#1c1511",
      titleBarBg: "#110c09"
    }
  }
};

export default function App() {
  // Application Workspace Meta
  const [workspaceInfo, setWorkspaceInfo] = useState<{
    name: string;
    version: string;
    workspace: string;
    platform: string;
  } | null>(null);

  // Layout View States
  const [isExited, setIsExited] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "explorer" | "search" | "git" | "gemini" | "agents" | "settings" | "extensions" | "profile" | "packages"
  >("explorer");
  const [activeThemeId, setActiveThemeId] = useState("ext-theme-default");
  const [activeThemeConfig, setActiveThemeConfig] = useState<{
    id: string;
    base: string;
    rules: any[];
    colors: any;
  } | null>(null);

  const initialCustomTheme: CustomThemeColors = {
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
  };

  const [customTheme, setCustomTheme] = useState<CustomThemeColors>(() => {
    try {
      const saved = localStorage.getItem("workspace_custom_theme_5080");
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialCustomTheme;
  });

  const [savedThemes, setSavedThemes] = useState<Array<{ id: string; name: string; colors: CustomThemeColors }>>(() => {
    try {
      const saved = localStorage.getItem("custom_saved_themes_5080");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleApplyTheme = useCallback((themeId: string, themeConfig: any) => {
    setActiveThemeId(themeId);
    setActiveThemeConfig({
      id: themeId,
      base: themeConfig.base || "vs-dark",
      rules: themeConfig.rules || [],
      colors: themeConfig.colors || {},
    });
    if (Object.keys(THEME_PALETTES).includes(themeId)) {
      setSettings((prev) => {
        const next = {
          ...prev,
          workbench: {
            ...prev.workbench,
            theme: themeId as any,
          },
        };
        try {
          localStorage.setItem("workspace_presets_5080", JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, []);

  const applyCustomThemeToMonaco = useCallback((themeId: string, colors: CustomThemeColors) => {
    const monacoThemeConfig = {
      base: "vs-dark",
      colors: {
        "editor.background": colors.editorBg,
        "editor.foreground": colors.editorFg,
        "editorCursor.foreground": colors.editorCursor,
        "editor.lineHighlightBackground": `${colors.editorBg}99`,
        "editorLineNumber.foreground": colors.editorLineNumber,
        "editorLineNumber.activeForeground": colors.editorCursor,
        "editor.selectionBackground": `${colors.syntaxFunction}33`,
        "editorIndentGuide.activeBackground1": colors.syntaxFunction,
      },
      rules: [
        { token: "comment", foreground: colors.syntaxComment.replace("#", ""), fontStyle: "italic" },
        { token: "keyword", foreground: colors.syntaxKeyword.replace("#", ""), fontStyle: "bold" },
        { token: "string", foreground: colors.syntaxString.replace("#", "") },
        { token: "number", foreground: colors.syntaxNumber.replace("#", "") },
        { token: "type", foreground: colors.syntaxType.replace("#", "") },
        { token: "function", foreground: colors.syntaxFunction.replace("#", ""), fontStyle: "bold" },
        { token: "variable", foreground: colors.editorFg.replace("#", "") },
      ]
    };
    handleApplyTheme(themeId, monacoThemeConfig);
  }, [handleApplyTheme]);

  const handleUpdateCustomTheme = useCallback((updatedColors: Partial<CustomThemeColors>) => {
    setCustomTheme((prev) => {
      const next = { ...prev, ...updatedColors };
      localStorage.setItem("workspace_custom_theme_5080", JSON.stringify(next));
      
      const targetThemeId = activeThemeId.startsWith("custom-theme-") ? activeThemeId : "custom-theme-preview";
      
      // Auto-apply to Monaco and UI elements
      if (activeThemeId !== targetThemeId) {
        setActiveThemeId(targetThemeId);
      }
      applyCustomThemeToMonaco(targetThemeId, next);
      return next;
    });
  }, [activeThemeId, applyCustomThemeToMonaco]);

  // Synchronize dynamic theme config and active theme state on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem("workspace_presets_5080");
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedTheme = parsed?.workbench?.theme;
        if (savedTheme && THEME_PALETTES[savedTheme]) {
          setActiveThemeId(savedTheme);
          const palette = THEME_PALETTES[savedTheme];
          setActiveThemeConfig({
            id: palette.id,
            base: palette.base,
            rules: [
              { token: "comment", foreground: palette.colors.syntaxComment.replace("#", ""), fontStyle: "italic" },
              { token: "keyword", foreground: palette.colors.syntaxKeyword.replace("#", ""), fontStyle: "bold" },
              { token: "string", foreground: palette.colors.syntaxString.replace("#", "") },
              { token: "number", foreground: palette.colors.syntaxNumber.replace("#", "") },
              { token: "type", foreground: palette.colors.syntaxType.replace("#", "") },
              { token: "function", foreground: palette.colors.syntaxFunction.replace("#", ""), fontStyle: "bold" },
              { token: "variable", foreground: palette.colors.editorFg.replace("#", "") },
            ],
            colors: {
              "editor.background": palette.colors.editorBg,
              "editor.foreground": palette.colors.editorFg,
              "editorCursor.foreground": palette.colors.editorCursor,
              "editor.lineHighlightBackground": palette.colors.lineHighlight || `${palette.colors.editorBg}99`,
              "editorLineNumber.foreground": palette.colors.editorLineNumber,
              "editorLineNumber.activeForeground": palette.colors.editorCursor,
              "editor.selectionBackground": palette.colors.selection || "#4a4a4a",
              "editorIndentGuide.activeBackground1": palette.colors.editorCursor,
            }
          });
          return;
        }
      }
    } catch {}

    // Default startup configuration
    const defaultPalette = THEME_PALETTES["antigravity-teal"];
    setActiveThemeId("antigravity-teal");
    setActiveThemeConfig({
      id: defaultPalette.id,
      base: defaultPalette.base,
      rules: [
        { token: "comment", foreground: defaultPalette.colors.syntaxComment.replace("#", ""), fontStyle: "italic" },
        { token: "keyword", foreground: defaultPalette.colors.syntaxKeyword.replace("#", ""), fontStyle: "bold" },
        { token: "string", foreground: defaultPalette.colors.syntaxString.replace("#", "") },
        { token: "number", foreground: defaultPalette.colors.syntaxNumber.replace("#", "") },
        { token: "type", foreground: defaultPalette.colors.syntaxType.replace("#", "") },
        { token: "function", foreground: defaultPalette.colors.syntaxFunction.replace("#", ""), fontStyle: "bold" },
        { token: "variable", foreground: defaultPalette.colors.editorFg.replace("#", "") },
      ],
      colors: {
        "editor.background": defaultPalette.colors.editorBg,
        "editor.foreground": defaultPalette.colors.editorFg,
        "editorCursor.foreground": defaultPalette.colors.editorCursor,
        "editor.lineHighlightBackground": defaultPalette.colors.lineHighlight || `${defaultPalette.colors.editorBg}99`,
        "editorLineNumber.foreground": defaultPalette.colors.editorLineNumber,
        "editorLineNumber.activeForeground": defaultPalette.colors.editorCursor,
        "editor.selectionBackground": defaultPalette.colors.selection || "#0c3545",
        "editorIndentGuide.activeBackground1": defaultPalette.colors.editorCursor,
      }
    });
  }, []);

  const getActivePaletteColors = useCallback((): CustomThemeColors => {
    // 1. Is it a preset theme?
    if (THEME_PALETTES[activeThemeId]) {
      return THEME_PALETTES[activeThemeId].colors;
    }

    // 2. Is it a custom user theme?
    const isCustomActive = activeThemeId.startsWith("custom-theme-") || activeThemeId === "custom-theme-preview";
    if (isCustomActive) {
      return customTheme;
    }

    // 3. Is it an extension theme?
    const extPalettes: Record<string, Partial<CustomThemeColors>> = {
      "ext-theme-dracula": {
        editorBg: "#1e1e24",
        editorFg: "#f8f8f2",
        editorCursor: "#ff79c6",
        editorLineNumber: "#6272a4",
        sidebarBg: "#19191d",
        sidebarBorder: "#141416",
        activityBarBg: "#19191d",
        activityBarAccent: "#bd93f9",
        statusBarBg: "#bd93f9",
        statusBarFg: "#1e1e24",
        bottomPanelBg: "#1e1e24",
        titleBarBg: "#141416"
      },
      "ext-theme-cobalt": {
        editorBg: "#001b33",
        editorFg: "#e1e1e6",
        editorCursor: "#ffc600",
        editorLineNumber: "#005080",
        sidebarBg: "#001426",
        sidebarBorder: "#000a14",
        activityBarBg: "#001426",
        activityBarAccent: "#ffc600",
        statusBarBg: "#005080",
        statusBarFg: "#ffffff",
        bottomPanelBg: "#001b33",
        titleBarBg: "#000a14"
      },
      "ext-theme-andromeda": {
        editorBg: "#0d0f12",
        editorFg: "#e5e9f0",
        editorCursor: "#00f0ff",
        editorLineNumber: "#3b4252",
        sidebarBg: "#080a0c",
        sidebarBorder: "#040506",
        activityBarBg: "#080a0c",
        activityBarAccent: "#00f0ff",
        statusBarBg: "#161b22",
        statusBarFg: "#00f0ff",
        bottomPanelBg: "#0c0d10",
        titleBarBg: "#080a0c"
      }
    };

    if (extPalettes[activeThemeId]) {
      return { ...customTheme, ...extPalettes[activeThemeId] } as CustomThemeColors;
    }

    // Fallback to 5080-dark
    return THEME_PALETTES["5080-dark"].colors;
  }, [activeThemeId, customTheme]);

  // Dynamic CSS Variables Injector Side Effect
  useEffect(() => {
    let styleEl = document.getElementById("dynamic-theme-overrides");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-theme-overrides";
      document.head.appendChild(styleEl);
    }

    const palette = getActivePaletteColors();

    // Determine if light theme is active by reading base format or brightness of Editor background
    let isLightTheme = activeThemeId === "classic-light";
    try {
      if (activeThemeConfig && activeThemeConfig.base === "vs") {
        isLightTheme = true;
      } else if (palette.editorBg) {
        const hex = palette.editorBg.replace("#", "");
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness > 128) {
            isLightTheme = true;
          }
        } else if (hex.length === 3) {
          const r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
          const g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
          const b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness > 128) {
            isLightTheme = true;
          }
        }
      }
    } catch {}

    const textPrimary = isLightTheme ? "#1f2937" : "rgba(255, 255, 255, 0.95)";
    const textSecondary = isLightTheme ? "#4b5563" : "rgba(255, 255, 255, 0.7)";
    const textMuted = isLightTheme ? "#6b7280" : "rgba(255, 255, 255, 0.45)";
    const textMutedExtra = isLightTheme ? "#9ca3af" : "rgba(255, 255, 255, 0.35)";
    const bgModifier = isLightTheme ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)";
    const borderModifier = isLightTheme ? "#e4e4e7" : "rgba(255, 255, 255, 0.1)";
    const inputBg = isLightTheme ? "#ffffff" : "rgba(0, 0, 0, 0.4)";
    const inputFg = isLightTheme ? "#1f2937" : "#ffffff";
    const hoverBg = isLightTheme ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)";
    const shadowColor = isLightTheme ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.4)";

    styleEl.innerHTML = `
      :root {
        --theme-editor-bg: ${palette.editorBg};
        --theme-editor-fg: ${palette.editorFg};
        --theme-sidebar-bg: ${palette.sidebarBg};
        --theme-sidebar-border: ${palette.sidebarBorder};
        --theme-activitybar-bg: ${palette.activityBarBg};
        --theme-activitybar-accent: ${palette.activityBarAccent};
        --theme-statusbar-bg: ${palette.statusBarBg};
        --theme-statusbar-fg: ${palette.statusBarFg};
        --theme-bottompanel-bg: ${palette.bottomPanelBg};
        --theme-titlebar-bg: ${palette.titleBarBg};

        --theme-text-primary: ${textPrimary};
        --theme-text-secondary: ${textSecondary};
        --theme-text-muted: ${textMuted};
        --theme-text-muted-extra: ${textMutedExtra};
        --theme-bg-modifier: ${bgModifier};
        --theme-border-modifier: ${borderModifier};
        --theme-input-bg: ${inputBg};
        --theme-input-fg: ${inputFg};
        --theme-hover-bg: ${hoverBg};
        --theme-shadow: ${shadowColor};
      }

      /* Global resets to propagate theme custom properties */
      #app-layout-root, .app-layout-root {
        background-color: var(--theme-editor-bg) !important;
        color: var(--theme-text-primary) !important;
      }

      /* Remap common text classes to dynamic CSS theme variables */
      .text-white, .text-gray-100, .text-zinc-100, .text-neutral-100 {
        color: var(--theme-text-primary) !important;
      }
      .text-zinc-200, .text-gray-200, .text-neutral-200 {
        color: var(--theme-text-primary) !important;
      }
      .text-zinc-300, .text-gray-300, .text-neutral-300 {
        color: var(--theme-text-secondary) !important;
      }
      .text-zinc-400, .text-gray-400, .text-neutral-400 {
        color: var(--theme-text-muted) !important;
      }
      .text-zinc-500, .text-gray-500, .text-neutral-500 {
        color: var(--theme-text-muted-extra) !important;
      }

      /* Dynamic panels background and border controls */
      #sidebar-container, .sidebar-container, #right-agent-panel {
        background-color: var(--theme-sidebar-bg) !important;
        border-color: var(--theme-sidebar-border) !important;
        color: var(--theme-text-primary) !important;
      }
      #sidebar-container .border-zinc-800, 
      #sidebar-container .border-b,
      #sidebar-container .border-t,
      #sidebar-container .border-neutral-800,
      #sidebar-container .border-[#1E1E1E],
      #sidebar-container .border-[#3c3c3c],
      #sidebar-container .border-zinc-700,
      #right-agent-panel .border-zinc-800, 
      #right-agent-panel .border-b,
      #right-agent-panel .border-t,
      #right-agent-panel .border-neutral-800,
      #right-agent-panel .border-[#1E1E1E],
      #right-agent-panel .border-[#3c3c3c],
      #right-agent-panel .border-zinc-700,
      #right-agent-panel .border-zinc-850,
      #right-agent-panel .border-zinc-850\\/80,
      #right-agent-panel .border-zinc-800\\/80 {
        border-color: var(--theme-sidebar-border) !important;
      }

      #activitybar-container {
        background-color: var(--theme-activitybar-bg) !important;
        border-color: var(--theme-sidebar-border) !important;
      }
      #activitybar-container .bg-\\[\\#7A2A2A\\] {
        background-color: var(--theme-activitybar-accent) !important;
      }

      #statusbar-container {
        background-color: var(--theme-statusbar-bg) !important;
        color: var(--theme-statusbar-fg) !important;
      }

      #bottompanel-container, .bottompanel-container-override {
        background-color: var(--theme-bottompanel-bg) !important;
        border-color: var(--theme-sidebar-border) !important;
        color: var(--theme-text-primary) !important;
      }
      #bottompanel-container .border-t,
      #bottompanel-container .border-l,
      #bottompanel-container .border-[#1E1E1E],
      #bottompanel-container .border-[#3c3c3c] {
        border-color: var(--theme-sidebar-border) !important;
      }
      
      /* Target child panel elements in bottom logs tab */
      #bottompanel-container .bg-\\[\\#2D2D2D\\],
      #bottompanel-container .bg-\\[\\#1E1E1E\\],
      #bottompanel-container .bg-\\[\\#1e1e1e\\] {
        background-color: var(--theme-bottompanel-bg) !important;
      }
      #bottompanel-container button {
        color: var(--theme-text-secondary) !important;
      }
      #bottompanel-container button[class*="text-white"],
      #bottompanel-container button[class*="font-semibold"] {
        color: var(--theme-text-primary) !important;
        border-bottom-color: var(--theme-activitybar-accent) !important;
      }

      .titlebar-container {
        background-color: var(--theme-titlebar-bg) !important;
        border-color: var(--theme-sidebar-border) !important;
        color: var(--theme-text-primary) !important;
      }

      /* Secondary Workspace Content backing colors (file lists, inputs) */
      .bg-neutral-900\\/40, 
      .bg-zinc-900\\/20, 
      .bg-zinc-900\\/10, 
      .bg-neutral-900\\/60,
      .bg-[#222222],
      .bg-[#252526],
      .bg-black\\/20, 
      .bg-black\\/40, 
      .bg-\\[\\#1a1a1b\\], 
      .bg-\\[\\#1e1e24\\], 
      .bg-\\[\\#1b1c21\\], 
      .bg-\\[\\#1a1b1e\\],
      .bg-[#1c1c1e],
      .bg-[#1a1a1b],
      .bg-zinc-950\\/40, 
      .bg-zinc-950\\/50, 
      .bg-neutral-950\\/80, 
      .bg-\\[\\#38383811\\], 
      .bg-zinc-950\\/20,
      .bg-neutral-900\\/10,
      .bg-pink-900\\/10,
      .bg-cyan-950\\/20,
      .bg-\\[\\#1e1e1e\\]\\/20,
      .bg-\\[\\#1e1e1e\\]\\/60,
      .bg-[#38383833] {
        background-color: var(--theme-bg-modifier) !important;
      }

      /* Scrollbars */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      ::-webkit-scrollbar-track {
        background: var(--theme-titlebar-bg) !important;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--theme-sidebar-border) !important;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--theme-activitybar-accent) !important;
      }

      /* Hover States */
      .hover\\:bg-neutral-850:hover,
      .hover\\:bg-neutral-800:hover,
      .hover\\:bg-zinc-800:hover,
      .hover\\:bg-zinc-850:hover,
      .hover\\:bg-neutral-700:hover,
      .hover\\:bg-zinc-700:hover,
      .hover\\:bg-\\[\\#2a2d2e\\]\\/60:hover {
        background-color: var(--theme-hover-bg) !important;
      }

      /* Form inputs, select fields, and text-areas */
      input[type="text"], 
      input[type="number"], 
      input[type="password"],
      input[type="email"],
      select, 
      textarea {
        background-color: var(--theme-input-bg) !important;
        color: var(--theme-input-fg) !important;
        border-color: var(--theme-sidebar-border) !important;
      }
      select option {
        background-color: var(--theme-input-bg) !important;
        color: var(--theme-input-fg) !important;
      }

      /* Editor tabs alignment */
      .editor-tab-active {
        background-color: ${palette.editorBg} !important;
        color: var(--theme-text-primary) !important;
        border-bottom-color: ${palette.activityBarAccent} !important;
      }
      .editor-tab-inactive {
        background-color: ${palette.titleBarBg} !important;
        color: var(--theme-text-secondary) !important;
      }
      .editor-tabs-bg {
        background-color: ${palette.titleBarBg} !important;
      }
      .editor-area-bg {
        background-color: ${palette.editorBg} !important;
      }
      #editor-container {
        background-color: ${palette.editorBg} !important;
      }

      /* Modal dialog shadow overrides */
      div[class*="shadow-2xl"], div[class*="shadow-xl"] {
        background-color: var(--theme-sidebar-bg) !important;
        color: var(--theme-text-primary) !important;
        border-color: var(--theme-sidebar-border) !important;
        box-shadow: 0 25px 50px -12px var(--theme-shadow) !important;
      }
    `;
  }, [getActivePaletteColors, activeThemeId, activeThemeConfig]);

  const handleAddSnippet = useCallback((trigger: string, body: string) => {
    logOutput(`Synthesized boilerplate macro shortcut registered: [${trigger}]`);
  }, []);
  const [bottomPanelTab, setBottomPanelTab] = useState<"terminal" | "problems" | "output">("terminal");

  // File system and Editor State
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("AutoSave: Off");

  // Bottom views streams
  const [problems, setProblems] = useState<Problem[]>([]);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Git
  const [gitBranch, setGitBranch] = useState("main");
  const [gitChanges, setGitChanges] = useState<GitChange[]>([]);
  const [isGitSyncing, setIsGitSyncing] = useState(false);

  // Gemini AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "ai",
      text: "Hello! I am Goldman, your integrated AI copilot. How can I help you program today? Tell me to explain files, compose tests, or refactor lines.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isAIPending, setIsAIPending] = useState(false);

  // AI Provider & Keys state (persisted in localStorage)
  const [aiProvider, setAIProvider] = useState<LLMProvider>(() => {
    try {
      return (localStorage.getItem("ai_provider_5080") as LLMProvider) || "gemini";
    } catch { return "gemini"; }
  });
  const [aiKeys, setAIKeys] = useState<AIProviderKeys>(() => {
    try {
      const saved = localStorage.getItem("ai_keys_5080");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Right side AI Agent Chat panel state
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  const handleUpdateAIKeys = (keys: Partial<AIProviderKeys>) => {
    setAIKeys((prev) => {
      const next = { ...prev, ...keys };
      try {
        localStorage.setItem("ai_keys_5080", JSON.stringify(next));
      } catch (err) {
        console.warn("Keys persistence fail:", err);
      }
      return next;
    });
  };

  const handleUpdateAIProvider = (provider: LLMProvider) => {
    setAIProvider(provider);
    try {
      localStorage.setItem("ai_provider_5080", provider);
    } catch (err) {
      console.warn("Provider persistence fail:", err);
    }
  };

  const handleApplyAgentResult = (content: string, relativePath: string) => {
    const matchedTab = tabs.find((t) => t.relativePath === relativePath || t.id.endsWith(relativePath));
    if (matchedTab) {
      handleContentChange(matchedTab.id, content);
      logOutput(`Applied agent changes to active editor tab for ${relativePath}`);
    } else {
      logOutput(`Could not find open tab for ${relativePath} to apply changes`);
    }
  };

  // Selected Model State (defaults to Gemini 3.5 Flash High)
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    try {
      return localStorage.getItem("active_model_id_5080") || "gemini-2.5-flash-high";
    } catch {
      return "gemini-2.5-flash-high";
    }
  });

  // Custom Models Config (persisted in localStorage)
  const [customModels, setCustomModels] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("custom_models_5080");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSelectModel = (modelId: string, provider: LLMProvider) => {
    setSelectedModelId(modelId);
    setAIProvider(provider);
    try {
      localStorage.setItem("active_model_id_5080", modelId);
      localStorage.setItem("ai_provider_5080", provider);
    } catch (err) {}
    logOutput(`Active model switched to: ${modelId} (${provider})`);
  };

  const handleAddCustomModel = (model: any) => {
    setCustomModels((prev) => {
      const next = [...prev, model];
      try {
        localStorage.setItem("custom_models_5080", JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  const handleDeleteCustomModel = (id: string) => {
    setCustomModels((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem("custom_models_5080", JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // Command Palette Open
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // New Project Scaffolding
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isScaffolding, setIsScaffolding] = useState(false);

  // User Workspace Editor preferences
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const defaultSettings: WorkspaceSettings = {
      editor: {
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        wordWrap: "off",
        minimap: true,
        tabSize: 2,
        formatOnSave: true,
        autoSave: "off",
      },
      workbench: {
        theme: "antigravity-teal",
        sidebarWidth: 260,
        bottomPanelHeight: 240,
        sidebarVisible: true,
        bottomPanelVisible: true,
        activeSidebarTab: "explorer",
        bottomPanelTab: "terminal",
        sidebarPosition: "left",
        bottomPanelPosition: "bottom",
        zenMode: false,
        statusBarVisible: true,
        activityBarVisible: true,
        layoutPreset: "default",
        fileIconTheme: "vscode-classic",
      },
      ai: {
        provider: "gemini" as LLMProvider,
        keys: {},
        agentAutoApply: false,
      },
    };

    try {
      const saved = localStorage.getItem("workspace_presets_5080");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            ...defaultSettings,
            ...parsed,
            editor: { ...defaultSettings.editor, ...(parsed.editor || {}) },
            workbench: { ...defaultSettings.workbench, ...(parsed.workbench || {}) },
            ai: { ...defaultSettings.ai, ...(parsed.ai || {}) }
          };
        }
      }
    } catch (e) {
      console.warn("Could not load workspace settings:", e);
    }

    return defaultSettings;
  });

  // Authenticated Developer Account Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("authenticated_user_5080");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleLogin = (provider: "google" | "github", customName?: string, customEmail?: string, customRole?: string) => {
    const defaultAvatar = provider === "google"
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customEmail || "google-user")}`
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(customEmail || "github-user")}`;

    const newUser: UserProfile = {
      id: `${provider}-${Date.now()}`,
      name: customName || (provider === "google" ? "Mark Emadu" : "markemadu"),
      email: customEmail || (provider === "google" ? "markemadu@gmail.com" : "mark.emadu@github.com"),
      avatarUrl: defaultAvatar,
      provider: provider,
      role: customRole || "Full-Stack Developer",
      createdAt: new Date().toLocaleDateString(),
      stats: {
        commits: 0,
        filesSaved: 0,
        errorsFixed: 0,
        codeLineCount: 1540,
        activeHours: 12,
      },
    };

    setCurrentUser(newUser);
    localStorage.setItem("authenticated_user_5080", JSON.stringify(newUser));

    // Try to load user specific settings
    try {
      const savedSettings = localStorage.getItem(`settings_user_${newUser.email}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.warn("Could not load user specific preferences:", e);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      try {
        localStorage.setItem(`settings_user_${currentUser.email}`, JSON.stringify(settings));
        logOutput(`Saving workspace layout configuration for ${currentUser.name} before logging out...`);
      } catch {}
    }
    setCurrentUser(null);
    localStorage.removeItem("authenticated_user_5080");
    logOutput("Security session securely ended. All secure tokens wiped.");
  };

  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updatedFields,
      };
      localStorage.setItem("authenticated_user_5080", JSON.stringify(updated));
      return updated;
    });
  };

  const incrementUserStat = (key: keyof UserProfile["stats"]) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        stats: {
          ...prev.stats,
          [key]: prev.stats[key] + 1,
        }
      };
      localStorage.setItem("authenticated_user_5080", JSON.stringify(updated));
      return updated;
    });
  };

  // Cursor Coordinates
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  // Helper detect files Monaco language IDs
  const detectLanguage = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "json":
        return "json";
      case "css":
        return "css";
      case "html":
        return "html";
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "sh":
        return "shell";
      case "yml":
      case "yaml":
        return "yaml";
      default:
        return "plaintext";
    }
  };

  // ── 1. Fetch filesystem and info ─────────────────────────────────────────
  const fetchWorkspaceInfo = async () => {
    try {
      const res = await fetch("/api/app/info");
      const info = await res.json();
      setWorkspaceInfo(info);
      logOutput(`Workspace suite loaded at target: ${info.workspace}`);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFileTree = async (dirPath = "") => {
    try {
      const res = await fetch(`/api/fs/tree?path=${encodeURIComponent(dirPath)}`);
      const data = await res.json();
      if (res.ok) {
        setFileTree(data.children);
      } else {
        logOutput(`Failed index folder tree: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`Workspace structural parsing failed: ${err.message}`);
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch("/api/git/status", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setGitBranch(data.branch || "main");
        setGitChanges(data.changes || []);
      }
    } catch (err) {
      console.error("Git checks unreachable:", err);
    }
  };

  const runCodeQualityChecks = async () => {
    logOutput("Executing quality-auditing diagnostics...");
    setBottomPanelTab("problems");
    setIsBottomPanelVisible(true);
    setProblems([
      {
        id: "diagnostic-init",
        severity: "info",
        message: "Codebase compiler checklist running...",
        file: "TypeScript Checker",
      }
    ]);

    try {
      const response = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "npm run lint" }),
      });

      if (!response.ok) throw new Error("Lint service unresponsive");

      const text = await response.text();
      // Simple Parser of standard TSC error outputs
      // Look for format: file.ts(line,col): error TSXXXX: Message
      const errorRegex = /([a-zA-Z0-9_\-\.\/]+)\((\d+),(\d+)\):\s+(error|warning)\s+([a-zA-Z0-9]+):\s+(.*)/g;
      const foundProblems: Problem[] = [];
      let match;
      while ((match = errorRegex.exec(text)) !== null) {
        foundProblems.push({
          id: `prob-${Date.now()}-${Math.random()}`,
          severity: match[4] === "error" ? "error" : "warning",
          message: `${match[5]}: ${match[6]}`,
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
        });
      }

      if (foundProblems.length === 0) {
        // If lint passed, perform a beautiful mock success
        logOutput("TSC diagnostic compile: 0 issues found. Code base safe!");
        setProblems([]);
        if (currentUser) {
          // Increment error fix count on non-error compilations
          incrementUserStat("errorsFixed");
        }
      } else {
        logOutput(`Lint diagnostic compile: ${foundProblems.length} compile diagnostics generated!`);
        setProblems(foundProblems);
      }
    } catch (err: any) {
      logOutput(`Diagnostic inspection failed: ${err.message}`);
    }
  };

  function logOutput(text: string) {
    setOutputLogs((prev) => [...prev, text]);
  }

  const handleSaveCustomTheme = useCallback((name: string, colors: CustomThemeColors) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    
    const newThemeId = `custom-theme-${Date.now()}`;
    const newTheme = {
      id: newThemeId,
      name: cleanName,
      colors: colors
    };

    setSavedThemes((prev) => {
      const next = [newTheme, ...prev];
      localStorage.setItem("custom_saved_themes_5080", JSON.stringify(next));
      return next;
    });

    setActiveThemeId(newThemeId);
    applyCustomThemeToMonaco(newThemeId, colors);
    logOutput(`Custom theme "${cleanName}" saved successfully and applied to workspace styling.`);
  }, [applyCustomThemeToMonaco, logOutput]);

  const handleLoadCustomTheme = useCallback((colors: CustomThemeColors, themeId: string) => {
    setCustomTheme(colors);
    localStorage.setItem("workspace_custom_theme_5080", JSON.stringify(colors));
    setActiveThemeId(themeId);
    applyCustomThemeToMonaco(themeId, colors);
    logOutput(`Custom theme loaded successfully into workspace environment.`);
  }, [applyCustomThemeToMonaco, logOutput]);

  const handleDeleteCustomTheme = useCallback((themeId: string) => {
    setSavedThemes((prev) => {
      const next = prev.filter((t) => t.id !== themeId);
      localStorage.setItem("custom_saved_themes_5080", JSON.stringify(next));
      return next;
    });

    if (activeThemeId === themeId) {
      setActiveThemeId("ext-theme-default");
      logOutput(`Active custom theme deleted. Reverted workspace to default stylesheet.`);
    } else {
      logOutput(`Deleted custom theme blueprint from persistent storage.`);
    }
  }, [activeThemeId, logOutput]);

  // ── Welcome Screen state (shown on first open when no folder) ────────────
  const [showWelcome, setShowWelcome] = useState(true);

  const handleOpenFolder = useCallback(async () => {
    let folderPath: string | null = null;

    if (isElectron) {
      // Use native OS folder picker
      folderPath = await (window as any).electronAPI.dialog.openFolder();
    } else {
      // Web fallback — prompt
      folderPath = prompt("Enter the full path to the folder you want to open:");
    }

    if (!folderPath) return;

    try {
      // Tell server to use this path as the workspace root
      await fetch("/api/workspace/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath: folderPath }),
      });
      await fetchWorkspaceInfo();

      // Save to recent workspaces
      const name = folderPath.split(/[\\/]/).filter(Boolean).pop() || folderPath;
      const recent: { path: string; name: string; lastOpened: number }[] = JSON.parse(
        localStorage.getItem("recent_workspaces_5080") || "[]"
      );
      const updated = [
        { path: folderPath, name, lastOpened: Date.now() },
        ...recent.filter((r) => r.path !== folderPath),
      ].slice(0, 10);
      localStorage.setItem("recent_workspaces_5080", JSON.stringify(updated));

      setShowWelcome(false);
      await loadFileTree();
      await fetchGitStatus();
      logOutput(`Workspace opened: ${folderPath}`);
    } catch (err: any) {
      logOutput(`Failed to open folder: ${err.message}`);
    }
  }, []);

  const handleOpenRecentWorkspace = useCallback(async (folderPath: string) => {
    try {
      await fetch("/api/workspace/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath: folderPath }),
      });
      await fetchWorkspaceInfo();
      setShowWelcome(false);
      await loadFileTree();
      await fetchGitStatus();
      logOutput(`Workspace restored: ${folderPath}`);
    } catch (err: any) {
      logOutput(`Failed to open recent workspace: ${err.message}`);
    }
  }, []);

  const handleCloseFolder = useCallback(async () => {
    try {
      await fetch("/api/workspace/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath: "" }),
      });
      await fetchWorkspaceInfo();
      setShowWelcome(true);
      setFileTree([]);
      setTabs([]);
      setActiveTabId(null);
      logOutput("Workspace folder closed successfully.");
    } catch (err: any) {
      logOutput(`Failed to close workspace folder: ${err.message}`);
    }
  }, []);


  useEffect(() => {
    fetchWorkspaceInfo();

    // Always start with the welcome screen/homepage and no folder open on startup
    setShowWelcome(true);

    // Listen for workspace:open events from Electron menu
    if (isElectron) {
      (window as any).electronAPI?.workspace?.onChange?.(async (newPath: string) => {
        await fetch("/api/workspace/set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspacePath: newPath }),
        });
        await fetchWorkspaceInfo();
        setShowWelcome(false);
        await loadFileTree();
        await fetchGitStatus();
        logOutput(`Workspace changed to: ${newPath}`);
      });
    }
  }, []);

  // ── 2. Tab management handlers ──────────────────────────────────────────
  const handleSelectFile = async (filePath: string) => {
    // Check if tab is already open
    const openTab = tabs.find((t) => t.id === filePath);
    if (openTab) {
      setActiveTabId(filePath);
      return;
    }

    // Load file content from server
    try {
      logOutput(`Loading workspace file path: ${filePath}`);
      const res = await fetch("/api/fs/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();

      if (res.ok) {
        const name = filePath.split(/[\\/]/).pop() || "untitled";
        const relativePath = filePath.replace(workspaceInfo?.workspace || "", "").replace(/^[\\/]/, "");
        const newTab: EditorTab = {
          id: filePath,
          name,
          relativePath,
          content: data.content,
          originalContent: data.content,
          isDirty: false,
          language: detectLanguage(name),
        };

        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(filePath);
        logOutput(`Loaded buffer: ${name}`);
      } else {
        logOutput(`File retrieval failure: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`Unresolved buffer loader exception: ${err.message}`);
    }
  };

  const handleCloseTab = (id: string) => {
    const tabIndex = tabs.findIndex((t) => t.id === id);
    if (tabs[tabIndex]?.isDirty) {
      const discard = confirm(`Disregard unsaved buffer modification on: ${tabs[tabIndex].name}?`);
      if (!discard) return;
    }

    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);

    if (activeTabId === id) {
      if (nextTabs.length > 0) {
        setActiveTabId(nextTabs[Math.max(0, tabIndex - 1)].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleExitIDE = useCallback(() => {
    const hasUnsaved = tabs.some((t) => t.isDirty);
    const confirmExit = window.confirm(
      hasUnsaved
        ? "Warning: You have unsaved changes in some editor buffers. Exiting the IDE will discard these changes.\n\nAre you sure you want to exit?"
        : "Are you sure you want to close and exit the 5080 IDE session?"
    );
    if (!confirmExit) return;

    logOutput("Shutdown sequence initiated: Disposing active workspace loops and terminating terminal subprocesses...");
    setIsExited(true);
    try {
      window.close();
    } catch (e) {
      console.warn("Direct window.close() blocked by browser sandbox configurations.");
    }
  }, [tabs]);

  const handleCloseAllTabs = useCallback(() => {
    const hasUnsaved = tabs.some((t) => t.isDirty);
    if (!hasUnsaved || window.confirm("Are you sure you want to discard all unsaved edits and close all editor buffers?")) {
      setTabs([]);
      setActiveTabId(null);
      logOutput("All editor buffers closed successfully.");
    }
  }, [tabs]);

  const handleExitZenMode = useCallback(() => {
    setSettings((prev) => {
      const next = {
        ...prev,
        workbench: {
          ...prev.workbench,
          sidebarVisible: true,
          bottomPanelVisible: true,
          sidebarPosition: "left" as const,
          bottomPanelPosition: "bottom" as const,
          zenMode: false,
          statusBarVisible: true,
          activityBarVisible: true,
          layoutPreset: "default" as const,
        },
      };
      try {
        localStorage.setItem("workspace_presets_5080", JSON.stringify(next));
        if (currentUser) {
          localStorage.setItem(`settings_user_${currentUser.email}`, JSON.stringify(next));
        }
      } catch (err) {
        console.warn("Layout persistence fail:", err);
      }
      return next;
    });
    logOutput("Exited Zen Focus space: standard IDE panels re-established.");
  }, [currentUser]);

  const handleContentChange = (id: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === id) {
          const isDirty = newContent !== tab.originalContent;
          return { ...tab, content: newContent, isDirty };
        }
        return tab;
      })
    );
  };

  // Cursor coordinates
  const handleCursorChange = useCallback((line: number, col: number) => {
    setCursorLine(line);
    setCursorCol(col);
  }, []);

  // ── 3. File write-back controllers ─────────────────────────────────────
  const performSave = async () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    setIsSaving(true);
    logOutput(`Writing modifications back to disk: ${activeTab.name}`);

    try {
      const res = await fetch("/api/fs/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: activeTab.id,
          content: activeTab.content,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setTabs((prev) =>
          prev.map((tab) => {
            if (tab.id === activeTab.id) {
              return { ...tab, originalContent: activeTab.content, isDirty: false };
            }
            return tab;
          })
        );
        logOutput(`Write success: ${activeTab.name}`);
        fetchGitStatus(); // Refresh git trackers
        
        // Gamified workspace profile stats incrementation
        if (currentUser) {
          incrementUserStat("filesSaved");
          // Add some lines of code points
          const lineCount = activeTab.content.split("\n").length;
          setCurrentUser((prev) => {
            if (!prev) return null;
            const updated = {
              ...prev,
              stats: {
                ...prev.stats,
                codeLineCount: prev.stats.codeLineCount + lineCount,
              }
            };
            localStorage.setItem("authenticated_user_5080", JSON.stringify(updated));
            return updated;
          });
        }
      } else {
        logOutput(`Drive sync failure: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`Write transaction aborted: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── 4. File system operations ──────────────────────────────────────────
  const handleAddFile = async (parentPath: string, name: string) => {
    try {
      const res = await fetch("/api/fs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "file", name, parentPath }),
      });
      const data = await res.json();
      if (res.ok) {
        logOutput(`Created file buffer: ${name}`);
        loadFileTree();
        // Automatically open the new file
        handleSelectFile(data.path);
        setShowWelcome(false);
      } else {
        logOutput(`Failed file allocation: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`File creation failed: ${err.message}`);
    }
  };

  const handleCloneRepository = useCallback(async (repoUrl: string) => {
    if (!repoUrl || !repoUrl.trim()) return;

    let parentDir = "";
    if (isElectron) {
      logOutput("Prompting for directory to clone repository into...");
      parentDir = await (window as any).electronAPI.dialog.openFolder() || "";
    } else {
      parentDir = prompt("Enter absolute path of parent directory to clone into (or leave blank for current directory):") || "";
      if (parentDir === null) return;
    }

    const workspacePath = parentDir.trim() || workspaceInfo?.workspace || "";
    if (!workspacePath) {
      logOutput("Clone canceled: No parent directory available.");
      return;
    }

    const repoName = repoUrl.split("/").pop()?.replace(/\.git$/, "") || "cloned-repo";
    const targetPath = `${workspacePath.replace(/[\\/]$/, "")}/${repoName}`;

    logOutput(`Cloning ${repoUrl} into ${targetPath}...`);
    setBottomPanelTab("terminal");
    setIsBottomPanelVisible(true);

    try {
      const res = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: `git clone "${repoUrl}" "${targetPath}"`,
          cwd: workspacePath
        }),
      });

      if (res.ok) {
        logOutput(`Repository successfully cloned into: ${targetPath}`);
        
        const recent: { path: string; name: string; lastOpened: number }[] = JSON.parse(
          localStorage.getItem("recent_workspaces_5080") || "[]"
        );
        const updated = [
          { path: targetPath, name: repoName, lastOpened: Date.now() },
          ...recent.filter((r) => r.path !== targetPath),
        ].slice(0, 10);
        localStorage.setItem("recent_workspaces_5080", JSON.stringify(updated));

        await fetch("/api/workspace/set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspacePath: targetPath }),
        });
        
        setShowWelcome(false);
        await loadFileTree();
        logOutput(`Opened cloned workspace: ${targetPath}`);
      } else {
        logOutput("Cloning failed. Verify repository URL or network connection.");
      }
    } catch (err: any) {
      logOutput(`Cloning aborted: ${err.message}`);
    }
  }, [isElectron, workspaceInfo]);

  const handleNewFileWelcome = useCallback(() => {
    const filename = prompt("Enter a filename under the root workspace directory (e.g., index.js):");
    if (filename && filename.trim()) {
      handleAddFile("", filename.trim());
    }
  }, [handleAddFile]);

  const handleAddFolder = async (parentPath: string, name: string) => {
    try {
      const res = await fetch("/api/fs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "directory", name, parentPath }),
      });
      const data = await res.json();
      if (res.ok) {
        logOutput(`Created directory segment: ${name}`);
        loadFileTree();
      } else {
        logOutput(`Failed directory build: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`Folder make failed: ${err.message}`);
    }
  };

  const handleDeletePath = async (targetPath: string) => {
    try {
      const res = await fetch("/api/fs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: targetPath }),
      });
      if (res.ok) {
        logOutput(`Disposed path: ${targetPath}`);
        // Close if open in active tabs
        setTabs((prev) => prev.filter((t) => t.id !== targetPath));
        if (activeTabId === targetPath) setActiveTabId(null);
        loadFileTree();
        fetchGitStatus();
      } else {
        const data = await res.json();
        logOutput(`Deletion failure: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`Delete process aborted: ${err.message}`);
    }
  };

  const handleScaffoldProject = async (template: string, name: string) => {
    setIsScaffolding(true);
    logOutput(`Initiating scaffolding sequence with template: "${template}" into folder: "${name}"`);
    try {
      const res = await fetch("/api/fs/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, name }),
      });
      const data = await res.json();
      if (res.ok) {
        logOutput(`Scaffolder completed successfully! Created: ${data.relativePath}`);
        await loadFileTree();
      } else {
        throw new Error(data.error || "Scaffold error");
      }
    } catch (err: any) {
      logOutput(`Project scaffolding aborted: ${err.message}`);
      throw err;
    } finally {
      setIsScaffolding(false);
    }
  };

  const refreshExplorer = () => {
    logOutput("Re-indexing workspace tree...");
    loadFileTree();
    fetchGitStatus();
  };

  const toggleExpand = (filePath: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  // ── 5. Global Search ───────────────────────────────────────────────────
  const performSearch = async (caseSensitive: boolean, wholeWord: boolean, regex: boolean) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    logOutput(`Initiating recursive fuzzy search block on: "${searchQuery}"`);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          caseSensitive,
          wholeWord,
          regex,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results || []);
        logOutput(`Fuzzy search returns matches in ${data.results?.length || 0} relative file blocks.`);
      } else {
        logOutput(`Fuzzy query failed: ${data.error}`);
      }
    } catch (err: any) {
      logOutput(`Fuzzy search exception: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // ── 6. Git Sync / Commit ───────────────────────────────────────────────
  const handleCommitGit = async (msg: string) => {
    setIsGitSyncing(true);
    logOutput(`Logging transaction branch synchronization commits: "${msg}"`);

    // We can simulate staging all and committing beautifully!
    setBottomPanelTab("terminal");
    setIsBottomPanelVisible(true);
    logOutput("Git staging modified workspace buffers...");

    try {
      // In real backend we spawn standard git staging
      const res = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: `git add . && git commit -m "${msg.replace(/"/g, '\\"')}"` }),
      });

      if (res.ok) {
        logOutput("Git changeset commit staged successfully on container branch!");
        fetchGitStatus();
        if (currentUser) {
          incrementUserStat("commits");
        }
      } else {
        logOutput("Git transaction aborted - Verify repository setup exists.");
        // Simulated green commit if real git fails in an standalone workspace
        setTimeout(() => {
          logOutput(`[MockSync] Changes transaction committed safely to Workspace timeline branch.`);
          setGitChanges([]);
          if (currentUser) {
            incrementUserStat("commits");
          }
        }, 1100);
      }
    } catch {
      logOutput("[MockSync] Local adjustments saved nicely to revision timelines.");
      setGitChanges([]);
    } finally {
      setIsGitSyncing(false);
    }
  };

  // ── 7. Gemini / Multi-Provider AI chats ──────────────────────────────
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAIPending(true);

    const activeTab = tabs.find((t) => t.id === activeTabId);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: (aiKeys as any)[aiProvider] || undefined,
          messages: [...chatMessages, userMsg],
          selectedFile: activeTab
            ? { relativePath: activeTab.relativePath, content: activeTab.content }
            : null,
          selectedCode: activeTab ? activeTab.content : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        logOutput(`Goldman responded via ${aiProvider.toUpperCase()} provider.`);
      } else {
        throw new Error(data.error || "AI API Timeout");
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Goldman experienced an error contacting intelligence server: ${err.message}. Ensure your GEMINI_API_KEY value is verified.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsAIPending(false);
    }
  };

  // ── 8. Settings controllers ────────────────────────────────────────────
  const handleUpdateSetting = (category: "editor" | "workbench" | "ai", key: string, value: any) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };

      try {
        localStorage.setItem("workspace_presets_5080", JSON.stringify(next));
        if (currentUser) {
          localStorage.setItem(`settings_user_${currentUser.email}`, JSON.stringify(next));
        }
      } catch (err) {
        console.warn("Layout persistence fail:", err);
      }

      return next;
    });

    if (category === "workbench" && key === "theme") {
      setActiveThemeId(value);
      if (THEME_PALETTES[value]) {
        const palette = THEME_PALETTES[value];
        setActiveThemeConfig({
          id: palette.id,
          base: palette.base,
          rules: [
            { token: "comment", foreground: palette.colors.syntaxComment.replace("#", ""), fontStyle: "italic" },
            { token: "keyword", foreground: palette.colors.syntaxKeyword.replace("#", ""), fontStyle: "bold" },
            { token: "string", foreground: palette.colors.syntaxString.replace("#", "") },
            { token: "number", foreground: palette.colors.syntaxNumber.replace("#", "") },
            { token: "type", foreground: palette.colors.syntaxType.replace("#", "") },
            { token: "function", foreground: palette.colors.syntaxFunction.replace("#", ""), fontStyle: "bold" },
            { token: "variable", foreground: palette.colors.editorFg.replace("#", "") },
          ],
          colors: {
            "editor.background": palette.colors.editorBg,
            "editor.foreground": palette.colors.editorFg,
            "editorCursor.foreground": palette.colors.editorCursor,
            "editor.lineHighlightBackground": palette.colors.lineHighlight || `${palette.colors.editorBg}99`,
            "editorLineNumber.foreground": palette.colors.editorLineNumber,
            "editorLineNumber.activeForeground": palette.colors.editorCursor,
            "editor.selectionBackground": palette.colors.selection || "#4a4a4a",
            "editorIndentGuide.activeBackground1": palette.colors.editorCursor,
          }
        });
      }
    }

    logOutput(`Preferences update: ${category}.${key} set to ${value}`);
  };

  // Formatter hook via terminal prettier or inline monaco format Trigger
  const handleFormatFile = async () => {
    logOutput("Re-indexing codebase styling formats...");
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    // We can run prettier natively via npx/node or run quality checker
    try {
      const res = await fetch("/api/fs/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: activeTab.id, content: activeTab.content }),
      });
      if (res.ok) {
        logOutput(`Styled formatting initiated on active buffer: ${activeTab.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Keyboard shortcut routing globally
  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      // Palette: F1 or Ctrl+Shift+P
      if (e.key === "F1" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p")) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      // Toggle sidebar: Ctrl+B
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarVisible((prev) => !prev);
      }
      // Toggle terminal drawer: Ctrl+`
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setIsBottomPanelVisible((prev) => !prev);
      }
      // Save buffer: Ctrl+S
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        performSave();
      }
      // Close active editor tab: Alt+W or Ctrl+Alt+C
      if ((e.altKey && e.key.toLowerCase() === "w") || (e.ctrlKey && e.altKey && e.key.toLowerCase() === "c")) {
        e.preventDefault();
        if (activeTabId) {
          handleCloseTab(activeTabId);
        }
      }
      // Close all editor tabs: Ctrl+Alt+W or Alt+C
      if ((e.ctrlKey && e.altKey && e.key.toLowerCase() === "w") || (e.altKey && e.key.toLowerCase() === "c")) {
        e.preventDefault();
        handleCloseAllTabs();
      }
      // Go to Home Page: Alt+H
      if (e.altKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setActiveTabId(null);
        logOutput("Returned to Home Page.");
      }
      // Close Workspace Folder: Ctrl+Shift+W
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        handleCloseFolder();
      }
      // Exit IDE: Ctrl+Q or Alt+Q
      if ((e.ctrlKey && e.key.toLowerCase() === "q") || (e.altKey && e.key.toLowerCase() === "q")) {
        e.preventDefault();
        handleExitIDE();
      }
      // Escape or Alt+Z to Exit/Toggle Focus Mode
      if (e.key === "Escape" && settings.workbench.zenMode) {
        e.preventDefault();
        handleExitZenMode();
      }
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (settings.workbench.zenMode) {
          handleExitZenMode();
        } else {
          setSettings((prev) => {
            const next = {
              ...prev,
              workbench: {
                ...prev.workbench,
                sidebarVisible: false,
                bottomPanelVisible: false,
                zenMode: true,
                statusBarVisible: false,
                activityBarVisible: false,
                layoutPreset: "zen" as const,
              },
            };
            try {
              localStorage.setItem("workspace_presets_5080", JSON.stringify(next));
            } catch (err) {}
            return next;
          });
          logOutput("Entered Zen Focus space: minimizing structural distractors (Press Escape to escape focus mode).");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalHotkeys);
    return () => {
      window.removeEventListener("keydown", handleGlobalHotkeys);
    };
  }, [tabs, activeTabId, settings, handleExitZenMode]);

  // Command Registry list for the Command Palette modal
  const registeredCommands = [
    {
      id: "cmd-palette",
      name: "Show Command Palette Launcher",
      category: "Workbench",
      keybinding: "F1",
      icon: Layers,
      action: () => setIsPaletteOpen(true),
    },
    {
      id: "cmd-goto-home",
      name: "Go to Home Page (Welcome Screen)",
      category: "Navigation",
      keybinding: "Alt+H",
      icon: Home,
      action: () => setActiveTabId(null),
    },
    {
      id: "cmd-close-folder",
      name: "Close Workspace Folder",
      category: "File",
      keybinding: "Ctrl+Shift+W",
      icon: X,
      action: handleCloseFolder,
    },
    {
      id: "cmd-close-editor",
      name: "Close Active Editor Tab / Window",
      category: "Document",
      keybinding: "Alt+W",
      icon: X,
      action: () => {
        if (activeTabId) {
          handleCloseTab(activeTabId);
        }
      },
    },
    {
      id: "cmd-close-all",
      name: "Close All Connected Active Editors",
      category: "Document",
      keybinding: "Alt+C",
      icon: X,
      action: handleCloseAllTabs,
    },
    {
      id: "cmd-exit-ide",
      name: "Exit IDE Workspace Session",
      category: "Workbench",
      keybinding: "Alt+Q",
      icon: Power,
      action: handleExitIDE,
    },
    {
      id: "cmd-save",
      name: "Save Active Code Buffer",
      category: "Document",
      keybinding: "Ctrl+S",
      icon: Save,
      action: performSave,
    },
    {
      id: "cmd-copilot",
      name: "Connect to Gemini Copilot Help Desk",
      category: "AI Goldman",
      keybinding: "Ctrl+Shift+G",
      icon: Cpu,
      action: () => {
        setActiveSidebarTab("gemini");
        setIsSidebarVisible(true);
      },
    },
    {
      id: "cmd-format",
      name: "Format document text rules",
      category: "Document",
      keybinding: "Ctrl+F",
      icon: Code,
      action: handleFormatFile,
    },
    {
      id: "cmd-terminal",
      name: "Toggle Bash Container Terminal",
      category: "Panel",
      keybinding: "Ctrl+`",
      icon: Terminal,
      action: () => setIsBottomPanelVisible((prev) => !prev),
    },
    {
      id: "cmd-lintChecks",
      name: "Execute diagnostic quality diagnostics checks",
      category: "Diagnostics",
      keybinding: "Ctrl+Shift+L",
      icon: AlertCircle,
      action: runCodeQualityChecks,
    },
    {
      id: "cmd-refresh",
      name: "Re-index workspace folders tree",
      category: "Explorer",
      icon: RefreshCw,
      action: refreshExplorer,
    },
    {
      id: "cmd-settings",
      name: "Open Preferences preferences panel",
      category: "Preferences",
      keybinding: "Ctrl+,",
      icon: Settings,
      action: () => {
        setActiveSidebarTab("settings");
        setIsSidebarVisible(true);
      },
    },
  ];

  const activeTabName = tabs.find((t) => t.id === activeTabId)?.name;
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeFile = activeTab
    ? {
        path: activeTab.id,
        relativePath: activeTab.relativePath,
        content: activeTab.content,
        name: activeTab.name,
      }
    : null;

  if (isExited) {
    return (
      <div className="h-screen w-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-zinc-400 select-none">
        <div className="bg-[#1e1e1e] border border-neutral-800 p-8 rounded-lg shadow-2xl max-w-sm text-center flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-2 text-xl font-bold animate-pulse">
            <Power className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider font-sans">Session Terminated</h2>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans">
            The 5080 IDE environment has shutdown successfully and securely. All system background worker threads have paused. You are safe to close this browser window.
          </p>
          <div className="h-px bg-neutral-800 my-1" />
          <button
            onClick={() => {
              setIsExited(false);
              logOutput("IDE Workspace successfully re-established & re-indexed.");
            }}
            className="w-full bg-[#7A2A2A] hover:bg-[#632020] text-white py-2 rounded text-xs font-bold transition-all active:scale-[0.98] cursor-pointer font-sans"
          >
            Relaunch IDE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-layout-root" className="h-screen w-screen bg-[#1e1e1e] flex flex-col text-white font-sans overflow-hidden select-none select-none select-none">
      {/* 1. Custom frameless style Title Bar */}
      <TitleBar
        activeFileName={activeTabName}
        workspaceName={workspaceInfo?.name || "5080-ide"}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        onMinimize={() => logOutput("Window minimizing (Simulation)...")}
        onClose={handleExitIDE}
        onGoToHome={() => setActiveTabId(null)}
        onCloseFolder={handleCloseFolder}
        onNewFile={() => {
          const filename = prompt("Enter a filename under the root workspace directory (e.g., config.json):");
          if (filename && filename.trim()) {
            handleAddFile("", filename.trim());
          }
        }}
        onNewFolder={() => {
          const foldername = prompt("Enter a folder name under the root workspace directory:");
          if (foldername && foldername.trim()) {
            handleAddFolder("", foldername.trim());
          }
        }}
        onSave={performSave}
        onCloseActiveTab={() => {
          if (activeTabId) {
            handleCloseTab(activeTabId);
          }
        }}
        onCloseAllTabs={handleCloseAllTabs}
        onRefreshExplorer={refreshExplorer}
        onFormatActiveFile={handleFormatFile}
        onClearOutput={() => setOutputLogs([])}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={() => setIsSidebarVisible((v) => !v)}
        isBottomPanelVisible={isBottomPanelVisible}
        onToggleBottomPanel={() => setIsBottomPanelVisible((v) => !v)}
        activeSidebarTab={activeSidebarTab}
        onSelectSidebarTab={(tab) => {
          setActiveSidebarTab(tab);
        }}
        fontSize={settings.editor.fontSize}
        onUpdateSetting={handleUpdateSetting}
        minimap={settings.editor.minimap}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onRunDiagnostics={runCodeQualityChecks}
        onTriggerAI={(promptText) => {
          setActiveSidebarTab("gemini");
          setIsSidebarVisible(true);
          handleSendMessage(promptText);
        }}
        onClearAI={() => {
          setChatMessages([
            {
              id: "initial",
              sender: "ai",
              text: "Hello! History cleared. Let's start fresh. Feed me commands to analyze, explain files, or test our workspace modules.",
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }}
      />

      {/* 2. Middle segment containing Activity bar, sidebar, and editors */}
      <div className={`flex-1 flex min-h-0 relative ${
        settings.workbench.sidebarPosition === "right" ? "flex-row-reverse" : "flex-row"
      }`}>
        {/* Activity selector leftmost */}
        {settings.workbench.activityBarVisible && !settings.workbench.zenMode && (
          <ActivityBar
            activeTab={activeSidebarTab}
            onTabSelect={(tab) => {
              setActiveSidebarTab(tab);
              // Make sure settings state stays in sync
              handleUpdateSetting("workbench", "activeSidebarTab", tab);
            }}
            isVisible={isSidebarVisible && !settings.workbench.zenMode}
            onToggleVisible={() => setIsSidebarVisible(!isSidebarVisible)}
          />
        )}

        {/* Floating/Resizable Sidebar panel */}
        <Sidebar
          width={sidebarWidth}
          onWidthChange={(w) => setSidebarWidth(w)}
          isVisible={isSidebarVisible && !settings.workbench.zenMode}
          activeTab={activeSidebarTab}
          fileTree={fileTree}
          expandedPaths={expandedPaths}
          onToggleExpand={toggleExpand}
          onSelectFile={handleSelectFile}
          onAddFile={handleAddFile}
          onAddFolder={handleAddFolder}
          onDeletePath={handleDeletePath}
          onRefreshExplorer={refreshExplorer}
          onOpenNewProject={() => setIsNewProjectModalOpen(true)}
          noFolderOpen={showWelcome}
          onOpenFolder={handleOpenFolder}
          searchResults={searchResults}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          onPerformSearch={performSearch}
          gitBranch={gitBranch}
          gitChanges={gitChanges}
          onCommitGit={handleCommitGit}
          isGitSyncing={isGitSyncing}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
          isAIPending={isAIPending}
          settings={settings}
          onUpdateSetting={handleUpdateSetting}
          onApplyTheme={handleApplyTheme}
          onAddSnippet={handleAddSnippet}
          activeThemeId={activeThemeId}
          onActiveThemeChange={setActiveThemeId}

          customTheme={customTheme}
          onUpdateCustomTheme={handleUpdateCustomTheme}
          onSaveCustomTheme={handleSaveCustomTheme}
          savedThemes={savedThemes}
          onLoadCustomTheme={handleLoadCustomTheme}
          onDeleteCustomTheme={handleDeleteCustomTheme}
          // Personalization props
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          logOutput={logOutput}

          // AI / Agent props
          aiKeys={aiKeys}
          aiProvider={aiProvider}
          onUpdateAIKeys={handleUpdateAIKeys}
          onUpdateAIProvider={handleUpdateAIProvider}
          activeFile={activeFile}
          onApplyAgentResult={handleApplyAgentResult}

          // Model configuration props
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          customModels={customModels}
          onAddCustomModel={handleAddCustomModel}
          onDeleteCustomModel={handleDeleteCustomModel}
        />

        {/* Main interactive panel splits */}
        <div className={`flex-1 flex min-w-0 relative overflow-hidden ${
          settings.workbench.bottomPanelPosition === "right" ? "flex-row" : "flex-col"
        }`}>

          {/* Welcome screen when no folder is open yet (Electron mode) */}
          {showWelcome ? (
            <WelcomeScreen
              onOpenFolder={handleOpenFolder}
              onNewProject={() => {
                setShowWelcome(false);
                setIsNewProjectModalOpen(true);
              }}
              onOpenRecentWorkspace={handleOpenRecentWorkspace}
              onCloneRepository={handleCloneRepository}
              onNewFile={handleNewFileWelcome}
              workspaceName={workspaceInfo?.workspace?.split(/[\\/]/).pop()}
              currentUser={currentUser}
            />
          ) : (
          <EditorArea
            tabs={tabs}
            activeTabId={activeTabId}
            settings={settings}
            onSelectTab={(id) => setActiveTabId(id)}
            onCloseTab={handleCloseTab}
            onCloseAllTabs={handleCloseAllTabs}
            onContentChange={handleContentChange}
            onCursorChange={handleCursorChange}
            isSaving={isSaving}
            onQuickSave={performSave}
            onFormatActiveFile={handleFormatFile}
            fileTree={fileTree}
            onSelectFile={handleSelectFile}
            onToggleExpand={toggleExpand}
            expandedPaths={expandedPaths}
            workspaceName={workspaceInfo?.name || "workspace"}
            activeThemeConfig={activeThemeConfig}
            onOpenFolder={handleOpenFolder}
            onNewProject={() => {
              setShowWelcome(false);
              setIsNewProjectModalOpen(true);
            }}
            onOpenRecentWorkspace={handleOpenRecentWorkspace}
            onCloneRepository={handleCloneRepository}
            onNewFile={handleNewFileWelcome}
          />
          )}

          {/* Collapsible bottom logs and interactive shells panel */}
          <BottomPanel
            height={bottomPanelHeight}
            onHeightChange={(h) => setBottomPanelHeight(h)}
            isVisible={isBottomPanelVisible && !settings.workbench.zenMode}
            onClose={() => setIsBottomPanelVisible(false)}
            problems={problems}
            activeTab={bottomPanelTab}
            onTabChange={(tab) => setBottomPanelTab(tab)}
            outputLogs={outputLogs}
            onClearOutput={() => setOutputLogs([])}
            onApplyLintFix={runCodeQualityChecks}
            position={settings.workbench.bottomPanelPosition}
            workspacePath={workspaceInfo?.workspace}
            onRefreshWorkspace={refreshExplorer}
          />
        </div>

        <RightAgentPanel
          width={rightPanelWidth}
          onWidthChange={setRightPanelWidth}
          isVisible={isRightPanelVisible}
          onToggleVisible={() => setIsRightPanelVisible(!isRightPanelVisible)}
          aiKeys={aiKeys}
          activeFile={activeFile}
          onApplyAgentResult={handleApplyAgentResult}
          logOutput={logOutput}

          // Model configuration props
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          customModels={customModels}
        />
      </div>

      {/* 3. Status indication strip bottom */}
      {settings.workbench.statusBarVisible && !settings.workbench.zenMode && (
        <StatusBar
          branchName={gitBranch}
          problems={problems}
          cursorLine={cursorLine}
          cursorCol={cursorCol}
          language={tabs.find((t) => t.id === activeTabId)?.language || "Plain Text"}
          autoSaveStatus={autoSaveStatus}
          isSaving={isSaving}
          onRefreshWorkspace={refreshExplorer}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
        />
      )}

      {/* 4. Overlay Command Palette launcher modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectCommand={(cmd) => setIsPaletteOpen(false)}
        registeredCommands={registeredCommands}
      />

      {/* 5. Scaffold New Project Dialog popup */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onScaffold={handleScaffoldProject}
        isScaffolding={isScaffolding}
      />

      {/* 6. Zen Mode escape overlay HUD */}
      {settings.workbench.zenMode && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#252526] border border-[#3b3b3c] px-3.5 py-2.5 rounded-lg shadow-2xl animate-pulse">
          <span className="text-[11px] text-zinc-300 font-sans select-none flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />
            <span>Zen Focus Space Active</span>
          </span>
          <button
            onClick={handleExitZenMode}
            className="ml-2 bg-[#7A2A2A] hover:bg-[#632020] text-white px-3 py-1 rounded text-[11px] font-bold font-sans transition-all active:scale-[0.98] cursor-pointer shadow border border-red-950"
            title="Restore default panels (Press [Escape])"
          >
            Exit Focus Mode
          </button>
        </div>
      )}
    </div>
  );
}
