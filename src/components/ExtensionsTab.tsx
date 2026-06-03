import React, { useState, useEffect } from "react";
import {
  Puzzle,
  Download,
  Trash2,
  Check,
  Plus,
  Sparkles,
  Zap,
  Gamepad2,
  FileCode2,
  Sliders,
  X,
  Search,
  Eye,
  Settings,
  Flame,
  Info
} from "lucide-react";

export interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: "theme" | "snippet" | "arcade" | "utility";
  installed: boolean;
  enabled: boolean;
  isCustom?: boolean;
  metadata?: any; 
}

interface ExtensionsTabProps {
  onApplyTheme?: (themeId: string, themeConfig: { base: string; rules: any[]; colors: any[] }) => void;
  onAddSnippet?: (trigger: string, body: string) => void;
  activeThemeId?: string;
  onActiveThemeChange?: (themeId: string) => void;
  onEnableVimMode?: (enabled: boolean) => void;
  onOpenArcade?: () => void;
  onSetThemeAccentColor?: (color: string) => void;
}

const DEFAULT_EXTENSIONS: Extension[] = [
  {
    id: "ext-theme-dracula",
    name: "Dracula Midnight Glow",
    version: "2.1.0",
    description: "Classic violet, high-contrast dark theme with glowing neon highlights for professional late night coding.",
    author: "Zacula Team",
    type: "theme",
    installed: true,
    enabled: true,
    metadata: {
      base: "vs-dark",
      colors: {
        "editor.background": "#1e1e24",
        "editor.foreground": "#f8f8f2",
        "editorCursor.foreground": "#ff79c6",
        "editor.lineHighlightBackground": "#282a36",
        "editorLineNumber.foreground": "#6272a4",
        "editorLineNumber.activeForeground": "#ff79c6",
        "editor.selectionBackground": "#44475a",
        "editorIndentGuide.activeBackground1": "#bd93f9",
      },
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd" },
        { token: "function", foreground: "50fa7b", fontStyle: "bold" },
        { token: "variable", foreground: "f8f8f2" },
      ]
    }
  },
  {
    id: "ext-theme-cobalt",
    name: "Cobalt Deep Blues",
    version: "1.0.4",
    description: "Intense retro deep-blue palette with vibrant golden and warm amber text variables.",
    author: "NostalgiaDev",
    type: "theme",
    installed: false,
    enabled: false,
    metadata: {
      base: "vs-dark",
      colors: {
        "editor.background": "#001b33",
        "editor.foreground": "#e1e1e6",
        "editorCursor.foreground": "#ffc600",
        "editor.lineHighlightBackground": "#002d54",
        "editorLineNumber.foreground": "#005080",
        "editorLineNumber.activeForeground": "#ffc600",
        "editor.selectionBackground": "#023766",
        "editorIndentGuide.activeBackground1": "#0088ff",
      },
      rules: [
        { token: "comment", foreground: "0088ff", fontStyle: "italic" },
        { token: "keyword", foreground: "ff9d00", fontStyle: "bold" },
        { token: "string", foreground: "3ad900" },
        { token: "number", foreground: "ff6200" },
        { token: "type", foreground: "80ffbb" },
        { token: "function", foreground: "ffc600", fontStyle: "bold" },
        { token: "variable", foreground: "00e1ff" },
      ]
    }
  },
  {
    id: "ext-theme-andromeda",
    name: "Andromeda Cyberpunk",
    version: "3.2.1",
    description: "Futuristic neon overlay matching futuristic blade runners, sporting pink keywords and lime comments.",
    author: "NeoTokyo",
    type: "theme",
    installed: false,
    enabled: false,
    metadata: {
      base: "vs-dark",
      colors: {
        "editor.background": "#0d0f12",
        "editor.foreground": "#e5e9f0",
        "editorCursor.foreground": "#00f0ff",
        "editor.lineHighlightBackground": "#161b22",
        "editorLineNumber.foreground": "#3b4252",
        "editorLineNumber.activeForeground": "#00f0ff",
        "editor.selectionBackground": "#4c566a",
        "editorIndentGuide.activeBackground1": "#00f0ff",
      },
      rules: [
        { token: "comment", foreground: "4af2a1", fontStyle: "italic" },
        { token: "keyword", foreground: "ff007f", fontStyle: "bold" },
        { token: "string", foreground: "e5c07b" },
        { token: "number", foreground: "df6c83" },
        { token: "type", foreground: "56b6c2" },
        { token: "function", foreground: "00e5ff", fontStyle: "bold" },
        { token: "variable", foreground: "abb2bf" },
      ]
    }
  },
  {
    id: "ext-utility-vim",
    name: "Vim Modal Simulator",
    version: "1.1.2",
    description: "Vintage modal terminal controls layout. Toggle between INSERT and NORMAL modal buffers at a mouse tap.",
    author: "ModalSpeed",
    type: "utility",
    installed: false,
    enabled: false,
  },
  {
    id: "ext-utility-macros",
    name: "Power Boilerplate Booster",
    version: "2.0.0",
    description: "Inject pre-configured boilerplate structures (React useState, Express endpoints, Jest mocks) instantly at current scroll position.",
    author: "SaaSBooster",
    type: "utility",
    installed: false,
    enabled: false,
  },
  {
    id: "ext-arcade-asteroids",
    name: "Asteroid Sandbox Game",
    version: "0.9.8",
    description: "Relaxing arcade meteor shooter inside the workbench. Perfect for breaks when compiling complex code loops.",
    author: "PixelMinds",
    type: "arcade",
    installed: false,
    enabled: false,
  }
];

// Predefined real VS Code theme templates
export const VSCODE_PRESETS: { [key: string]: { name: string; description: string; json: string } } = {
  "one-dark-pro": {
    name: "One Dark Pro",
    description: "The classic Atom aesthetic, one of VS Code's most installed dark themes.",
    json: JSON.stringify({
      "name": "One Dark Pro",
      "type": "dark",
      "colors": {
        "editor.background": "#282c34",
        "editor.foreground": "#abb2bf",
        "editorCursor.foreground": "#528bff",
        "editor.lineHighlightBackground": "#2c313c",
        "editorLineNumber.foreground": "#4b5263",
        "editorLineNumber.activeForeground": "#c8ccd4",
        "editor.selectionBackground": "#3e4451",
        "editorIndentGuide.activeBackground1": "#cbd5e1"
      },
      "tokenColors": [
        {
          "scope": ["comment"],
          "settings": { "foreground": "#5c6370", "fontStyle": "italic" }
        },
        {
          "scope": ["keyword", "storage", "keyword.control"],
          "settings": { "foreground": "#c678dd", "fontStyle": "bold" }
        },
        {
          "scope": ["string"],
          "settings": { "foreground": "#98c379" }
        },
        {
          "scope": ["constant.numeric", "number"],
          "settings": { "foreground": "#d19a66" }
        },
        {
          "scope": ["entity.name.type", "support.type"],
          "settings": { "foreground": "#e5c07b" }
        },
        {
          "scope": ["entity.name.function", "support.function"],
          "settings": { "foreground": "#61afef", "fontStyle": "bold" }
        },
        {
          "scope": ["variable"],
          "settings": { "foreground": "#abb2bf" }
        }
      ]
    }, null, 2)
  },
  "nord": {
    name: "Nord Frost",
    description: "An arctic, north-bluish clean and elegant VS Code theme palette.",
    json: JSON.stringify({
      "name": "Nord Frost",
      "type": "dark",
      "colors": {
        "editor.background": "#2e3440",
        "editor.foreground": "#d8dee9",
        "editorCursor.foreground": "#88c0d0",
        "editor.lineHighlightBackground": "#3b4252",
        "editorLineNumber.foreground": "#4c566a",
        "editorLineNumber.activeForeground": "#8fbcbb",
        "editor.selectionBackground": "#434c5e",
        "editorIndentGuide.activeBackground1": "#88c0d0"
      },
      "tokenColors": [
        {
          "scope": ["comment"],
          "settings": { "foreground": "#4c566a", "fontStyle": "italic" }
        },
        {
          "scope": ["keyword", "storage"],
          "settings": { "foreground": "#81a1c1", "fontStyle": "bold" }
        },
        {
          "scope": ["string"],
          "settings": { "foreground": "#a3be8c" }
        },
        {
          "scope": ["constant.numeric"],
          "settings": { "foreground": "#b48ead" }
        },
        {
          "scope": ["entity.name.type"],
          "settings": { "foreground": "#8fbcbb" }
        },
        {
          "scope": ["entity.name.function"],
          "settings": { "foreground": "#88c0d0", "fontStyle": "bold" }
        },
        {
          "scope": ["variable"],
          "settings": { "foreground": "#d8dee9" }
        }
      ]
    }, null, 2)
  },
  "synthwave84": {
    name: "SynthWave '84",
    description: "A neon cyberpunk theme featuring glowing neon retro 80s outrun colors.",
    json: JSON.stringify({
      "name": "SynthWave '84",
      "type": "dark",
      "colors": {
        "editor.background": "#2b213a",
        "editor.foreground": "#b3b1ad",
        "editorCursor.foreground": "#f92aad",
        "editor.lineHighlightBackground": "#241b2f",
        "editorLineNumber.foreground": "#4c566a",
        "editorLineNumber.activeForeground": "#f92aad",
        "editor.selectionBackground": "#5a1d7c",
        "editorIndentGuide.activeBackground1": "#f92aad"
      },
      "tokenColors": [
        {
          "scope": ["comment"],
          "settings": { "foreground": "#848bb3", "fontStyle": "italic" }
        },
        {
          "scope": ["keyword", "storage"],
          "settings": { "foreground": "#fede5d", "fontStyle": "bold" }
        },
        {
          "scope": ["string"],
          "settings": { "foreground": "#ff7edb" }
        },
        {
          "scope": ["constant.numeric"],
          "settings": { "foreground": "#f97e72" }
        },
        {
          "scope": ["entity.name.type"],
          "settings": { "foreground": "#fe4450" }
        },
        {
          "scope": ["entity.name.function"],
          "settings": { "foreground": "#36f9f6", "fontStyle": "bold" }
        },
        {
          "scope": ["variable"],
          "settings": { "foreground": "#f0eff1" }
        }
      ]
    }, null, 2)
  }
};

// Map VS Code theme tokens to Monaco theme tokens
export const convertVsCodeJsonToMonaco = (jsonStr: string) => {
  try {
    const vscodeJson = JSON.parse(jsonStr);
    const colors: any = {};
    const defaultColors = vscodeJson.colors || {};

    colors["editor.background"] = defaultColors["editor.background"] || "#1e1e1e";
    colors["editor.foreground"] = defaultColors["editor.foreground"] || "#abb2bf";
    colors["editorCursor.foreground"] = defaultColors["editorCursor.foreground"] || defaultColors["editor.foreground"] || "#ffffff";
    colors["editor.lineHighlightBackground"] = defaultColors["editor.lineHighlightBackground"] || "#2e2e2e";
    colors["editorLineNumber.foreground"] = defaultColors["editorLineNumber.foreground"] || "#5a5a5a";
    colors["editorLineNumber.activeForeground"] = defaultColors["editorLineNumber.activeForeground"] || "#ffffff";
    colors["editor.selectionBackground"] = defaultColors["editor.selectionBackground"] || "#404040";
    colors["editorIndentGuide.activeBackground1"] = defaultColors["editorIndentGuide.activeBackground1"] || "#808080";

    const rules: any[] = [];
    const tokenMappings: { [key: string]: string } = {
      "comment": "comment",
      "punctuation.definition.comment": "comment",
      "keyword": "keyword",
      "storage": "keyword",
      "storage.type": "keyword",
      "keyword.operator": "keyword",
      "keyword.control": "keyword",
      "string": "string",
      "punctuation.definition.string": "string",
      "constant.numeric": "number",
      "number": "number",
      "entity.name.type": "type",
      "support.type": "type",
      "type": "type",
      "entity.name.function": "function",
      "support.function": "function",
      "entity.name.method": "function",
      "variable": "variable",
      "variable.parameter": "variable",
      "variable.other": "variable",
      "entity.name.tag": "tag",
      "tag": "tag",
    };

    if (Array.isArray(vscodeJson.tokenColors)) {
      vscodeJson.tokenColors.forEach((item: any) => {
        if (!item.settings || (!item.settings.foreground && !item.settings.fontStyle)) return;
        const fg = item.settings.foreground;
        const fontStyle = item.settings.fontStyle || "";
        const scopes = Array.isArray(item.scope) 
          ? item.scope 
          : (typeof item.scope === "string" ? [item.scope] : []);

        scopes.forEach((scope: string) => {
          let matchedToken: string | null = null;
          for (const [key, tokenVal] of Object.entries(tokenMappings)) {
            if (scope === key || scope.startsWith(key + ".")) {
              matchedToken = tokenVal;
              break;
            }
          }

          if (matchedToken) {
            const rule: any = { token: matchedToken };
            if (fg) {
              rule.foreground = fg.replace("#", "");
            }
            if (fontStyle) {
              rule.fontStyle = fontStyle;
            }
            rules.push(rule);
          }
        });
      });
    }

    return {
      id: `custom-vs-theme-${Date.now()}`,
      base: vscodeJson.type === "light" ? "vs" : "vs-dark",
      colors,
      rules,
      name: vscodeJson.name || "Imported VS Code Theme"
    };
  } catch (error: any) {
    throw new Error(`Failed to parse VS Code JSON: ${error.message}`);
  }
};

export default function ExtensionsTab({
  onApplyTheme,
  onAddSnippet,
  activeThemeId = "ext-theme-default",
  onActiveThemeChange,
  onEnableVimMode,
  onOpenArcade,
  onSetThemeAccentColor
}: ExtensionsTabProps) {
  const [extensions, setExtensions] = useState<Extension[]>(() => {
    try {
      const saved = localStorage.getItem("5080-extensions-cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge defaults to ensure core presets always present
        const customOnly = parsed.filter((p: Extension) => p.isCustom);
        return [...DEFAULT_EXTENSIONS, ...customOnly];
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EXTENSIONS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "theme" | "snippet" | "arcade" | "utility">("all");
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Custom theme creator inputs
  const [customName, setCustomName] = useState("One Dark Pro");
  const [customDesc, setCustomDesc] = useState("Classic One Dark Pro VS Code theme.");
  const [customType, setCustomType] = useState<"theme" | "snippet">("theme");

  // VS Code Theme JSON paste mode configuration
  const [themeMode, setThemeMode] = useState<"builder" | "vscode-json">("vscode-json");
  const [vscodeJsonText, setVscodeJsonText] = useState(() => VSCODE_PRESETS["one-dark-pro"].json);
  const [selectedVsCodeTemplate, setSelectedVsCodeTemplate] = useState("one-dark-pro");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Custom Theme properties
  const [bgColor, setBgColor] = useState("#15171c");
  const [fgColor, setFgColor] = useState("#e3e3e3");
  const [keywordColor, setKeywordColor] = useState("#ec5da5");
  const [stringColor, setStringColor] = useState("#a8e163");
  const [commentColor, setCommentColor] = useState("#6b7582");
  const [functionColor, setFunctionColor] = useState("#4ea6ff");

  // Custom Snippet rules
  const [snippetTrigger, setSnippetTrigger] = useState("rfc");
  const [snippetBody, setSnippetBody] = useState(`import React from "react";\n\nexport default function Component() {\n  return (\n    <div>Hello World</div>\n  );\n}`);

  // VIM Mode Active indicators
  const [vimModeActive, setVimModeActive] = useState(false);
  const [vimInteractiveModal, setVimInteractiveModal] = useState<"INSERT" | "NORMAL">("NORMAL");

  // Sandbox Game state
  const [gameScore, setGameScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("5080-extensions-cache", JSON.stringify(extensions));
  }, [extensions]);

  // Handle installing extensions
  const handleToggleInstall = (extId: string) => {
    setExtensions(prev =>
      prev.map(ext => {
        if (ext.id === extId) {
          const newInstalled = !ext.installed;
          const newEnabled = newInstalled ? true : false;
          
          if (ext.type === "theme" && newEnabled && onActiveThemeChange && ext.metadata) {
            onActiveThemeChange(ext.id);
            if (onApplyTheme) {
              onApplyTheme(ext.id, ext.metadata);
            }
          }
          if (ext.id === "ext-utility-vim" && onEnableVimMode) {
            onEnableVimMode(newEnabled);
            setVimModeActive(newEnabled);
          }
          return { ...ext, installed: newInstalled, enabled: newEnabled };
        }
        return ext;
      })
    );
  };

  // Handle toggling enable checkbox
  const handleToggleEnable = (extId: string) => {
    setExtensions(prev =>
      prev.map(ext => {
        if (ext.id === extId) {
          const nextEnabled = !ext.enabled;
          
          if (ext.type === "theme" && nextEnabled && onActiveThemeChange && ext.metadata) {
            onActiveThemeChange(ext.id);
            if (onApplyTheme) {
              onApplyTheme(ext.id, ext.metadata);
            }
          }
          if (ext.id === "ext-utility-vim" && onEnableVimMode) {
            onEnableVimMode(nextEnabled);
            setVimModeActive(nextEnabled);
          }
          return { ...ext, enabled: nextEnabled };
        }
        return ext;
      })
    );
  };

  // Create your own plugin dynamically
  const handleCreateCustomExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newId = `custom-ext-${Date.now()}`;
    let extMetadata: any = {};

    if (customType === "theme") {
      if (themeMode === "vscode-json") {
        try {
          setJsonError(null);
          const converted = convertVsCodeJsonToMonaco(vscodeJsonText);
          converted.id = newId; // Ensure the Monaco theme registration ID aligns with our extension ID
          extMetadata = converted;
        } catch (error: any) {
          setJsonError(error.message);
          return; // Keep form open, display validation diagnostics
        }
      } else {
        extMetadata = {
          base: "vs-dark",
          colors: {
            "editor.background": bgColor,
            "editor.foreground": fgColor,
            "editorCursor.foreground": keywordColor,
            "editor.lineHighlightBackground": `${bgColor}99`,
            "editorLineNumber.foreground": `${fgColor}66`,
            "editorLineNumber.activeForeground": keywordColor,
            "editor.selectionBackground": `${functionColor}33`,
            "editorIndentGuide.activeBackground1": functionColor,
          },
          rules: [
            { token: "comment", foreground: commentColor.replace("#", ""), fontStyle: "italic" },
            { token: "keyword", foreground: keywordColor.replace("#", ""), fontStyle: "bold" },
            { token: "string", foreground: stringColor.replace("#", "") },
            { token: "number", foreground: functionColor.replace("#", "") },
            { token: "type", foreground: functionColor.replace("#", "") },
            { token: "function", foreground: functionColor.replace("#", ""), fontStyle: "bold" },
            { token: "variable", foreground: fgColor.replace("#", "") },
          ]
        };
      }
    } else {
      extMetadata = {
        trigger: snippetTrigger,
        body: snippetBody
      };

      if (onAddSnippet) {
        onAddSnippet(snippetTrigger, snippetBody);
      }
    }

    const newExt: Extension = {
      id: newId,
      name: customName,
      version: "1.0.0",
      description: customDesc || `User custom configured ${customType} module extension.`,
      author: "Local Creator",
      type: customType,
      installed: true,
      enabled: true,
      isCustom: true,
      metadata: extMetadata
    };

    setExtensions(prev => [newExt, ...prev]);

    // Apply immediately if theme
    if (customType === "theme") {
      if (onActiveThemeChange) onActiveThemeChange(newId);
      if (onApplyTheme) onApplyTheme(newId, extMetadata);
    }

    // Reset Form
    setCustomName("One Dark Pro");
    setCustomDesc("Classic One Dark Pro VS Code theme.");
    setThemeMode("vscode-json");
    setJsonError(null);
    setIsCreatorOpen(false);
  };

  const handleDeleteCustom = (extId: string) => {
    setExtensions(prev => prev.filter(ext => ext.id !== extId));
  };

  const filteredExtensions = extensions.filter(ext => {
    const matchesQuery =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || ext.type === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="flex flex-col h-full space-y-3 p-1 font-sans text-xs">
      {/* Extension Header Banner */}
      <div className="bg-[#7A2A2A]/10 border border-[#7A2A2A]/30 p-2.5 rounded flex items-start gap-1.5 border-l-2 border-l-[#AA4A4A] select-none">
        <Sparkles className="w-4 h-4 text-[#AA4A4A] shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold text-zinc-100 block text-xs">Active Plugin Registry</span>
          <span className="text-[10.5px] text-zinc-400 mt-1 block leading-normal">
            Enhance workspace layout blocks! Design themes, shortcuts, boilerplate snippets, or play arcade games.
          </span>
        </div>
      </div>

      {/* Action buttons list */}
      <div className="flex items-center gap-1.5 justify-between">
        {/* Search bar input representation */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded pl-7 pr-2.5 py-1 text-white placeholder-gray-500 outline-none text-[11px] focus:border-[#7A2A2A]"
            placeholder="Search plugins & themes..."
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2 top-1.5" />
        </div>

        {/* Create Extension button */}
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="bg-emerald-800 hover:bg-emerald-700 text-white p-1.5 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
          title="Create custom extension..."
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="font-semibold text-[11px] hidden sm:inline">Design</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-none select-none">
        {(["all", "theme", "snippet", "arcade", "utility"] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-2 py-0.5 rounded text-[10px] border shrink-0 transition-all cursor-pointer uppercase font-bold ${
              selectedType === type
                ? "bg-[#7A2A2A] text-white border-[#7A2A2A]"
                : "bg-neutral-800/80 text-gray-400 border-transparent hover:bg-neutral-700/80"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Extensions Listing Pane */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[calc(100vh-220px)]">
        {filteredExtensions.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 flex flex-col items-center select-none gap-1 bg-neutral-900/10 rounded border border-neutral-800/40 border-dashed">
            <Puzzle className="w-6 h-6 text-neutral-600 animate-pulse" />
            <span>No extensions fit the filters.</span>
          </div>
        ) : (
          filteredExtensions.map(ext => {
            const isActive = ext.enabled && ext.installed;
            return (
              <div
                key={ext.id}
                className={`bg-neutral-900/30 border p-2.5 rounded-lg flex flex-col gap-2 transition-all hover:bg-neutral-900/50 relative group ${
                  isActive
                    ? "border-cyan-500/30 bg-cyan-950/5 shadow-md"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                      ext.type === "theme" ? "bg-amber-950/20 text-[#e5b560] border-amber-500/20" :
                      ext.type === "snippet" ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/20" :
                      ext.type === "arcade" ? "bg-rose-950/20 text-rose-400 border-rose-500/20" :
                      "bg-emerald-950/20 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {ext.type === "theme" && <Sliders className="w-4 h-4" />}
                      {ext.type === "snippet" && <FileCode2 className="w-4 h-4" />}
                      {ext.type === "arcade" && <Gamepad2 className="w-4 h-4" />}
                      {ext.type === "utility" && <Zap className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-200 text-[11.5px] truncate">{ext.name}</span>
                        <span className="text-[9px] text-zinc-500 bg-neutral-800/80 px-1 py-0.2 rounded font-mono">
                          v{ext.version}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 block truncate font-medium">By {ext.author}</span>
                    </div>
                  </div>

                  {/* Settings status control */}
                  <div className="flex items-center gap-1 shrink-0 select-none">
                    {ext.installed ? (
                      <div className="flex items-center gap-1 select-none">
                        <label className="relative inline-flex items-center cursor-pointer scale-90" title={ext.enabled ? "Disable extension" : "Enable extension"}>
                          <input
                            type="checkbox"
                            checked={ext.enabled}
                            onChange={() => handleToggleEnable(ext.id)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#7A2A2A] peer-checked:after:bg-white border border-neutral-700"></div>
                        </label>
                        <button
                          onClick={() => handleToggleInstall(ext.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-neutral-800/60 rounded cursor-pointer transition-colors"
                          title="Uninstall"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleInstall(ext.id)}
                        className="bg-neutral-800 hover:bg-[#7A2A2A] hover:text-white px-2 py-1 rounded text-[10px] text-zinc-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed text-left">{ext.description}</p>

                {/* Inline Interaction for themes */}
                {ext.type === "theme" && isActive && ext.metadata && (
                  <div className="mt-1 flex items-center gap-1.5 bg-[#1b1c21] p-1.5 rounded border border-neutral-800 select-none">
                    <span className="w-2 h-2 rounded-full border border-zinc-700 block shrink-0" style={{ backgroundColor: ext.metadata.colors["editor.background"] }} />
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">Applied editor layout theme</span>
                  </div>
                )}

                {/* Inline Interaction for Snippet */}
                {ext.type === "snippet" && isActive && ext.metadata && (
                  <div className="mt-1 bg-[#1a1b1e] p-1.5 rounded border border-neutral-800 flex flex-col gap-1 text-[10px]">
                    <div className="flex justify-between items-center text-zinc-500">
                      <span>Trigger keyword: <strong className="text-cyan-400 font-mono">{ext.metadata.trigger}</strong></span>
                      <button
                        onClick={() => {
                          if (onAddSnippet) onAddSnippet(ext.metadata.trigger, ext.metadata.body);
                        }}
                        className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                        title="Click to register this boilerplate snippet macro"
                      >
                        <Check className="w-3 h-3" /> Register
                      </button>
                    </div>
                  </div>
                )}

                {/* Asteroids game runner */}
                {ext.type === "arcade" && isActive && (
                  <div className="mt-1.5 border border-[#fc5d7c]/30 bg-[#ea5470]/5 p-2 rounded flex flex-col gap-1 text-center select-none">
                    <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase">Sandbox Asteroid Reactor</span>
                    <div className="text-[9.5px] text-zinc-400">Score: <strong className="text-rose-400">{gameScore}</strong></div>
                    <div className="flex gap-1.5 justify-center py-1">
                      {gameState !== "playing" ? (
                        <button
                          onClick={() => {
                            setGameState("playing");
                            const interval = setInterval(() => {
                              setGameScore(s => s + Math.floor(Math.random() * 20 + 3));
                            }, 500);
                            (window as any).asteroidGameInterval = interval;
                          }}
                          className="bg-[#ea5470]/20 text-rose-400 hover:bg-[#ea5470]/40 px-2 py-0.5 rounded text-[10px] font-bold"
                        >
                          Launch Retro Game
                        </button>
                      ) : (
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[9px] text-rose-400 animate-ping">● SIMULATOR ACTIVE</span>
                          <button
                            onClick={() => {
                              setGameState("over");
                              clearInterval((window as any).asteroidGameInterval);
                            }}
                            className="bg-zinc-800 text-gray-300 hover:bg-zinc-700 px-2 py-0.5 rounded text-[9.5px] font-semibold"
                          >
                            Close game
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal Vim indicators */}
                {ext.id === "ext-utility-vim" && isActive && (
                  <div className="mt-1 flex items-center justify-between bg-zinc-950/40 p-1.5 rounded border border-neutral-800 font-mono text-[10px] select-none">
                    <span className="text-zinc-500 font-bold">VIM SIMULATOR STATUS</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setVimInteractiveModal("NORMAL");
                          if (onEnableVimMode) onEnableVimMode(true);
                        }}
                        className={`px-1 rounded text-[9px] font-bold ${vimInteractiveModal === "NORMAL" ? "bg-[#7A2A2A] text-white" : "bg-neutral-800 text-neutral-400"}`}
                      >
                        NORMAL
                      </button>
                      <button
                        onClick={() => {
                          setVimInteractiveModal("INSERT");
                          if (onEnableVimMode) onEnableVimMode(false);
                        }}
                        className={`px-1 rounded text-[9px] font-bold ${vimInteractiveModal === "INSERT" ? "bg-emerald-800 text-white" : "bg-neutral-800 text-neutral-400"}`}
                      >
                        INSERT
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom extension badge and deletion */}
                {ext.isCustom && (
                  <button
                    onClick={() => handleDeleteCustom(ext.id)}
                    className="absolute bottom-2.5 right-2.5 p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                    title="Delete Custom Extension"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Creator Popover Popup */}
      {isCreatorOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl p-4 w-full max-w-sm flex flex-col font-sans gap-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs select-none">
                <Sliders className="w-4 h-4" />
                <span>IDE Extension Designer Wizard</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatorOpen(false)}
                className="text-zinc-500 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomExtension} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 font-semibold select-none">Extension Title Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-black border border-neutral-700 text-white p-2 rounded outline-none font-sans focus:border-[#7A2A2A] text-xs"
                  placeholder="e.g., Solarized Paper Cream Theme..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 font-semibold select-none">Description Role</label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="bg-black border border-neutral-700 text-white p-2 rounded outline-none font-sans focus:border-[#7A2A2A] text-xs"
                  placeholder="e.g., Warm vintage low-contrast styles..."
                />
              </div>

              <div className="flex flex-col gap-1 select-none">
                <label className="text-zinc-400 font-semibold">Extension Module Target Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomType("theme")}
                    className={`flex-1 py-1.5 rounded border border-transparent font-bold cursor-pointer text-center text-[10px] ${
                      customType === "theme"
                        ? "bg-[#7A2A2A] text-white"
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-750"
                    }`}
                  >
                    Custom Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomType("snippet")}
                    className={`flex-1 py-1.5 rounded border border-transparent font-bold cursor-pointer text-center text-[10px] ${
                      customType === "snippet"
                        ? "bg-[#7A2A2A] text-white"
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-750"
                    }`}
                  >
                    Custom Snippet
                  </button>
                </div>
              </div>

              {/* Dynamic Theme Designer block */}
              {customType === "theme" ? (
                <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800 flex flex-col gap-3 select-none">
                  {/* Mode Tabs */}
                  <div className="flex bg-neutral-950/80 rounded p-1 select-none text-[10px] gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("builder");
                        setJsonError(null);
                      }}
                      className={`flex-1 py-1 rounded font-semibold text-center cursor-pointer transition-all ${
                        themeMode === "builder" ? "bg-[#7A2A2A] text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Simple Colors
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("vscode-json");
                        setJsonError(null);
                      }}
                      className={`flex-1 py-1 rounded font-semibold text-center cursor-pointer transition-all ${
                        themeMode === "vscode-json" ? "bg-[#7A2A2A] text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      VS Code JSON
                    </button>
                  </div>

                  {themeMode === "builder" ? (
                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-[#AA4A4A] text-[9.5px] uppercase tracking-wider select-none">Theme Color Swatches</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 font-sans">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-400 truncate">Background</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-400 truncate">Foreground</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                          <input
                            type="color"
                            value={keywordColor}
                            onChange={(e) => setKeywordColor(e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-400 truncate">Keywords</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                          <input
                            type="color"
                            value={stringColor}
                            onChange={(e) => setStringColor(e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-400 truncate">Strings</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                          <input
                            type="color"
                            value={commentColor}
                            onChange={(e) => setCommentColor(e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-400 truncate">Comments</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                          <input
                            type="color"
                            value={functionColor}
                            onChange={(e) => setFunctionColor(e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-400 truncate">Functions</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 text-left">
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 font-semibold text-[10px]">VS Code Theme Template</label>
                        <select
                          value={selectedVsCodeTemplate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedVsCodeTemplate(val);
                            setVscodeJsonText(VSCODE_PRESETS[val]?.json || "");
                            if (VSCODE_PRESETS[val]) {
                              setCustomName(VSCODE_PRESETS[val].name);
                              setCustomDesc(VSCODE_PRESETS[val].description);
                            }
                            setJsonError(null);
                          }}
                          className="bg-black border border-neutral-700 text-white p-1 rounded outline-none font-sans text-[11px]"
                        >
                          <option value="one-dark-pro">One Dark Pro (Atom Aesthetic)</option>
                          <option value="nord">Nord Frost Theme</option>
                          <option value="synthwave84">SynthWave '84 (Neon Outrun)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 font-semibold text-[10px]">Theme Color Scheme JSON Code</label>
                        <textarea
                          value={vscodeJsonText}
                          onChange={(e) => {
                            setVscodeJsonText(e.target.value);
                            setJsonError(null);
                          }}
                          className="bg-black border border-neutral-750 text-emerald-400 p-1.5 rounded font-mono text-[9.5px] outline-none h-40 resize-y leading-relaxed"
                          placeholder="Paste real VS Code theme JSON file here..."
                        />
                      </div>

                      {jsonError && (
                        <div className="bg-red-950/40 border border-red-500/30 text-rose-300 p-2 rounded text-[10px] leading-relaxed whitespace-pre-wrap">
                          <strong>Format Error:</strong> {jsonError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Dynamic Snippets block */
                <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800 flex flex-col gap-2">
                  <span className="font-bold text-[#AA4A4A] text-[10px] uppercase block tracking-wider">Snippet configuration</span>
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500 font-semibold select-none">Trigger keyword shortcut</label>
                    <input
                      type="text"
                      value={snippetTrigger}
                      onChange={(e) => setSnippetTrigger(e.target.value)}
                      className="bg-black border border-neutral-700 text-white p-1 rounded font-mono text-xs text-center"
                      placeholder="rfc, clg, etc"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500 font-semibold select-none">Snippet boilerplate text body</label>
                    <textarea
                      value={snippetBody}
                      onChange={(e) => setSnippetBody(e.target.value)}
                      className="bg-black border border-neutral-700 text-white p-1 rounded font-mono text-[10px] outline-none"
                      rows={5}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-700 text-white py-2 px-4 rounded font-bold text-center w-full transition-colors cursor-pointer select-none"
              >
                Compile & Register Custom Extension
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
