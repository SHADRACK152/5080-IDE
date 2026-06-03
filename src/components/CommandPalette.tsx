import React, { useState, useEffect, useRef } from "react";
import { Search, Layers, Play, Check, X, Code, Terminal, AlertCircle } from "lucide-react";

interface CommandItem {
  id: string;
  name: string;
  category: string;
  keybinding?: string;
  icon?: any;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (commandId: string) => void;
  registeredCommands: CommandItem[];
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectCommand,
  registeredCommands,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle outside clicks to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Key navigation in Palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredCommands = registeredCommands.filter((cmd) => {
    const query = search.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[10vh] px-4 backdrop-blur-[1.5px] select-none"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#252526] border border-[#3b3b3c] rounded-lg shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        {/* Search header prompt */}
        <div className="flex items-center gap-3 border-b border-[#3b3b3c] px-3.5 h-[44px] bg-[#1e1e1e] font-sans">
          <Layers className="w-4 h-4 text-rose-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands (e.g., git, save, preferences)..."
            className="flex-1 bg-transparent text-white outline-none placeholder-gray-500 font-sans tracking-tight text-[13px]"
          />
          <span className="text-[10px] text-zinc-500 font-mono tracking-wider font-semibold uppercase bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
            palette
          </span>
        </div>

        {/* Command items Scroll pane */}
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2.5 space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs font-sans">
              <span>No matching commands found.</span>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = cmd.icon || Check;

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 text-[12.5px] rounded cursor-pointer transition-colors duration-100 font-sans ${
                    isSelected
                      ? "bg-[#7A2A2A] text-white font-semibold"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate font-sans">
                    <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-gray-400"}`} />
                    <span className="font-sans">
                      <span className={`${isSelected ? "text-rose-100" : "text-gray-400"} mr-1 font-bold font-sans`}>
                        {cmd.category}:
                      </span>
                      {cmd.name}
                    </span>
                  </div>

                  {cmd.keybinding && (
                    <kbd className={`font-mono text-[9.5px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                      isSelected
                        ? "bg-[#632020] border-[#632020] text-white"
                        : "bg-neutral-900 border-neutral-800 text-zinc-500"
                    }`}>
                      {cmd.keybinding}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Palette footer hints */}
        <div className="h-[28px] bg-[#1e1e1e] border-t border-[#3b3b3c] flex items-center px-4 self-stretch select-none text-[10px] text-zinc-500 font-mono justify-between font-sans pr-5 shrink-0 select-none">
          <div className="flex items-center gap-2 select-none">
            <span>↑↓ Navigate</span>
            <span className="text-neutral-700">|</span>
            <span>Enter Select</span>
            <span className="text-neutral-700">|</span>
            <span>Esc Close</span>
          </div>
          <span>Goldman Engine v1.4</span>
        </div>
      </div>
    </div>
  );
}
