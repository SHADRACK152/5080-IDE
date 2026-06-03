# ⚡ 5080 IDE — The Next-Generation AI Developer Workspace

<div align="center">

<img src="./assets/banner.png" alt="5080 IDE Banner" width="100%"/>

<br/>

### **A High-Performance, AI-Powered Development Environment Inspired by VS Code**

**Built with Monaco • Electron • React • TypeScript • Gemini AI**

<p align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite\&logoColor=white)](https://vite.dev/)
[![Electron](https://img.shields.io/badge/Electron-36-47848F?logo=electron\&logoColor=white)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Monaco](https://img.shields.io/badge/Monaco-Editor-007ACC?logo=visualstudiocode\&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![Gemini](https://img.shields.io/badge/Goldman-AI%20Copilot-8E75B7)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-success)](#license)

</p>

<p align="center">

🚀 **Monaco Code Editor** • 🤖 **Goldman AI Copilot** • 🖥️ **Electron Desktop App** • 📦 **Project Scaffolding** • 🌙 **Advanced Themes** • ⚡ **Integrated Terminal**

</p>

</div>

---

# ✨ Overview

**5080 IDE** is a modern, premium, high-performance developer environment inspired by the familiarity of **VS Code**, but redesigned with a futuristic experience, powerful customization, AI integration, and native desktop performance.

Built using **React + Vite + Electron + Monaco Editor**, 5080 IDE delivers a smooth development experience with:

* ⚡ **Lightning-fast Monaco editor**
* 🤖 **Goldman AI coding assistant**
* 🗂️ **Workspace & file management**
* 🖥️ **Integrated terminal execution**
* 🔍 **Workspace-wide search**
* 🌍 **Git repository management**
* 🎨 **Premium theme engine**
* 📦 **Project scaffolding**
* 🚀 **Cross-platform desktop packaging**

Whether you're building **web apps, desktop apps, APIs, or AI systems**, 5080 IDE gives developers a beautiful and productive coding experience.

---

# 🖼️ Preview

## Welcome Experience

<p align="center">
<img src="./docs/screenshots/welcome-screen.png" width="90%">
</p>

> Beautiful onboarding experience with **workspace history**, **quick actions**, and **AI tips**.

---

## Editor Workspace

<p align="center">
<img src="./docs/screenshots/editor-workspace.png" width="90%">
</p>

> Monaco-powered editor with tabs, syntax highlighting, themes, and lightning-fast editing.

---

## Goldman AI Assistant

<p align="center">
<img src="./docs/screenshots/ai-panel.png" width="90%">
</p>

> Built-in AI copilot for explanations, debugging, refactoring, and test generation.

---

## Terminal & Git Integration

<p align="center">
<img src="./docs/screenshots/terminal.png" width="90%">
</p>

> Run shell commands directly and inspect Git changes without leaving the IDE.

---

# 🌟 Features

## 🧠 Goldman AI Copilot

Built-in AI coding assistant.

### Capabilities

✅ Explain code
✅ Refactor functions
✅ Debug errors
✅ Generate tests
✅ Suggest improvements
✅ Offline fallback mode when API key is unavailable

```ts
// Example prompt
"Explain this React component"
"Refactor this function"
"Generate unit tests"
```

---

## ⚡ Monaco Editor

Powered by the same editor engine used by **VS Code**.

### Editor Features

* Smart syntax highlighting
* Multi-language support
* Dirty state tracking
* Auto-save support
* Fast text rendering
* Cursor tracking
* Advanced themes
* Tabs & file switching

Supported languages include:

```txt
TypeScript
JavaScript
Python
HTML
CSS
JSON
Markdown
YAML
Shell Scripts
Plain Text
```

---

## 🎨 Premium Theme Engine

5080 IDE ships with multiple stunning built-in themes.

| Theme                     | Style          |
| ------------------------- | -------------- |
| 🌑 Classic Obsidian Rouge | Premium Dark   |
| ☀️ Classic Studio Light   | Clean Light    |
| ❄️ Nordic Frost Arctic    | Elegant Cool   |
| 🦇 Dracula Eclipse        | Developer Dark |
| 🌆 Cyberpunk Neon         | Futuristic     |
| 👑 Luxury Amber Gold      | Premium Gold   |

Custom theme creation is also supported.

---

## 🗂️ Smart Workspace Management

Manage projects like a professional IDE.

### Workspace Features

* Open local folders
* Recent workspace history
* Workspace restoration
* File explorer
* Create/Delete/Rename files
* New project creation
* Git repository cloning

---

## 📦 Project Scaffolding

Quickly bootstrap projects.

Supported templates:

```txt
React
Node.js
Python
TypeScript
Starter Templates
```

Create projects in seconds.

---

## 🔍 Global Search Engine

Search text across your entire workspace instantly.

Capabilities:

* File-wide search
* Workspace search
* Fast indexing
* Match previews

---

## 🌍 Git Integration

Built-in Git awareness.

Features:

* Git status detection
* Branch monitoring
* Change tracking
* Repository cloning

---

## 🖥️ Integrated Terminal

Run commands without leaving the editor.

```bash
npm install
npm run dev
git status
python app.py
```

Supports available system shells automatically.

---

## 🔐 User Profiles

Developer profile support includes:

* Personalized settings
* Workspace persistence
* Statistics tracking
* Productivity metrics

Tracked stats:

* Files saved
* Commits
* Errors fixed
* Active coding hours
* Lines of code

---

# 🏗️ Architecture

```text
┌──────────────────────────────────────────────┐
│               Electron Shell                 │
│  Native dialogs • IPC • Menus • Windowing   │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│            React + Vite Renderer             │
│ Editor • Sidebar • AI • Terminal • Themes   │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│               Express API Server             │
│ Files • Search • Git • Terminal • AI        │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│               Local Workspace                │
│ Project files • Git • Packages • Shell      │
└──────────────────────────────────────────────┘
```

---

# 🛠️ Tech Stack

| Layer     | Technology           |
| --------- | -------------------- |
| Frontend  | React 19             |
| Language  | TypeScript           |
| Bundler   | Vite 6               |
| Desktop   | Electron 36          |
| Editor    | Monaco Editor        |
| Styling   | Tailwind CSS 4       |
| Backend   | Express.js           |
| AI        | Google Gemini        |
| Animation | Motion               |
| Icons     | Lucide React         |
| Native    | Node Addon API / C++ |

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/5080-IDE.git
cd 5080-IDE
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment

Create:

```bash
.env.local
```

Add:

```env
GEMINI_API_KEY=your_api_key_here
APP_URL=http://localhost:3000
```

---

## 4. Start Development

### Browser Mode

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

### Electron Desktop Mode

```bash
npm run build:electron
npm run electron:dev
```

---

# 📜 Scripts

| Command                  | Purpose                    |
| ------------------------ | -------------------------- |
| `npm run dev`            | Start development server   |
| `npm run build`          | Production build           |
| `npm run lint`           | Run TypeScript checks      |
| `npm run electron:dev`   | Launch Electron in dev     |
| `npm run electron:build` | Full packaged build        |
| `npm run electron:dist`  | Generate release artifacts |
| `npm run clean`          | Remove build output        |

---

# 📁 Project Structure

```txt
5080-IDE/
│
├── electron/
│   ├── main.ts
│   ├── splash.html
│   └── resources/
│
├── src/
│   ├── components/
│   ├── core_engine/
│   ├── App.tsx
│   ├── WelcomeScreen.tsx
│   └── types.ts
│
├── server.ts
├── preload.ts
├── package.json
├── vite.config.ts
└── electron-builder.yml
```

---

# 🔥 Why 5080 IDE?

### Traditional Editors

❌ Limited customization
❌ No integrated AI
❌ Basic workspace management

### 5080 IDE

✅ Premium UX
✅ Goldman AI built-in
✅ Beautiful themes
✅ Desktop + browser support
✅ Terminal + Git + Search
✅ Modern workspace experience

---

# 🧪 Roadmap

* [x] Monaco Editor
* [x] Workspace Explorer
* [x] Goldman AI
* [x] Integrated Terminal
* [x] Git Status
* [x] Theme System
* [x] Electron Packaging
* [ ] Plugin Marketplace
* [ ] Cloud Sync
* [ ] AI Pair Programming
* [ ] Real-time Collaboration
* [ ] Extension SDK

---

# 🤝 Contributing

Contributions are welcome.

### Steps

```bash
1. Fork the repository
2. Create your branch
3. Make changes
4. Commit changes
5. Push branch
6. Open Pull Request
```

---

# 🔒 Security Notice

5080 IDE has access to:

* File creation
* File deletion
* Terminal execution
* Workspace modifications

Only use trusted projects and avoid exposing the server publicly without authentication.

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### ⚡ 5080 IDE

**Build Faster. Code Smarter. Think Bigger.**

Made with ❤️ by the **5080 IDE Team**

</div>
