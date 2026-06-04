<div align="center">

<h1>⚡ 5080 IDE</h1>

<p><strong>A VS Code–inspired desktop & browser development environment<br/>built with React, Electron, Monaco Editor, Express, and a Gemini AI sidekick.</strong></p>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Electron](https://img.shields.io/badge/Electron-36-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI%20Sidekick-8E75B7?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

<br/>

> **Run it in your browser. Package it for desktop. Code with AI assistance.**  
> 5080 IDE brings a full code-editor experience to any machine — no cloud IDE subscription required.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Running the App](#-running-the-app)
- [Desktop Packaging](#-desktop-packaging)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

**5080 IDE** is a full-stack developer workspace. It is a React/Vite web application with an Express API server and an Electron desktop shell — giving you a familiar code-editor experience that is portable enough to run in a browser tab *or* as a packaged desktop application on Windows, macOS, and Linux.

The AI sidekick powered by **Google Gemini** is embedded directly into the editor, so you can ask questions, generate code, or explain functions without ever leaving your workspace.

---

## ✨ Features

| Category | What's included |
|---|---|
| **Editor** | Monaco Editor with syntax highlighting, multi-tab support, dirty-state tracking, and language auto-detection |
| **File System** | Explorer sidebar with read, write, create, delete, rename, and move operations |
| **Project Scaffolding** | Built-in template scaffolder to bootstrap new projects instantly |
| **Search** | Workspace-wide full-text search across all files |
| **Git Integration** | Real-time Git status inspection — staged, modified, untracked, and conflicted files |
| **Integrated Terminal** | Run shell commands directly from the editor via the local Express server |
| **Package Browser** | Browse and search package metadata without leaving the IDE |
| **AI Sidekick** | Gemini-powered assistant with graceful offline fallback when no API key is set |
| **Command Palette** | Keyboard-accessible command palette for quick actions |
| **Themes & Customisation** | Profile, settings, and theme management built in |
| **Desktop Shell** | Electron wrapper with native dialogs, custom window controls, and a splash screen |
| **Multi-platform** | Packages as NSIS installer or portable EXE (Windows), DMG (macOS), AppImage (Linux) |
| **Native Experiments** | C++/Node addon sources and a piece-tree fallback for future performance work |

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **UI framework** | React | 19 |
| **Build tool** | Vite | 6 |
| **Language** | TypeScript | 5.8 |
| **Styling** | Tailwind CSS 4, custom CSS | 4 |
| **Editor** | Monaco Editor (`@monaco-editor/react`) | 4.7 |
| **Icons & animation** | Lucide React, Motion | latest |
| **API server** | Express | 4 |
| **AI** | Google Gemini (`@google/genai`) | 2.4 |
| **Desktop shell** | Electron | 36 |
| **Packager** | Electron Builder | 25 |
| **Server runner** | tsx | 4 |
| **Native addons** | Node Addon API, binding.gyp | — |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Electron shell                        │
│   main process · app menu · native dialogs · preload IPC     │
└───────────────────────────────┬──────────────────────────────┘
                                │  Electron IPC (contextBridge)
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                     React + Vite renderer                    │
│  Monaco editor · sidebar · terminal · settings · AI chat     │
│  ActivityBar · CommandPalette · StatusBar · WelcomeScreen    │
└───────────────────────────────┬──────────────────────────────┘
                                │  HTTP (localhost:3000)
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                          Express API                         │
│   /api/fs   /api/git   /api/terminal   /api/gemini           │
│   /api/packages   /api/search   /api/editor                  │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                        Local workspace                       │
│            project files · package metadata · shell          │
└──────────────────────────────────────────────────────────────┘
```

In development, `npm run dev` starts Express on port **3000** and serves the Vite-built static app.  
`npm run electron:dev` starts the server *and* launches Electron once the local endpoint is ready — no manual ordering required.

---

## ✅ Prerequisites

- **[Node.js](https://nodejs.org/) ≥ 20** (npm included)
- **Git** — required for Git status features and the standard `git clone` workflow
- A **shell** available on your platform (`cmd`, `PowerShell`, `bash`, `zsh`, etc.)
- **Optional:** A [Gemini API key](https://aistudio.google.com/apikey) to enable the full AI sidekick
- **Optional:** Native build tools (`node-gyp`, MSVC on Windows / Xcode CLI on macOS) if you work on the C++/Node addon sources

---

## 🚀 Getting Started

### 1 · Clone

```bash
git clone https://github.com/SHADRACK152/5080-IDE.git
cd 5080-IDE
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Configure environment

```bash
# Copy the template
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# Required for full AI sidekick functionality
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional – public URL used for self-referential links
APP_URL="http://localhost:3000"
```

> **Tip:** The app runs perfectly without a Gemini API key — the AI sidekick will respond with helpful offline fallback messages instead.

### 4 · Start

```bash
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser. 🎉

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | No | — | Enables the Gemini AI sidekick. Without it, offline fallback responses are returned. |
| `APP_URL` | No | `http://localhost:3000` | Public or local URL for self-referential links and OAuth-style callbacks. |
| `WORKSPACE_OVERRIDE` | No | — | Override the active workspace root. Electron sets this automatically when a folder is selected via native dialog. |
| `ELECTRON_IS_DEV` | No | — | Flags Electron development mode (enables DevTools, disables packaging paths). |
| `ELECTRON_APP_ROOT` | No | — | Points the embedded server to packaged app resources when running from a built binary. |
| `DISABLE_HMR` | No | — | Disables Vite HMR and file watching. Useful in constrained or remote editing environments. |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Express API server with live-reload via `tsx` |
| `npm run build` | Build the Vite renderer **and** the Electron/server bundles |
| `npm run build:electron` | Compile Electron TypeScript, bundle `server.ts` + `preload.ts`, copy assets |
| `npm run build:preload` | Compile only the Electron TypeScript configuration |
| `npm run electron:dev` | Start the local server and launch Electron (waits for the server via `wait-on`) |
| `npm run electron:build` | Full build + package with Electron Builder (all platforms) |
| `npm run electron:dist` | Full build + create Windows distribution artifacts |
| `npm run dist:win` | Windows x64 build (NSIS installer + portable) |
| `npm run dist:win:portable` | Windows portable build only |
| `npm run dist:win:installer` | Windows NSIS installer only |
| `npm run generate-icons` | Convert PNG icons to ICO format for Windows packaging |
| `npm run start` | Run the pre-built server entry point |
| `npm run clean` | Remove all generated build and release output (`dist/`, `dist-electron/`, `release/`) |
| `npm run lint` | Run `tsc --noEmit` to type-check without emitting files |

---

## ▶️ Running the App

### Browser / local server

```bash
npm run dev
```

Best for working on the React UI or Express API. Hot Module Replacement is active by default.

### Electron development mode

```bash
# Step 1 – compile Electron TypeScript
npm run build:electron

# Step 2 – start server + launch Electron (waits automatically)
npm run electron:dev
```

`electron:dev` uses `wait-on` to hold until `http://127.0.0.1:3000` responds, then launches Electron — no race conditions.

### Production build

```bash
npm run build
```

Outputs:

| Directory | Contents |
|---|---|
| `dist/` | Vite renderer bundle (HTML, JS, CSS, assets) |
| `dist-electron/` | Electron main process, preload bridge, bundled server, and copied assets |

---

## 📦 Desktop Packaging

> Build on the **target platform** — Windows artifacts must be built on Windows, macOS on macOS, and Linux on Linux (unless your CI is configured for cross-platform builds).

```bash
# Package for all configured targets
npm run electron:build

# Windows x64 only (NSIS installer + portable)
npm run dist:win

# Windows NSIS installer only
npm run dist:win:installer

# Windows portable EXE only
npm run dist:win:portable
```

All release artifacts are written to `release/`.

**Electron Builder targets:**

| Platform | Format |
|---|---|
| Windows | NSIS installer, Portable EXE |
| macOS | DMG (x64 + arm64) |
| Linux | AppImage (x64) |

---

## 📁 Project Structure

```
5080-IDE/
├── electron/
│   ├── main.ts                  # App bootstrap, native menu, IPC handlers, server launch
│   ├── splash.html              # Splash screen shown during desktop startup
│   ├── icon.png                 # App icon (source)
│   └── resources/               # Platform-specific icons for Electron Builder
│
├── scripts/
│   ├── copy-assets.js           # Copies assets into dist-electron after build
│   └── png-to-ico.js            # Converts PNG icons to ICO format
│
├── src/
│   ├── components/
│   │   ├── ActivityBar.tsx      # Left activity bar (file explorer, search, git, extensions)
│   │   ├── BottomPanel.tsx      # Terminal, output, and problem panels
│   │   ├── CommandPalette.tsx   # Keyboard-accessible command palette
│   │   ├── EditorArea.tsx       # Monaco editor, tabs, and diff view
│   │   ├── ExtensionsTab.tsx    # Extension / plugin browser tab
│   │   ├── NewProjectModal.tsx  # New project scaffolding modal
│   │   ├── PackagesTab.tsx      # Package browse and search tab
│   │   ├── ProfileTab.tsx       # User profile and settings tab
│   │   ├── Sidebar.tsx          # File explorer, search results, Git status panel
│   │   ├── StatusBar.tsx        # Bottom status bar (language, line, col, Git branch)
│   │   ├── TitleBar.tsx         # Custom window title bar and menu
│   │   └── WelcomeScreen.tsx    # Welcome / start page shown on launch
│   │
│   ├── core_engine/             # Piece-tree text buffer & C++/Node addon sources
│   ├── core_engine.d.ts         # TypeScript declarations for the native addon
│   ├── App.tsx                  # Root application state and layout orchestration
│   ├── index.css                # Global styles and Tailwind imports
│   ├── main.tsx                 # React DOM entry point
│   └── types.ts                 # Shared frontend TypeScript types
│
├── .env.example                 # Environment variable template
├── .gitignore
├── binding.gyp.electron         # Native Node addon build configuration
├── electron-builder.yml         # Desktop packaging configuration
├── index.html                   # HTML entry point for Vite
├── LICENSE                      # MIT License
├── package.json
├── preload.ts                   # Electron preload IPC bridge (contextBridge)
├── server.ts                    # Express API server (all /api/* routes)
├── tsconfig.json                # Renderer TypeScript configuration
├── tsconfig.electron.json       # Electron main/preload TypeScript configuration
└── vite.config.ts               # Vite build and dev server configuration
```

---

## 📡 API Reference

All endpoints are served by the local Express server at `http://localhost:3000`.

### App & Workspace

| Endpoint | Method | Description |
|---|---|---|
| `/api/app/info` | `GET` | App version, workspace root, and runtime metadata |
| `/api/workspace/set` | `POST` | Set or reset the active workspace root path |

### File System

| Endpoint | Method | Description |
|---|---|---|
| `/api/fs/tree` | `GET` | Return a recursive file/directory tree of the workspace |
| `/api/fs/read` | `POST` | Read the text content of a file |
| `/api/fs/write` | `POST` | Write text or base64-encoded content to a file |
| `/api/fs/create` | `POST` | Create a new file or directory |
| `/api/fs/scaffold` | `POST` | Scaffold a starter project from a built-in template |
| `/api/fs/delete` | `POST` | Delete a file or directory |
| `/api/fs/rename` | `POST` | Rename or move a workspace item |

### Search & Git

| Endpoint | Method | Description |
|---|---|---|
| `/api/search` | `POST` | Full-text search across all workspace files |
| `/api/git/status` | `POST` | Git status for the workspace (staged, modified, untracked) |

### Terminal

| Endpoint | Method | Description |
|---|---|---|
| `/api/terminal/shells` | `GET` | List shells available on the host system |
| `/api/terminal/run` | `POST` | Execute a shell command and return stdout/stderr |

### Packages

| Endpoint | Method | Description |
|---|---|---|
| `/api/packages/list` | `GET` | List all available package metadata |
| `/api/packages/search` | `GET` | Search package metadata by keyword |

### AI Sidekick

| Endpoint | Method | Description |
|---|---|---|
| `/api/gemini/chat` | `POST` | Send a prompt to the Gemini sidekick; returns an offline fallback if no key is set |

### Editor Core

| Endpoint | Method | Description |
|---|---|---|
| `/api/editor/init` | `POST` | Initialise the server-side piece-tree text buffer |
| `/api/editor/pushEvent` | `POST` | Push an edit operation into the server-side buffer |
| `/api/editor/getText` | `GET` | Read the current text from the server-side buffer |

---

## 🐛 Troubleshooting

**`GEMINI_API_KEY` not set**  
The app still starts. The AI sidekick returns offline fallback text. Add the key to `.env.local` and restart the server to enable full Gemini behaviour.

**Port 3000 already in use**  
Stop the conflicting process (`netstat -ano | findstr :3000` on Windows) or change the port in `server.ts` and `vite.config.ts` before starting.

**Electron opens before the server is ready**  
Always use `npm run electron:dev` — it uses `wait-on` to block Electron launch until `http://127.0.0.1:3000` responds. Never run `electron` directly in development.

**Desktop packaging fails**  
Build on the target platform. Windows artifacts must be built on Windows, macOS on macOS. Ensure `electron-builder` is installed (`npm install`) and that you have run `npm run build` first.

**Native addon build errors**  
Make sure `node-gyp` is installed globally and that platform-specific native tooling is present:
- **Windows:** [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) or Visual Studio Build Tools
- **macOS:** `xcode-select --install`
- **Linux:** `build-essential` and `python3`

**TypeScript errors from `tsc --noEmit`**  
Run `npm run lint` to see type errors. Most are surfaced in `src/` and `electron/`. Fix reported errors before building.

---

## 🔐 Security

5080 IDE is designed for **local development use only**.

The Express API server can:
- Read, write, delete, and rename files inside the configured workspace
- Execute arbitrary shell commands on the host machine
- Proxy prompts to the Gemini API using your key

**Do not expose the server port to untrusted networks** without adding authentication, input validation, workspace-path sandboxing, and appropriate command restrictions for your deployment environment.

---

## 🤝 Contributing

Contributions are welcome! Here is how to get involved:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** — keep them focused, well-scoped, and documented.

3. **Type-check** before committing:
   ```bash
   npm run lint
   ```

4. **Test your changes** in both browser (`npm run dev`) and Electron (`npm run electron:dev`) modes if applicable.

5. **Commit** with a clear, conventional message:
   ```
   feat: add workspace-wide symbol search
   fix: resolve terminal output encoding on Windows
   docs: update API reference for /api/fs/scaffold
   ```

6. **Open a Pull Request** with:
   - A description of *why* the change is needed
   - What you changed and how it works
   - Steps to validate the change

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for the full text.

---

<div align="center">

Made with ❤️ by the 5080 IDE contributors

⭐ **Star this repo if you find it useful!**

</div>