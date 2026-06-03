export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
  children?: FileNode[];
  size?: number;
  modified?: number;
  extension?: string;
}

export interface EditorTab {
  id: string; // File path acts as ID
  name: string;
  relativePath: string;
  content: string;
  originalContent?: string; // Cache for comparison or formatting
  isDirty: boolean;
  language: string;
}

export interface WorkspaceSettings {
  editor: {
    fontSize: number;
    fontFamily: string;
    wordWrap: "on" | "off";
    minimap: boolean;
    tabSize: number;
    formatOnSave: boolean;
    autoSave: "afterDelay" | "off";
  };
  workbench: {
    theme: "5080-dark" | "vs-dark" | "vs-light" | "classic-light" | "nordic-frost" | "dracula-eclipse" | "cyberpunk-neon" | "luxury-gold";
    sidebarWidth: number;
    bottomPanelHeight: number;
    sidebarVisible: boolean;
    bottomPanelVisible: boolean;
    activeSidebarTab: "explorer" | "search" | "git" | "gemini" | "settings" | "extensions" | "profile" | "packages";
    bottomPanelTab: "terminal" | "problems" | "output";
    sidebarPosition: "left" | "right";
    bottomPanelPosition: "bottom" | "right";
    zenMode: boolean;
    statusBarVisible: boolean;
    activityBarVisible: boolean;
    layoutPreset: "default" | "zen" | "presentation" | "terminal-focus" | "sidebar-right";
    fileIconTheme: "vscode-classic" | "material-vibrant" | "cyberpunk-neon" | "monochrome-slate" | "minimalist-wire" | "retro-gold";
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: "google" | "github";
  role: string;
  company?: string;
  bio?: string;
  createdAt: string;
  stats: {
    commits: number;
    filesSaved: number;
    errorsFixed: number;
    codeLineCount: number;
    activeHours: number;
  };
}

export interface Problem {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  file: string;
  line?: number;
  column?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface GitChange {
  status: string; // "M", "A", "D", "??", etc.
  path: string;
  relativePath: string;
}

export interface SearchMatch {
  lineNumber: number;
  text: string;
}

export interface SearchResult {
  filePath: string;
  relativePath: string;
  matches: SearchMatch[];
}

export interface CustomThemeColors {
  editorBg: string; // "editor.background"
  editorFg: string; // "editor.foreground"
  editorCursor: string; // "editorCursor.foreground"
  editorLineNumber: string; // "editorLineNumber.foreground"
  syntaxKeyword: string; // keyword token
  syntaxString: string; // string token
  syntaxNumber: string; // number token
  syntaxComment: string; // comment token
  syntaxFunction: string; // function token
  syntaxType: string; // type token
  sidebarBg: string; // custom sidebar background
  sidebarBorder: string; // custom sidebar border
  activityBarBg: string; // custom activity bar background
  activityBarAccent: string; // custom activity bar accent
  statusBarBg: string; // custom status bar background
  statusBarFg: string; // custom status bar foreground
  bottomPanelBg: string; // custom bottom panel background
  titleBarBg: string; // custom title bar background
  lineHighlight?: string; // custom active line background
  selection?: string; // custom selection background
}

