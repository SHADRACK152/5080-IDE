import React, { useState, useEffect, useRef } from "react";
import { Package, Search, Trash2, Terminal, AlertTriangle, Check, Loader2, Play, Square, ChevronDown, ChevronUp } from "lucide-react";

interface InstalledPackage {
  name: string;
  version: string;
  dev?: boolean;
}

interface RegistryPackage {
  name: string;
  version: string;
  description: string;
  author: string;
  date?: string;
}

export default function PackagesTab() {
  const [activeTab, setActiveTab] = useState<"npm" | "pip">("npm");
  
  // Installed packages states
  const [installedNpm, setInstalledNpm] = useState<InstalledPackage[]>([]);
  const [installedPip, setInstalledPip] = useState<InstalledPackage[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  // Search packages states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RegistryPackage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegistryPackage, setSelectedRegistryPackage] = useState<RegistryPackage | null>(null);
  
  // Install parameters
  const [npmSaveType, setNpmSaveType] = useState<"save" | "save-dev" | "global">("save");

  // Console output log streaming states
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Load installed packages on start
  const fetchInstalledPackages = async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch("/api/packages/list");
      if (response.ok) {
        const data = await response.json();
        setInstalledNpm(data.npm || []);
        setInstalledPip(data.python || []);
      }
    } catch (err) {
      console.error("Failed to load packages list:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchInstalledPackages();
  }, []);

  // Search registry packages as user types (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const type = activeTab === "npm" ? "npm" : "python";
        const response = await fetch(`/api/packages/search?type=${type}&query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error("Failed to search packages:", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  // Scroll console to bottom on logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleOutput]);

  const executePackageCommand = async (commandStr: string, successMessage: string) => {
    setIsConsoleOpen(true);
    setIsCommandRunning(true);
    setConsoleOutput((prev) => [...prev, `\x1b[1;30m$ ${commandStr}\x1b[0m`]);

    try {
      const response = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandStr }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let leftoverBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const combined = leftoverBuffer + textChunk;
          const lines = combined.split("\n");
          
          leftoverBuffer = lines.pop() || "";

          setConsoleOutput((prev) => {
            const next = [...prev];
            lines.forEach((line) => {
              next.push(line.replace(/\r/g, ""));
            });
            return next;
          });
        }
        if (leftoverBuffer) {
          setConsoleOutput((prev) => [...prev, leftoverBuffer.replace(/\r/g, "")]);
        }
      } else {
        const fullText = await response.text();
        setConsoleOutput((prev) => [...prev, ...fullText.split("\n")]);
      }
      
      setConsoleOutput((prev) => [...prev, `\x1b[1;32m✓ ${successMessage}\x1b[0m`]);
      // Reload lists
      fetchInstalledPackages();
    } catch (error: any) {
      setConsoleOutput((prev) => [...prev, `\x1b[1;31m✗ Command Failed: ${error.message}\x1b[0m`]);
    } finally {
      setIsCommandRunning(false);
    }
  };

  const handleInstall = (pkg: RegistryPackage) => {
    let cmd = "";
    if (activeTab === "npm") {
      let saveFlag = "--save";
      if (npmSaveType === "save-dev") saveFlag = "--save-dev";
      if (npmSaveType === "global") saveFlag = "-g";
      cmd = `npm install ${pkg.name} ${saveFlag}`;
    } else {
      cmd = `pip install ${pkg.name}`;
    }
    executePackageCommand(cmd, `Successfully installed package ${pkg.name}`);
    setSelectedRegistryPackage(null);
    setSearchQuery("");
  };

  const handleUninstall = (pkgName: string) => {
    let cmd = "";
    if (activeTab === "npm") {
      cmd = `npm uninstall ${pkgName}`;
    } else {
      cmd = `pip uninstall -y ${pkgName}`;
    }
    executePackageCommand(cmd, `Successfully uninstalled package ${pkgName}`);
  };

  const getFilteredPackages = () => {
    const list = activeTab === "npm" ? installedNpm : installedPip;
    if (!filterQuery) return list;
    return list.filter(pkg => pkg.name.toLowerCase().includes(filterQuery.toLowerCase()));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#252526] text-gray-300 font-sans text-xs select-none">
      {/* 1. Header & Registry select */}
      <div className="p-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#7A2A2A]" />
            <span className="font-semibold text-white tracking-wide text-xs">MODULES INSTALLER</span>
          </div>
          <button 
            onClick={fetchInstalledPackages} 
            disabled={isLoadingList}
            className="text-[10px] text-zinc-400 hover:text-white transition-colors uppercase font-bold cursor-pointer disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border border-zinc-800 rounded bg-black/40 overflow-hidden shrink-0 mt-2">
          <button
            onClick={() => {
              setActiveTab("npm");
              setSearchQuery("");
              setFilterQuery("");
              setSelectedRegistryPackage(null);
            }}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === "npm" ? "bg-[#7A2A2A] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Node.js (NPM)
          </button>
          <button
            onClick={() => {
              setActiveTab("pip");
              setSearchQuery("");
              setFilterQuery("");
              setSelectedRegistryPackage(null);
            }}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === "pip" ? "bg-[#7A2A2A] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Python (Pip)
          </button>
        </div>
      </div>

      {/* 2. Package Search Box */}
      <div className="p-3 border-b border-zinc-800 shrink-0 bg-black/10">
        <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider mb-1.5">Search & Install Packages</span>
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === "npm" ? "Search npm modules (e.g. lodash)..." : "Search pip modules (e.g. requests)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border border-zinc-800 text-white p-2 pl-8 rounded outline-none text-[11px] w-full focus:border-[#7A2A2A] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          {isSearching && <Loader2 className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 animate-spin" />}
        </div>

        {/* Autocomplete Registry Search results list */}
        {searchResults.length > 0 && (
          <div className="mt-1.5 border border-zinc-800 rounded bg-[#1e1e1e] max-h-[160px] overflow-y-auto shadow-lg z-10 relative">
            {searchResults.map((pkg) => (
              <button
                key={pkg.name}
                onClick={() => setSelectedRegistryPackage(pkg)}
                className="w-full text-left p-2 border-b border-zinc-900 hover:bg-zinc-800 transition-colors flex flex-col gap-0.5 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#AA4A4A] text-[11.5px] font-mono">{pkg.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">v{pkg.version}</span>
                </div>
                {pkg.description && (
                  <p className="text-[9.5px] text-zinc-400 truncate w-full">{pkg.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Selected Package Details & Installation Option panel */}
        {selectedRegistryPackage && (
          <div className="mt-2.5 p-2 bg-zinc-900/60 border border-zinc-800 rounded leading-relaxed">
            <div className="flex justify-between items-start mb-1 select-text">
              <div>
                <span className="font-bold text-[#AA4A4A] text-xs font-mono block">{selectedRegistryPackage.name}</span>
                <span className="text-[9px] text-zinc-500 font-mono">Latest: v{selectedRegistryPackage.version} • by {selectedRegistryPackage.author}</span>
              </div>
              <button 
                onClick={() => setSelectedRegistryPackage(null)}
                className="text-zinc-500 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-400 select-text mb-2.5 italic">
              {selectedRegistryPackage.description || "No description provided."}
            </p>

            <div className="flex items-center gap-1.5 mt-2">
              {activeTab === "npm" && (
                <select
                  value={npmSaveType}
                  onChange={(e) => setNpmSaveType(e.target.value as any)}
                  className="bg-black border border-zinc-700 text-gray-300 text-[10px] p-1 rounded outline-none cursor-pointer flex-1"
                >
                  <option value="save">Dependency (--save)</option>
                  <option value="save-dev">Dev Dependency (-D)</option>
                  <option value="global">Global (-g)</option>
                </select>
              )}
              
              <button
                onClick={() => handleInstall(selectedRegistryPackage)}
                disabled={isCommandRunning}
                className="bg-[#7A2A2A] hover:bg-[#632020] text-white py-1 px-3 rounded font-bold text-[10px] tracking-wide cursor-pointer select-none transition-colors shrink-0 disabled:opacity-50"
              >
                {isCommandRunning ? "Installing..." : "Install"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Installed dependencies list */}
      <div className="flex-1 min-h-0 flex flex-col p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Installed dependencies</span>
          <span className="text-[10px] text-zinc-400 font-mono">({getFilteredPackages().length})</span>
        </div>

        {/* Filter input */}
        <div className="relative mb-2 shrink-0">
          <input
            type="text"
            placeholder="Filter installed modules..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="bg-black/50 border border-zinc-800 text-gray-300 p-1.5 pl-6 rounded outline-none text-[10px] w-full"
          />
          <Search className="w-3 h-3 text-zinc-600 absolute left-2 top-2" />
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
          {isLoadingList ? (
            <div className="flex items-center justify-center gap-1.5 py-8 text-zinc-500 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7A2A2A]" />
              <span>Scanning project packages...</span>
            </div>
          ) : getFilteredPackages().length === 0 ? (
            <div className="text-zinc-500 py-6 text-center italic">
              {filterQuery ? "No packages match filter." : "No packages detected."}
            </div>
          ) : (
            getFilteredPackages().map((pkg) => (
              <div
                key={pkg.name}
                className="flex items-center justify-between p-2 hover:bg-black/20 bg-black/10 border border-zinc-800/40 rounded transition-colors"
              >
                <div className="min-w-0 select-text">
                  <span className="font-semibold text-zinc-200 font-mono text-[10.5px] truncate block">{pkg.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 select-none">
                    <span className="text-[9px] text-zinc-500 font-mono">v{pkg.version}</span>
                    {pkg.dev && (
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-bold uppercase">dev</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleUninstall(pkg.name)}
                  disabled={isCommandRunning}
                  className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer disabled:opacity-50"
                  title={`Uninstall ${pkg.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Collapsible Live Installation Console Log at the bottom */}
      <div className="mt-auto border-t border-zinc-800 bg-[#151515] flex flex-col shrink-0">
        <button
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className="w-full flex items-center justify-between p-2 px-3 hover:bg-black/30 transition-colors select-none font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>Installation Console</span>
            {isCommandRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </div>
          {isConsoleOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {isConsoleOpen && (
          <div className="h-[120px] p-2 overflow-y-auto border-t border-zinc-900 bg-black text-zinc-400 font-mono text-[10px] leading-relaxed selection:bg-neutral-800 select-text">
            {consoleOutput.length === 0 ? (
              <span className="text-zinc-600 italic select-none">Ready. Installation and removal execution audits stream here.</span>
            ) : (
              <div className="space-y-0.5">
                {consoleOutput.map((line, idx) => {
                  let styleClass = "text-zinc-400";
                  if (line.includes("completed with exit code 0") || line.startsWith("✓")) styleClass = "text-emerald-400 font-semibold";
                  else if (line.includes("completed with exit code") || line.startsWith("✗") || line.includes("error")) styleClass = "text-rose-400 font-semibold";
                  else if (line.startsWith("$")) styleClass = "text-zinc-500 font-bold";
                  
                  return (
                    <div key={idx} className={`${styleClass} whitespace-pre-wrap font-mono`}>
                      {line}
                    </div>
                  );
                })}
                {isCommandRunning && (
                  <div className="flex items-center gap-1 text-cyan-400 animate-pulse font-mono font-medium">
                    <span>█ Streaming install stdout...</span>
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
