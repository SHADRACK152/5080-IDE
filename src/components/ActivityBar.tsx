import { Files, Search, GitBranch, Cpu, Settings, User, Puzzle, Package } from "lucide-react";

interface ActivityBarProps {
  activeTab: "explorer" | "search" | "git" | "gemini" | "settings" | "extensions" | "profile" | "packages";
  onTabSelect: (tab: "explorer" | "search" | "git" | "gemini" | "settings" | "extensions" | "profile" | "packages") => void;
  isVisible: boolean;
  onToggleVisible: () => void;
}

export default function ActivityBar({
  activeTab,
  onTabSelect,
  isVisible,
  onToggleVisible,
}: ActivityBarProps) {
  const sidebarTabs = [
    { id: "explorer" as const, icon: Files, title: "Explorer (Ctrl+Shift+E)" },
    { id: "search" as const, icon: Search, title: "Fuzzy Code Search (Ctrl+Shift+F)" },
    { id: "git" as const, icon: GitBranch, title: "Source Code Version Status" },
    { id: "gemini" as const, icon: Cpu, title: "Gemini Copilot Assistant Chat", highlight: true },
    { id: "packages" as const, icon: Package, title: "Dependency & Package Manager" },
    { id: "extensions" as const, icon: Puzzle, title: "Extensions & Themes Market (Ctrl+Shift+X)" },
  ];

  return (
    <div
      id="activitybar-container"
      className="w-[48px] bg-[#333333] border-r border-[#1E1E1E] flex flex-col justify-between items-center py-2 select-none shrink-0"
    >
      {/* Top action selectors */}
      <div className="flex flex-col items-center gap-1.5 w-full font-sans">
        {sidebarTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = isVisible && activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isActive) {
                  onToggleVisible();
                } else {
                  onTabSelect(tab.id);
                  if (!isVisible) onToggleVisible();
                }
              }}
              className={`w-12 h-11 flex items-center justify-center relative cursor-pointer group transition-all`}
              title={tab.title}
            >
              {/* Left active line indicator */}
              <div
                className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#7A2A2A] transition-all duration-150 ${
                  isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50 group-hover:opacity-40"
                }`}
              />

              {/* Icon */}
              <IconComponent
                className={`w-[22px] h-[22px] transition-colors relative ${
                  isActive
                    ? tab.highlight ? "text-cyan-400" : "text-white"
                     : tab.highlight
                    ? "text-cyan-500/80 group-hover:text-cyan-400"
                    : "text-gray-400 group-hover:text-gray-200"
                }`}
              />

              {/* Glowing ring for AI Copilot */}
              {tab.highlight && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile and Settings buttons */}
      <div className="flex flex-col items-center gap-1 w-full font-sans">
        {/* Real Developer Account Profile Button */}
        <button
          onClick={() => {
            onTabSelect("profile");
            if (!isVisible) onToggleVisible();
          }}
          className={`w-12 h-11 flex items-center justify-center relative cursor-pointer group transition-colors`}
          title="User Account & Personalization"
        >
          <div
            className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#7A2A2A] transition-all ${
              isVisible && activeTab === "profile" ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50 group-hover:opacity-40"
            }`}
          />
          <User
            className={`w-[20px] h-[20px] transition-colors ${
              isVisible && activeTab === "profile"
                ? "text-white"
                : "text-gray-400 group-hover:text-gray-200"
            }`}
          />
        </button>

        {/* Global Settings Trigger */}
        <button
          onClick={() => {
            onTabSelect("settings");
            if (!isVisible) onToggleVisible();
          }}
          className={`w-12 h-11 flex items-center justify-center relative cursor-pointer group transition-colors`}
          title="Preferences (Ctrl+,)"
        >
          <div
            className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#7A2A2A] transition-all ${
              isVisible && activeTab === "settings" ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50 group-hover:opacity-40"
            }`}
          />
          <Settings
            className={`w-[20px] h-[20px] transition-colors ${
              isVisible && activeTab === "settings"
                ? "text-white"
                : "text-gray-400 group-hover:text-gray-200"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
