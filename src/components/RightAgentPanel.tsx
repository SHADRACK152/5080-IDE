import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  Key,
  Copy,
  CheckCheck,
  FilePen,
  RefreshCw,
  Trash2,
  Minimize2,
  Maximize2,
  Plus,
  ChevronUp
} from "lucide-react";
import { LLMProvider, AIProviderKeys, ChatMessage } from "../types";

interface RightAgentPanelProps {
  width: number;
  onWidthChange: (w: number) => void;
  isVisible: boolean;
  onToggleVisible: () => void;
  aiKeys: AIProviderKeys;
  activeFile?: { path: string; relativePath: string; content: string; name: string } | null;
  onApplyAgentResult?: (content: string, filePath: string) => void;
  logOutput: (msg: string) => void;

  // New model props
  selectedModelId: string;
  onSelectModel: (modelId: string, provider: LLMProvider) => void;
  customModels: any[];
}

export type RightAgentType = "github" | "claude" | "gemini" | "grok";

interface AgentInfo {
  id: RightAgentType;
  name: string;
  provider: LLMProvider;
  desc: string;
  avatarColor: string;
  bgGradient: string;
  accentColor: string;
  icon: React.ComponentType<any>;
}

const AGENTS_LIST: AgentInfo[] = [
  {
    id: "claude",
    name: "Claude Code",
    provider: "claude",
    desc: "System architect. Specializes in deep reasoning, structured code edits, refactoring, and logical correctness.",
    avatarColor: "text-amber-400 bg-amber-950/40 border-amber-800/50",
    bgGradient: "from-amber-900/10 to-amber-950/20",
    accentColor: "border-amber-500/30 text-amber-300",
    icon: Cpu
  },
  {
    id: "github",
    name: "GitHub Copilot",
    provider: "openai",
    desc: "Speed developer. Rapid boilerplates, quick utility functions, and inline code autocomplete suggestions.",
    avatarColor: "text-purple-400 bg-purple-950/40 border-purple-800/50",
    bgGradient: "from-purple-900/10 to-purple-950/20",
    accentColor: "border-purple-500/30 text-purple-300",
    icon: Bot
  },
  {
    id: "gemini",
    name: "Gemini Dev",
    provider: "gemini",
    desc: "Context explorer. Explanation of files, research queries, and workspace structure walkthroughs.",
    avatarColor: "text-sky-400 bg-sky-950/40 border-sky-800/50",
    bgGradient: "from-sky-900/10 to-sky-950/20",
    accentColor: "border-sky-500/30 text-sky-300",
    icon: Sparkles
  },
  {
    id: "grok",
    name: "Grok Builder",
    provider: "grok",
    desc: "Action driver. Great for shell commands, rapid unit tests, script generation, and bug fixing.",
    avatarColor: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
    bgGradient: "from-emerald-900/10 to-emerald-950/20",
    accentColor: "border-emerald-500/30 text-emerald-300",
    icon: Cpu
  }
];

export interface ModelConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  displayName: string;
  speed: "Fast" | "Medium" | "Slow";
  hasWarning?: boolean;
}

const DEFAULT_MODELS: ModelConfig[] = [
  { id: "gemini-2.5-flash-medium", name: "Gemini 3.5 Flash (Medium)", displayName: "Gemini 3.5 Flash (Medium)", provider: "gemini", speed: "Fast" },
  { id: "gemini-2.5-flash-high", name: "Gemini 3.5 Flash (High)", displayName: "Gemini 3.5 Flash (High)", provider: "gemini", speed: "Fast" },
  { id: "gemini-2.5-flash-low", name: "Gemini 3.5 Flash (Low)", displayName: "Gemini 3.5 Flash (Low)", provider: "gemini", speed: "Fast" },
  { id: "gemini-1.5-pro-low", name: "Gemini 3.1 Pro (Low)", displayName: "Gemini 3.1 Pro (Low)", provider: "gemini", speed: "Medium" },
  { id: "gemini-1.5-pro-high", name: "Gemini 3.1 Pro (High)", displayName: "Gemini 3.1 Pro (High)", provider: "gemini", speed: "Medium" },
  { id: "claude-3-5-sonnet", name: "Claude Sonnet 4.6 (Thinking)", displayName: "Claude Sonnet 4.6 (Thinking)", provider: "claude", speed: "Medium", hasWarning: true },
  { id: "claude-3-opus", name: "Claude Opus 4.6 (Thinking)", displayName: "Claude Opus 4.6 (Thinking)", provider: "claude", speed: "Slow", hasWarning: true },
  { id: "gpt-oss-120b", name: "GPT-OSS 120B (Medium)", displayName: "GPT-OSS 120B (Medium)", provider: "openai", speed: "Fast", hasWarning: true },
  { id: "grok-3-mini", name: "Grok 3 Mini", displayName: "Grok 3 Mini", provider: "grok", speed: "Fast" }
];

export default function RightAgentPanel({
  width,
  onWidthChange,
  isVisible,
  onToggleVisible,
  aiKeys,
  activeFile,
  onApplyAgentResult,
  logOutput,
  selectedModelId,
  onSelectModel,
  customModels
}: RightAgentPanelProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<RightAgentType>("claude");
  const [inputText, setInputText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<string | null>(null);
  const [isModelListOpen, setIsModelListOpen] = useState(false);

  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Combine default models and user configured custom models
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

  // Group chat histories by agent ID
  const [chatHistories, setChatHistories] = useState<Record<RightAgentType, ChatMessage[]>>(() => {
    const initialHistories: Record<RightAgentType, ChatMessage[]> = {
      claude: [
        {
          id: "claude-init",
          sender: "ai",
          text: "Greetings. I am Claude Code, your systems architect. Let's analyze, design, and restructure your codebase. Ask me to refactor elements, review APIs, or address bugs in the active file.",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      github: [
        {
          id: "github-init",
          sender: "ai",
          text: "Hey! I'm GitHub Copilot. Ready to write some code? Give me a prompt and I will spit out quick functions, loops, boilerplate, or unit tests right away.",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      gemini: [
        {
          id: "gemini-init",
          sender: "ai",
          text: "Hello! I am the Gemini Dev agent. I can help search files, explain tricky sections, or walk you through structural diagrams. What's on your mind?",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      grok: [
        {
          id: "grok-init",
          sender: "ai",
          text: "What's up! Grok Builder here. Give me commands, logic challenges, or scripts. Let's build something fast and clean.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };
    return initialHistories;
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const activeAgent = AGENTS_LIST.find((a) => a.id === selectedAgentId) || AGENTS_LIST[0];
  const currentHistory = chatHistories[selectedAgentId] || [];
  const selectedProvider = activeAgent.provider;
  const activeKey = (aiKeys as any)[selectedProvider];

  // Close dropup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelListOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync agent selection when model changes
  useEffect(() => {
    const activeModel = allModels.find((m) => m.id === selectedModelId);
    if (activeModel) {
      const modelProvider = activeModel.provider;
      if (modelProvider !== activeAgent.provider) {
        const targetAgent = AGENTS_LIST.find((a) => a.provider === modelProvider);
        if (targetAgent) {
          setSelectedAgentId(targetAgent.id);
        }
      }
    }
  }, [selectedModelId]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentHistory, isPending]);

  const handleAgentClick = (agentId: RightAgentType) => {
    setSelectedAgentId(agentId);
    const agent = AGENTS_LIST.find((a) => a.id === agentId);
    if (agent) {
      const defaultModelMap: Record<string, string> = {
        gemini: "gemini-2.5-flash-high",
        claude: "claude-3-5-sonnet",
        openai: "gpt-oss-120b",
        grok: "grok-3-mini"
      };
      const defaultModelId = defaultModelMap[agent.provider];
      if (defaultModelId) {
        onSelectModel(defaultModelId, agent.provider);
      }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isPending) return;

    const queryText = inputText.trim();
    setInputText("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistories((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), userMsg]
    }));

    setIsPending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: activeKey || undefined,
          messages: [...currentHistory, userMsg],
          selectedFile: activeFile
            ? { relativePath: activeFile.relativePath, content: activeFile.content }
            : null,
          selectedCode: activeFile ? activeFile.content : null,
          model: selectedModelId
        })
      });

      const data = await res.json();

      if (res.ok) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistories((prev) => ({
          ...prev,
          [selectedAgentId]: [...(prev[selectedAgentId] || []), aiMsg]
        }));
        logOutput(`Agent [${activeAgent.name}] responded.`);
      } else {
        throw new Error(data.error || "AI Service Timeout");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: `Error connecting to ${activeAgent.name} (${selectedProvider}): ${err.message}. Please double-check your API key in Settings.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistories((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), errorMsg]
      }));
      logOutput(`Agent [${activeAgent.name}] connection failed: ${err.message}`);
    } finally {
      setIsPending(false);
    }
  };

  const handleClear = () => {
    setChatHistories((prev) => ({
      ...prev,
      [selectedAgentId]: [
        {
          id: `${selectedAgentId}-init`,
          sender: "ai",
          text: `Chat history cleared. I am ${activeAgent.name}. How can I assist you?`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  };

  const extractCodeBlock = (text: string) => {
    const match = text.match(/```[\w]*\n([\s\S]*?)\n```/);
    return match ? match[1] : null;
  };

  if (!isVisible) {
    return (
      <div 
        onClick={onToggleVisible}
        className="w-8 border-l border-zinc-800 bg-[#252526] hover:bg-[#2e2e2f] flex flex-col items-center py-4 cursor-pointer select-none transition-colors duration-250 select-none shrink-0"
        title="Expand Agent Chat Desk"
      >
        <ChevronLeft className="w-4 h-4 text-zinc-400 mb-4 hover:text-white" />
        <Bot className="w-4 h-4 text-violet-400 animate-pulse mb-6" />
        
        <div className="flex-1 flex items-center justify-center">
          <span 
            className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Agent Chat Desk
          </span>
        </div>
      </div>
    );
  }

  const activeModelConfig = allModels.find(m => m.id === selectedModelId) || allModels[0];

  return (
    <div
      id="right-agent-panel"
      style={{ width: `${width}px` }}
      className="bg-[#252526] border-l border-[#1E1E1E] flex flex-col h-full shrink-0 relative overflow-hidden select-none"
    >
      {/* Resize Handle */}
      <div
        className="w-1 cursor-col-resize hover:bg-[#7A2A2A]/40 absolute left-0 top-0 bottom-0 z-50 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = width;

          const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            onWidthChange(Math.max(260, Math.min(600, startWidth - deltaX)));
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      />

      {/* Header */}
      <div className="h-9 px-3 border-b border-[#1E1E1E] flex items-center justify-between bg-[#38383833] shrink-0">
        <div className="flex items-center gap-1.5 font-sans">
          <Bot className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span className="text-zinc-400 font-bold uppercase tracking-tight text-[11px]">
            Agent Chat Desk
          </span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 font-sans">
          <button
            onClick={handleClear}
            className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            title="New Chat Session"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              logOutput("Loading agent interaction history logs...");
            }}
            className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Conversation History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              logOutput("Triggering agent preferences settings...");
            }}
            className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Agent Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleVisible}
            className="p-1 hover:text-white hover:bg-red-950/20 hover:text-red-400 rounded transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simplified Flat Agent Tabs */}
      <div className="px-3 py-1.5 border-b border-[#1E1E1E] bg-[#1e1e1e]/20 shrink-0 select-none">
        <div className="flex items-center justify-between gap-1.5 font-sans">
          {AGENTS_LIST.map((agent) => {
            const isSel = selectedAgentId === agent.id;
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => handleAgentClick(agent.id)}
                className={`flex-1 py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isSel 
                    ? "bg-[#7A2A2A] text-white shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800/30"
                }`}
                title={agent.desc}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="capitalize text-[10.5px]">{agent.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat scroll workspace */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3 font-sans text-xs select-text bg-[#03171e]/5"
      >
        {currentHistory.map((msg, index) => {
          const isAI = msg.sender === "ai";
          const codeBlock = isAI ? extractCodeBlock(msg.text) : null;
          return (
            <div
              key={msg.id || index}
              className={`flex flex-col p-2.5 rounded-lg leading-relaxed select-text ${
                isAI ? "bg-black/15 text-zinc-300" : "text-zinc-200"
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-1.5 select-none mb-1 text-[10px] text-zinc-500 font-sans">
                {isAI ? (
                  <span className="font-bold text-[#0ea5e9]/90 uppercase tracking-wider text-[9px]">{activeAgent.name}</span>
                ) : (
                  <span className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Developer</span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message content */}
              <div className="whitespace-pre-wrap leading-relaxed select-text text-[11.5px] font-medium font-sans">
                {msg.text}
              </div>

              {/* Apply/Copy button panel for code blocks */}
              {isAI && codeBlock && (
                <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex gap-1.5 select-none font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(codeBlock);
                      setCopiedIndex(msg.id);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 py-1 rounded text-[10px] cursor-pointer transition-colors"
                  >
                    {copiedIndex === msg.id ? (
                      <><CheckCheck className="w-3 h-3 text-emerald-400" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy Code</>
                    )}
                  </button>
                  {onApplyAgentResult && activeFile && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyAgentResult(codeBlock, activeFile.relativePath);
                        setAppliedIndex(msg.id);
                        setTimeout(() => setAppliedIndex(null), 2000);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#7A2A2A] hover:bg-[#632020] text-white py-1 rounded text-[10px] cursor-pointer transition-colors"
                    >
                      {appliedIndex === msg.id ? (
                        <><CheckCheck className="w-3 h-3 text-emerald-400" /> Applied!</>
                      ) : (
                        <><FilePen className="w-3 h-3" /> Apply to File</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isPending && (
          <div className="bg-black/10 p-2.5 rounded-lg flex items-center gap-2 text-violet-400 select-none animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-[11px] font-medium font-sans">Agent compiling thoughts...</span>
          </div>
        )}
      </div>

      {/* Footer / Unified Input Card */}
      <div className="p-3 border-t border-[#1E1E1E] bg-[#1e1e1e]/60 shrink-0">
        <div className="bg-black/40 border border-zinc-800/80 rounded-lg p-2.5 flex flex-col gap-2 relative">
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything, @ to mention, / for actions"
            disabled={isPending}
            rows={2}
            className="w-full bg-transparent text-white text-[11.5px] outline-none font-sans resize-none selection:bg-gray-700 min-h-[48px] placeholder-zinc-650"
          />

          {/* Inner Toolbar */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-850/80 text-zinc-400 text-[11px] select-none font-sans">
            {/* Active Model Drop-Up Button */}
            <div className="flex items-center gap-1.5 relative" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => setIsModelListOpen(!isModelListOpen)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-850/50 border border-zinc-800/80 hover:bg-zinc-805 hover:text-white transition-colors cursor-pointer font-sans font-medium text-cyan-300 text-[10px]"
              >
                <span>{activeModelConfig.displayName.split(" ")[0]}</span>
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {/* Floating Drop-Up menu */}
              {isModelListOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-[100] bg-[#0c1e24] border border-cyan-950/40 rounded-lg p-2 shadow-2xl flex flex-col gap-1 w-64 max-h-56 overflow-y-auto">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 px-2 select-none border-b border-zinc-850 pb-1">
                    Select Model
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {allModels.map((m) => {
                      const isSel = selectedModelId === m.id;
                      const isKeySet = !!(aiKeys as any)[m.provider];
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onSelectModel(m.id, m.provider);
                            setIsModelListOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 px-2.5 rounded text-left transition-colors cursor-pointer text-[10.5px] font-sans ${
                            isSel ? "bg-[#0f323c] text-cyan-300 border border-cyan-800/40 font-semibold" : "text-zinc-300 hover:bg-[#122830] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{m.name}</span>
                            {m.speed && (
                              <span className="text-[8px] bg-black/40 text-zinc-400 border border-zinc-800 px-1 py-0.5 rounded font-bold uppercase shrink-0">
                                {m.speed}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.hasWarning && !isKeySet && (
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

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={isPending || !inputText.trim()}
              className="bg-[#7A2A2A] hover:bg-[#632020] text-white p-1.5 rounded flex items-center justify-center disabled:opacity-40 transition-colors shrink-0 cursor-pointer ml-1"
              title="Send Command"
            >
              <Send className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

        {activeFile && (
          <div className="mt-1.5 px-1 flex items-center justify-between text-[9px] text-zinc-500 font-sans select-none truncate">
            <span>Context: {activeFile.name}</span>
            <span>Shift+Enter for newline</span>
          </div>
        )}
      </div>
    </div>
  );
}
