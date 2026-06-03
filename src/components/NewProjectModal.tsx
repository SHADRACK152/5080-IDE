import React, { useState } from "react";
import { X, Sparkles, Folder, Terminal, Cpu, ArrowRight } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScaffold: (template: string, name: string) => Promise<void>;
  isScaffolding: boolean;
}

const TEMPLATES = [
  {
    id: "react-vite",
    name: "React (Vite)",
    description: "React 18 single page application setup with Vite build system and Tailwind.",
    icon: Cpu,
    color: "text-cyan-400",
  },
  {
    id: "node-express",
    name: "Node.js (Express)",
    description: "Lightweight backend Web API setup with Express routing and start scripts.",
    icon: Terminal,
    color: "text-emerald-400",
  },
  {
    id: "python-project",
    name: "Python Application",
    description: "Python development structure with unit tests and requirements.txt.",
    icon: Sparkles,
    color: "text-amber-400",
  },
  {
    id: "clean",
    name: "Empty Workspace",
    description: "A clean folder structure initialized with a markdown README project file.",
    icon: Folder,
    color: "text-rose-400",
  },
];

export default function NewProjectModal({
  isOpen,
  onClose,
  onScaffold,
  isScaffolding,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("react-vite");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError("Please specify a project folder name.");
      return;
    }

    // Direct folder name validation
    if (!/^[a-zA-Z0-9_\-]+$/.test(projectName.trim())) {
      setError("Folder name can only contain letters, numbers, hyphens, and underscores.");
      return;
    }

    try {
      await onScaffold(selectedTemplate, projectName.trim());
      setProjectName("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to scaffold template.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans select-none">
      <div 
        className="w-full max-w-lg bg-[#252526] border border-[#3c3c3c] rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] bg-[#38383833]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-zinc-200 font-bold uppercase tracking-wider text-xs">
              Scaffold New Project Workspace
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-0.5 rounded hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-5 space-y-4">
          {error && (
            <div className="bg-red-950/40 border border-red-800/40 text-red-200 p-2.5 rounded text-xs">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5Packed">
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
              Project Folder Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. interactive-dashboard"
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-white placeholder-gray-500 outline-none text-xs focus:border-[#7A2A2A] transition-all font-mono"
              autoFocus
              disabled={isScaffolding}
            />
          </div>

          {/* Select Template grid */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
              Select Scaffolding Template
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      if (!isScaffolding) setSelectedTemplate(tmpl.id);
                    }}
                    className={`p-3 rounded border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-[#7A2A2A]/10 border-[#7A2A2A]"
                        : "bg-[#1e1e1e] border-[#3c3c3c] hover:border-neutral-700 hover:bg-neutral-900/40"
                    }`}
                  >
                    <div className={`p-1.5 rounded bg-neutral-900 shrink-0 ${tmpl.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200 text-xs block">{tmpl.name}</span>
                        {isSelected && <span className="text-[10px] text-rose-300 font-bold tracking-widest uppercase">Active</span>}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 block leading-relaxed font-sans font-medium">
                        {tmpl.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E1E1E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white bg-transparent hover:bg-neutral-800 rounded font-semibold text-xs border border-transparent transition-all"
              disabled={isScaffolding}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#7A2A2A] text-white hover:bg-[#632020] rounded font-semibold text-xs transition-colors flex items-center gap-1.5 select-none shrink-0"
              disabled={isScaffolding}
            >
              {isScaffolding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Configuring workspace...</span>
                </>
              ) : (
                <>
                  <span>Bootstrap Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
