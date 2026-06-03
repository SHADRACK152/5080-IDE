import React, { useState } from "react";
import {
  User,
  Github,
  Mail,
  Shield,
  Briefcase,
  Star,
  Activity,
  LogOut,
  CheckCircle,
  Save,
  Grid,
  Check,
  Smartphone,
  Eye,
  Settings,
  Flame,
  Layout,
  Terminal,
  Columns
} from "lucide-react";
import { UserProfile, WorkspaceSettings } from "../types";

interface ProfileTabProps {
  currentUser: UserProfile | null;
  onLogin: (provider: "google" | "github", customName?: string, customEmail?: string, customRole?: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  settings: WorkspaceSettings;
  onUpdateSetting: (category: "editor" | "workbench", key: string, value: any) => void;
  logOutput: (msg: string) => void;
}

export default function ProfileTab({
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  settings,
  onUpdateSetting,
  logOutput
}: ProfileTabProps) {
  // Local active tabs/modes
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editBio, setEditBio] = useState("");

  // Simulated SSO Login wizard modal state
  const [ssoProvider, setSsoProvider] = useState<"google" | "github" | null>(null);
  const [ssoName, setSsoName] = useState("");
  const [ssoEmail, setSsoEmail] = useState("");
  const [ssoRole, setSsoRole] = useState("Full-Stack Developer");
  const [isSsoHandshake, setIsSsoHandshake] = useState(false);

  // Quick preset loading helper
  const handleApplyPreset = (preset: "default" | "zen" | "presentation" | "terminal-focus" | "sidebar-right") => {
    logOutput(`Applying layout preset: ${preset}`);
    
    // Default Preset
    if (preset === "default") {
      onUpdateSetting("workbench", "sidebarVisible", true);
      onUpdateSetting("workbench", "bottomPanelVisible", true);
      onUpdateSetting("workbench", "sidebarPosition", "left");
      onUpdateSetting("workbench", "bottomPanelPosition", "bottom");
      onUpdateSetting("workbench", "zenMode", false);
      onUpdateSetting("workbench", "statusBarVisible", true);
      onUpdateSetting("workbench", "activityBarVisible", true);
    } 
    // Zen Mode Preset
    else if (preset === "zen") {
      onUpdateSetting("workbench", "sidebarVisible", false);
      onUpdateSetting("workbench", "bottomPanelVisible", false);
      onUpdateSetting("workbench", "zenMode", true);
      onUpdateSetting("workbench", "statusBarVisible", false);
      onUpdateSetting("workbench", "activityBarVisible", false);
    } 
    // Presentation Mode Theme
    else if (preset === "presentation") {
      onUpdateSetting("workbench", "sidebarVisible", true);
      onUpdateSetting("workbench", "bottomPanelVisible", false);
      onUpdateSetting("workbench", "sidebarPosition", "left");
      onUpdateSetting("editor", "fontSize", 17);
    } 
    // Terminal Focus Mode
    else if (preset === "terminal-focus") {
      onUpdateSetting("workbench", "sidebarVisible", false);
      onUpdateSetting("workbench", "bottomPanelVisible", true);
      onUpdateSetting("workbench", "bottomPanelPosition", "bottom");
      onUpdateSetting("workbench", "bottomPanelHeight", 450);
    } 
    // Sidebar Right Mode
    else if (preset === "sidebar-right") {
      onUpdateSetting("workbench", "sidebarVisible", true);
      onUpdateSetting("workbench", "sidebarPosition", "right");
    }

    onUpdateSetting("workbench", "layoutPreset", preset);
  };

  const handleStartEdit = () => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditRole(currentUser.role);
      setEditBio(currentUser.bio || "");
      setIsEditing(true);
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editName.trim(),
      role: editRole.trim(),
      bio: editBio.trim()
    });
    setIsEditing(false);
    logOutput(`Profile details updated for: ${editName}`);
  };

  // Launch SSO Simulation flow
  const initiateSso = (provider: "google" | "github") => {
    setSsoProvider(provider);
    if (provider === "google") {
      setSsoName("Mark Emadu");
      setSsoEmail("markemadu@gmail.com");
      setSsoRole("Senior Cloud Architect");
    } else {
      setSsoName("markemadu");
      setSsoEmail("mark.emadu@github.com");
      setSsoRole("Lead AI Automation Engineer");
    }
  };

  const cancelSso = () => {
    setSsoProvider(null);
    setIsSsoHandshake(false);
  };

  const executeSsoHandshake = () => {
    setIsSsoHandshake(true);
    setTimeout(() => {
      onLogin(
        ssoProvider!,
        ssoName || (ssoProvider === "google" ? "Mark Emadu" : "markemadu"),
        ssoEmail || (ssoProvider === "google" ? "markemadu@gmail.com" : "mark.emadu@github.com"),
        ssoRole
      );
      setSsoProvider(null);
      setIsSsoHandshake(false);
      logOutput(`Identity Synched. Secure SSO session opened with G-Suite claims credentials.`);
    }, 1800);
  };

  // XP calculation
  const getXpPoints = () => {
    if (!currentUser) return 0;
    const { commits, filesSaved, errorsFixed, codeLineCount } = currentUser.stats;
    return commits * 150 + filesSaved * 45 + errorsFixed * 75 + codeLineCount * 1;
  };

  const getRank = () => {
    const xp = getXpPoints();
    if (xp > 1500) return "Master Craftsman (Lvl 5)";
    if (xp > 800) return "Senior Compiler Commander (Lvl 4)";
    if (xp > 400) return "Advanced System Weaver (Lvl 3)";
    if (xp > 150) return "Code Crafter (Lvl 2)";
    return "Workspace Initiate (Lvl 1)";
  };

  return (
    <div className="flex flex-col h-full font-sans text-xs select-text overflow-y-auto no-scrollbar pb-6">
      {/* HEADER BAR */}
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2.5 shrink-0 select-none">
        <User className="w-4 h-4 text-[#AA4A4A]" />
        <span className="font-bold text-zinc-100 text-xs tracking-wider uppercase">
          Identity & Workspace Layouts
        </span>
      </div>

      {currentUser ? (
        /* ================= AUTHENTICATED LOGGED-IN VIEW ================= */
        <div className="flex flex-col gap-4">
          
          {/* PROFILE CARD */}
          <div className="relative border border-zinc-800 rounded bg-[#1a1a1b] p-3.5 flex flex-col gap-3 select-none overflow-hidden group">
            {/* Top Rank Badge */}
            <div className="absolute top-3 right-3 bg-[#7A2A2A]/20 hover:bg-[#7A2A2A]/40 text-[#AA4A4A] border border-[#AA4A4A]/40 rounded-full px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>{getRank()}</span>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Profile Image with status glow */}
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full border-2 border-[#7A2A2A] object-cover bg-neutral-800"
                />
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1a1a1b]" title="Security claims verified active" />
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex flex-col gap-1 pr-12">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-black border border-zinc-700 text-white p-1 rounded text-xs px-2.5 font-bold outline-none"
                      placeholder="Username/Handle"
                    />
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="bg-black border border-zinc-700 text-zinc-300 p-1 rounded text-[11px] px-2.5 outline-none mt-1"
                      placeholder="Job title / Dev Role"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-white text-[13px] tracking-wide truncate flex items-center gap-1.5 leading-tight">
                      {currentUser.name}
                      {currentUser.provider === "google" ? (
                        <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-red-400" title="Signed in with Google">G</span>
                      ) : (
                        <Github className="w-3.5 h-3.5 text-zinc-400" title="Signed in with GitHub" />
                      )}
                    </h3>
                    <span className="text-zinc-400 text-[10.5px] block font-mono font-medium tracking-tight truncate mt-0.5 select-text">
                      <Mail className="w-3 h-3 inline mr-1 text-zinc-500" />
                      {currentUser.email}
                    </span>
                    <span className="text-zinc-300 text-[10px] uppercase font-bold tracking-wider mt-1 text-[#AA4A4A] flex items-center gap-1 select-none">
                      <Briefcase className="w-3 h-3 text-[#AA4A4A]" />
                      {currentUser.role}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* BIO */}
            <div className="border-t border-zinc-800/60 pt-2 text-[11px] leading-relaxed select-text">
              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-black border border-zinc-700 text-zinc-200 p-1 rounded text-xs px-2.5 h-16 outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-zinc-400 leading-normal italic text-[11px]">
                  {currentUser.bio || "No developer bio added. Keep learning and creating in 5080 IDE!"}
                </p>
              )}
            </div>

            {/* Actions: Edit or Save */}
            <div className="flex gap-2 justify-end pt-1 select-none">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 px-3 text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 rounded transition-colors text-zinc-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="p-1 px-3 text-[10px] font-semibold bg-[#7A2A2A] hover:bg-[#632020] text-white rounded flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Update</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 px-3 text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded transition-colors text-zinc-400 cursor-pointer border border-zinc-800"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-1 px-2 text-[10px] font-bold bg-zinc-950 hover:bg-red-850 text-rose-400 hover:text-white rounded border border-rose-950/40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* REAL-TIME GAMIFIED METRICS */}
          <div className="flex flex-col gap-2 border border-zinc-850 p-3 rounded bg-zinc-900/10 select-none">
            <span className="text-[10px] font-bold text-[#AA4A4A] uppercase tracking-wider block border-b border-zinc-850 pb-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#AA4A4A]" />
              <span>Personalized Workspace Analytics</span>
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-zinc-950/40 border border-zinc-900 p-2 rounded flex flex-col justify-center">
                <span className="text-gray-500 text-[9px] uppercase font-semibold font-sans">Drive Writes</span>
                <span className="text-white text-base font-bold mt-0.5">{currentUser.stats.filesSaved}</span>
                <span className="text-[9px] text-[#AA4A4A] mt-0.5 font-sans">FileSync Buffers</span>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-900 p-2 rounded flex flex-col justify-center">
                <span className="text-gray-500 text-[9px] uppercase font-semibold font-sans">Git Commits</span>
                <span className="text-white text-base font-bold mt-0.5">{currentUser.stats.commits}</span>
                <span className="text-[9px] text-[#AA4A4A] mt-0.5 font-sans">Container Timeline</span>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-900 p-2 rounded flex flex-col justify-center">
                <span className="text-gray-500 text-[9px] uppercase font-semibold font-sans">Fixed Diagnostics</span>
                <span className="text-white text-base font-bold mt-0.5">{currentUser.stats.errorsFixed}</span>
                <span className="text-[9px] text-emerald-500 mt-0.5 font-sans">Linter Warnings Resolved</span>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-900 p-2 rounded flex flex-col justify-center">
                <span className="text-gray-500 text-[9px] uppercase font-semibold font-sans">Active Coding</span>
                <span className="text-white text-base font-bold mt-0.5">{currentUser.stats.activeHours}m</span>
                <span className="text-[9px] text-zinc-500 mt-0.5 font-sans">System runtime index</span>
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-[#7A2A2A]/40 mt-1 p-2 rounded flex items-center justify-between text-[11px] font-sans font-medium text-zinc-300">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Accumulated XP Points:</span>
              </div>
              <span className="text-[#AA4A4A] font-bold font-mono text-xs pr-1">{getXpPoints()} pts</span>
            </div>
          </div>

          {/* DYNAMIC VS CODE ARRANGEMENTS / PERSONALIZATION PRESETS */}
          <div className="flex flex-col gap-3 border border-zinc-805 p-3 rounded bg-zinc-900/20">
            <span className="text-[10.5px] font-bold text-[#AA4A4A] uppercase tracking-wider block border-b border-zinc-850 pb-1.5 flex items-center gap-1 select-none">
              <Grid className="w-3.5 h-3.5 text-[#AA4A4A]" />
              <span>VS Code Workbench Settings</span>
            </span>

            {/* Presets Grid Selection */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-zinc-400 font-bold block mb-1">Display Layout presets</label>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  onClick={() => handleApplyPreset("default")}
                  className={`p-1.5 font-semibold rounded text-left transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    settings.workbench.layoutPreset === "default"
                      ? "bg-[#7A2A2A]/10 text-white border-[#7A2A2A]/50"
                      : "bg-[#252526] text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Layout className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Default Modern</span>
                </button>

                <button
                  onClick={() => handleApplyPreset("zen")}
                  className={`p-1.5 font-semibold rounded text-left transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    settings.workbench.layoutPreset === "zen"
                      ? "bg-[#7A2A2A]/10 text-white border-[#7A2A2A]/50"
                      : "bg-[#252526] text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Eye className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Zen Focus Space</span>
                </button>

                <button
                  onClick={() => handleApplyPreset("presentation")}
                  className={`p-1.5 font-semibold rounded text-left transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    settings.workbench.layoutPreset === "presentation"
                      ? "bg-[#7A2A2A]/10 text-white border-[#7A2A2A]/50"
                      : "bg-[#252526] text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="w-3 h-3 text-[#AA4A4A] shrink-0" />
                  <span className="truncate">Presentation View</span>
                </button>

                <button
                  onClick={() => handleApplyPreset("terminal-focus")}
                  className={`p-1.5 font-semibold rounded text-left transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    settings.workbench.layoutPreset === "terminal-focus"
                      ? "bg-[#7A2A2A]/10 text-white border-[#7A2A2A]/50"
                      : "bg-[#252526] text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Terminal className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Terminal Expanded</span>
                </button>

                <button
                  onClick={() => handleApplyPreset("sidebar-right")}
                  className={`p-1.5 font-semibold rounded text-left transition-colors cursor-pointer border col-span-2 flex items-center gap-1.5 justify-center ${
                    settings.workbench.layoutPreset === "sidebar-right"
                      ? "bg-[#7A2A2A]/10 text-white border-[#7A2A2A]/50"
                      : "bg-[#252526] text-zinc-300 border-zinc-800 hover:text-white"
                  }`}
                >
                  <Columns className="w-3 h-3 text-fuchsia-400" />
                  <span>Move Sidebar to Right Side</span>
                </button>
              </div>
            </div>

            {/* granular layout personalization options */}
            <div className="border-t border-zinc-800/80 pt-2.5 flex flex-col gap-3">
              <span className="text-zinc-400 font-bold block select-none">Granular Workbench Display Alignments</span>
              
              {/* Sidebar alignment toggle */}
              <div className="flex items-center justify-between select-none">
                <span className="text-zinc-300 font-medium font-sans">Primary Sidebar Location</span>
                <span className="flex rounded bg-black p-0.5 border border-zinc-800 text-[10.5px]">
                  <button
                    onClick={() => {
                      onUpdateSetting("workbench", "sidebarPosition", "left");
                      onUpdateSetting("workbench", "layoutPreset", "default");
                    }}
                    className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      settings.workbench.sidebarPosition === "left" ? "bg-[#7A2A2A] text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Left Side
                  </button>
                  <button
                    onClick={() => {
                      onUpdateSetting("workbench", "sidebarPosition", "right");
                      if (settings.workbench.layoutPreset !== "sidebar-right") {
                        onUpdateSetting("workbench", "layoutPreset", "sidebar-right");
                      }
                    }}
                    className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      settings.workbench.sidebarPosition === "right" ? "bg-[#7A2A2A] text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Right Side
                  </button>
                </span>
              </div>

              {/* Bottom Panel Position toggle */}
              <div className="flex items-center justify-between select-none">
                <span className="text-zinc-300 font-medium font-sans">Interactive Console Position</span>
                <span className="flex rounded bg-black p-0.5 border border-zinc-800 text-[10.5px]">
                  <button
                    onClick={() => onUpdateSetting("workbench", "bottomPanelPosition", "bottom")}
                    className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      settings.workbench.bottomPanelPosition === "bottom" ? "bg-[#7A2A2A] text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Bottom
                  </button>
                  <button
                    onClick={() => onUpdateSetting("workbench", "bottomPanelPosition", "right")}
                    className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      settings.workbench.bottomPanelPosition === "right" ? "bg-[#7A2A2A] text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Right Panel
                  </button>
                </span>
              </div>

              {/* Toggle Zen Mode */}
              <div className="flex items-center justify-between gap-1 select-none">
                <span className="text-zinc-300 font-medium font-sans">Enable Zen focus alignment</span>
                <input
                  type="checkbox"
                  checked={settings.workbench.zenMode}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    onUpdateSetting("workbench", "zenMode", isChecked);
                    handleApplyPreset(isChecked ? "zen" : "default");
                  }}
                  className="w-4 h-4 cursor-pointer accent-[#7A2A2A]"
                />
              </div>

              {/* Toggle StatusBar */}
              <div className="flex items-center justify-between gap-1 select-none">
                <span className="text-zinc-300 font-medium font-sans">Toggle bottom status bar visible</span>
                <input
                  type="checkbox"
                  checked={settings.workbench.statusBarVisible}
                  onChange={(e) => onUpdateSetting("workbench", "statusBarVisible", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#7A2A2A]"
                />
              </div>

              {/* Toggle ActivityBar */}
              <div className="flex items-center justify-between gap-1 select-none">
                <span className="text-zinc-300 font-medium font-sans">Toggle leftmost activity bar visible</span>
                <input
                  type="checkbox"
                  checked={settings.workbench.activityBarVisible}
                  onChange={(e) => onUpdateSetting("workbench", "activityBarVisible", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#7A2A2A]"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= DEAUTHENTICATED SIGN-IN WELCOME VIEW ================= */
        <div className="flex flex-col gap-4 select-none">
          <div className="border border-red-900/30 bg-red-950/10 rounded p-3 text-zinc-300 leading-relaxed text-center font-sans space-y-2">
            <Shield className="w-7 h-7 text-[#AA4A4A] mx-auto mb-1 animate-pulse" />
            <h3 className="font-bold text-white text-xs select-none">Persist Workbench settings & Synch account</h3>
            <p className="text-[11px] text-zinc-400">
              Personalize your workspace, preserve your preferences, track live diagnostics audits, and register credentials claims through G-Suite & GitHub single sign-on.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1 font-sans">
            <button
              onClick={() => initiateSso("google")}
              className="bg-white hover:bg-neutral-100 text-neutral-900 py-2.5 px-3 rounded font-bold cursor-pointer flex items-center justify-center gap-2.5 transition-all outline-none text-xs border border-neutral-300 shadow shadow-white/5 active:scale-98"
            >
              {/* Google stylized G icon */}
              <svg className="w-4 h-4 text-red-500 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.147 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.706 0 3.24.685 4.35 1.79l3.111-3.112A11.91 11.91 0 0012.24 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c5.657 0 10.62-3.52 11.76-8.715V10.28H12.24z" />
              </svg>
              <span>Sign in with Google Account</span>
            </button>

            <button
              onClick={() => initiateSso("github")}
              className="bg-[#24292e] hover:bg-[#2f363d] text-white py-2.5 px-3 rounded font-bold cursor-pointer flex items-center justify-center gap-2.5 transition-all outline-none text-xs border border-zinc-805 shadow shadow-blackactive:scale-98"
            >
              <Github className="w-4 h-4 text-white shrink-0" />
              <span>Authenticate with GitHub Profile</span>
            </button>
          </div>

          <div className="bg-zinc-900/10 border border-zinc-800 p-2.5 rounded text-[10.5px] text-zinc-500 text-center leading-normal">
            Safe OAuth consent: No password handles or writing key scopes requested. Session profiles remain isolated inside your personal container secure storage block.
          </div>
        </div>
      )}

      {/* ================= SSO POPUP CONSENT DIALOG SIMULATOR ================= */}
      {ssoProvider && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none animate-fadeIn">
          <div className="bg-[#1e1e1e] border-2 border-zinc-800 rounded-lg p-5 w-full max-w-sm flex flex-col gap-4 shadow-2xl relative select-none">
            {/* Header / Brand */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              {ssoProvider === "google" ? (
                <>
                  <svg className="w-5 h-5 text-red-500 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.147 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.706 0 3.24.685 4.35 1.79l3.111-3.112A11.91 11.91 0 0012.24 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c5.657 0 10.62-3.52 11.76-8.715V10.28H12.24z" />
                  </svg>
                  <span className="font-bold text-white text-[13px]">Google Single Sign-On Account API</span>
                </>
              ) : (
                <>
                  <Github className="w-5 h-5 text-white shrink-0" />
                  <span className="font-bold text-white text-[13px]">GitHub App Authorization Consent</span>
                </>
              )}
            </div>

            {isSsoHandshake ? (
              /* HANDSHAKE LOADING LOADER */
              <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#7A2A2A] rounded-full animate-spin" />
                <div className="space-y-1">
                  <span className="text-white font-bold block text-xs">Exchanging OAuth Handshake Claims...</span>
                  <span className="text-zinc-500 font-mono text-[10px] block">Retrieving G-Suite attributes... JWT token Synch</span>
                </div>
              </div>
            ) : (
              /* CHOOSE PROFILE PARAMETERS BEFORE HANDSHAKE */
              <div className="flex flex-col gap-3">
                <span className="text-zinc-400 leading-normal text-[11px] block">
                  Verify the Developer profile attributes to import into your 5080 local sandbox terminal:
                </span>

                {/* Simulated inputs */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400 font-bold text-[10px] uppercase">Account Handle Name</label>
                    <input
                      type="text"
                      className="bg-[#2a2a2b] border border-zinc-700 text-white px-2 py-1 text-xs outline-none rounded"
                      value={ssoName}
                      onChange={(e) => setSsoName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400 font-bold text-[10px] uppercase">E-Mail Identity</label>
                    <input
                      type="email"
                      className="bg-[#2a2a2b] border border-zinc-700 text-white px-2 py-1 text-xs outline-none rounded font-mono"
                      value={ssoEmail}
                      onChange={(e) => setSsoEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400 font-bold text-[10px] uppercase">Assigned IDE Role Label</label>
                    <select
                      className="bg-[#2a2a2b] border border-zinc-700 text-white px-2 py-1 text-xs outline-none rounded"
                      value={ssoRole}
                      onChange={(e) => setSsoRole(e.target.value)}
                    >
                      <option value="Senior Software Architect">Senior Software Architect</option>
                      <option value="Lead AI Engineer">Lead AI Engineer</option>
                      <option value="Full-Stack Developer">Full-Stack Developer</option>
                      <option value="Systems Operator">Systems Operator</option>
                      <option value="Product Designer">Product Designer</option>
                      <option value="Senior Developer Craftsman">Senior Developer Craftsman</option>
                    </select>
                  </div>
                </div>

                {/* Consent claims bullet list */}
                <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded text-[10px] text-zinc-500 space-y-1 select-none leading-relaxed">
                  <div className="flex items-start gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Import custom email claims, verified avatar matching email seed.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Synchronize local key-value layout arrangements and diagnostics XP state logs.</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={cancelSso}
                    className="p-1.5 px-3 text-[10.5px] font-semibold bg-zinc-850 hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
                  >
                    Deny
                  </button>
                  <button
                    onClick={executeSsoHandshake}
                    className="p-1.5 px-4.5 text-[10.5px] font-bold bg-[#7A2A2A] hover:bg-[#632020] text-white rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 fill-white/10" />
                    <span>Agree & Authorized</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
