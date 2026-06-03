import express from "express";
import path from "path";
import fs from "fs";
import { exec, spawn, execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow Electron renderer to call localhost APIs (CORS)
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "50mb" }));

// ── 5080 High-Performance PieceTree Core Fallback Simulator ────
import { EditorCoreFallback } from "./src/core_engine/piece_tree_fallback.js";

let editorCoreInstance: any = null;

// Expose browser proxy endpoints to route keystrokes into the active Core Instance
app.post("/api/editor/init", (req, res) => {
  const { content } = req.body;
  if (editorCoreInstance) {
    editorCoreInstance.init(content || "");
  }
  res.json({ success: true });
});

app.post("/api/editor/pushEvent", (req, res) => {
  if (editorCoreInstance) {
    const success = editorCoreInstance.pushEvent(req.body);
    return res.json({ success });
  }
  res.json({ success: false });
});

app.get("/api/editor/getText", (req, res) => {
  if (editorCoreInstance) {
    const text = editorCoreInstance.getText();
    return res.json({ text });
  }
  res.json({ text: "" });
});



// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini Client initialized successfully on server-side.");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI copilot will fall back to friendly developer stubs.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client:", error);
}

// Ensure paths are handled relative to workspace root
// WORKSPACE_OVERRIDE is set by Electron main process when user picks a folder
let WORKSPACE_ROOT = process.env.WORKSPACE_OVERRIDE
  ? path.resolve(process.env.WORKSPACE_OVERRIDE)
  : path.resolve(process.cwd());

// ── POST /api/workspace/set ───────────────────────────────────────────────
// Allows Electron to change the active workspace at runtime (folder picker)
app.post("/api/workspace/set", (req, res) => {
  try {
    const { workspacePath } = req.body;
    if (!workspacePath) {
      WORKSPACE_ROOT = path.resolve(process.cwd());
      delete process.env.WORKSPACE_OVERRIDE;
      console.log(`[5080] Workspace root reset to process.cwd(): ${WORKSPACE_ROOT}`);
      return res.json({ success: true, workspace: WORKSPACE_ROOT });
    }
    const resolved = path.resolve(workspacePath);
    if (!fs.existsSync(resolved)) return res.status(404).json({ error: "Path does not exist" });
    WORKSPACE_ROOT = resolved;
    process.env.WORKSPACE_OVERRIDE = resolved;
    console.log(`[5080] Workspace root updated: ${WORKSPACE_ROOT}`);
    res.json({ success: true, workspace: WORKSPACE_ROOT });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to resolve paths safely
function resolvePath(safePath: string): string {
  if (!safePath) return WORKSPACE_ROOT;
  const resolved = path.isAbsolute(safePath) ? safePath : path.resolve(WORKSPACE_ROOT, safePath);
  return resolved;
}

// ── GET /api/fs/tree ──────────────────────────────────────────────────
// Returns immediate files and directories inside a path
app.get("/api/fs/tree", (req, res) => {
  try {
    const targetDir = resolvePath(req.query.path as string || "");
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: "Directory does not exist" });
    }

    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Path is not a directory" });
    }

    const buildTree = (dir: string): any[] => {
      try {
        const items = fs.readdirSync(dir);
        const nodes = items
          .filter(item => {
            return item !== "node_modules" && item !== ".git" && item !== "dist" && item !== ".DS_Store";
          })
          .map(name => {
            const fullPath = path.join(dir, name);
            const itemStat = fs.statSync(fullPath);
            const relativePath = path.relative(WORKSPACE_ROOT, fullPath);
            const isDirectory = itemStat.isDirectory();

            return {
              name,
              path: fullPath,
              relativePath: relativePath || name,
              type: isDirectory ? "directory" : "file",
              size: itemStat.size,
              modified: itemStat.mtimeMs,
              extension: isDirectory ? "" : path.extname(name),
              children: isDirectory ? buildTree(fullPath) : undefined
            };
          });

        nodes.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "directory" ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

        return nodes;
      } catch {
        return [];
      }
    };

    const tree = buildTree(targetDir);
    res.json({ path: targetDir, children: tree });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/fs/read ─────────────────────────────────────────────────
app.post("/api/fs/read", (req, res) => {
  try {
    const { filePath } = req.body;
    const resolved = resolvePath(filePath);

    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: `File not found: ${filePath}` });
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: "Path is a directory, not a file" });
    }

    // Limit reading file to typical text size
    if (stat.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "File exceeds 10MB limit. Visualizing binaries is unsupported." });
    }

    const content = fs.readFileSync(resolved, "utf8");
    res.json({ filePath: resolved, content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/fs/write ────────────────────────────────────────────────
app.post("/api/fs/write", (req, res) => {
  try {
    const { filePath, content, encoding } = req.body;
    const resolved = resolvePath(filePath);

    // Create directory path if it doesn't exist
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (encoding === "base64") {
      fs.writeFileSync(resolved, Buffer.from(content, "base64"));
    } else {
      fs.writeFileSync(resolved, content || "", "utf8");
    }
    res.json({ success: true, filePath: resolved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/fs/create ────────────────────────────────────────────────
app.post("/api/fs/create", (req, res) => {
  try {
    const { type, name, parentPath } = req.body;
    const parentResolved = resolvePath(parentPath || "");
    const targetPath = path.join(parentResolved, name);

    if (fs.existsSync(targetPath)) {
      return res.status(400).json({ error: "Item with this name already exists" });
    }

    if (type === "directory") {
      fs.mkdirSync(targetPath, { recursive: true });
    } else {
      // Ensure parent directory exists
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(targetPath, "", "utf8");
    }

    const relativePath = path.relative(WORKSPACE_ROOT, targetPath);
    res.json({
      success: true,
      name,
      path: targetPath,
      relativePath,
      type,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/fs/scaffold ─────────────────────────────────────────────
app.post("/api/fs/scaffold", (req, res) => {
  try {
    const { template, name, parentPath } = req.body;
    const parentResolved = resolvePath(parentPath || "");
    const targetDir = path.join(parentResolved, name || "new-project");

    if (fs.existsSync(targetDir)) {
      return res.status(400).json({ error: "Directory already exists" });
    }

    fs.mkdirSync(targetDir, { recursive: true });

    if (template === "react-vite") {
      fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify({
        name,
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          vite: "^5.0.0"
        }
      }, null, 2), "utf8");

      const srcDir = path.join(targetDir, "src");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "main.tsx"), `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.tsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)\n`, "utf8");
      fs.writeFileSync(path.join(srcDir, "App.tsx"), `import React from 'react'\n\nexport default function App() {\n  return (\n    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>\n      <h1>Welcome to ${name}!</h1>\n      <p>Bootstrapped via 5080 IDE Suite Project Template.</p>\n    </div>\n  )\n}\n`, "utf8");
      fs.writeFileSync(path.join(srcDir, "index.css"), `body { margin: 0; background: #121212; color: #fff; }\n`, "utf8");
      fs.writeFileSync(path.join(targetDir, "index.html"), `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${name}</title>\n  </head>\n  <body class="bg-zinc-950 text-white">\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`, "utf8");
      fs.writeFileSync(path.join(targetDir, "vite.config.ts"), `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n`, "utf8");
    } else if (template === "node-express") {
      fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify({
        name,
        version: "1.0.0",
        type: "commonjs",
        main: "server.js",
        scripts: {
          start: "node server.js"
        },
        dependencies: {
          express: "^4.18.2"
        }
      }, null, 2), "utf8");
      fs.writeFileSync(path.join(targetDir, "server.js"), `const express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 4000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: "Hello from ${name} API!" });\n});\n\napp.listen(PORT, () => {\n  console.log('Server running on port ' + PORT);\n});\n`, "utf8");
    } else if (template === "python-project") {
      const testsDir = path.join(targetDir, "tests");
      fs.mkdirSync(testsDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, "main.py"), `def main():\n    print("Hello from ${name} Python Application!")\n\nif __name__ == "__main__":\n    main()\n`, "utf8");
      fs.writeFileSync(path.join(targetDir, "requirements.txt"), `requests>=2.28.0\n`, "utf8");
      fs.writeFileSync(path.join(testsDir, "test_main.py"), `def test_simple():\n    assert True\n`, "utf8");
    } else {
      // Clean Workspace Template
      fs.writeFileSync(path.join(targetDir, "README.md"), `# ${name}\n\nThis is a clean workspace compiled on your local computer via 5080 IDE.\n`, "utf8");
    }

    res.json({ success: true, path: targetDir, relativePath: path.relative(WORKSPACE_ROOT, targetDir) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/fs/delete ────────────────────────────────────────────────
app.post("/api/fs/delete", (req, res) => {
  try {
    const { path: targetPath } = req.body;
    const resolved = resolvePath(targetPath);

    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: "Item not found" });
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      fs.rmSync(resolved, { recursive: true, force: true });
    } else {
      fs.unlinkSync(resolved);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/fs/rename ────────────────────────────────────────────────
app.post("/api/fs/rename", (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    const resolvedOld = resolvePath(oldPath);
    const parentDir = path.dirname(resolvedOld);
    const resolvedNew = path.join(parentDir, newName);

    if (!fs.existsSync(resolvedOld)) {
      return res.status(404).json({ error: "Original file not found" });
    }

    if (fs.existsSync(resolvedNew)) {
      return res.status(400).json({ error: "An item with the new name already exists" });
    }

    fs.renameSync(resolvedOld, resolvedNew);
    res.json({ success: true, newPath: resolvedNew, relativePath: path.relative(WORKSPACE_ROOT, resolvedNew) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/search ──────────────────────────────────────────────────
// Fuzzy / text search inside all files recursively, grouping by files
app.post("/api/search", (req, res) => {
  try {
    const { query, caseSensitive, wholeWord, regex } = req.body;
    if (!query) {
      return res.json({ results: [] });
    }

    const results: any[] = [];
    const searchRegex = (() => {
      let flags = caseSensitive ? "" : "i";
      let pattern = query;
      if (!regex) {
        // Escape special chars
        pattern = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      return new RegExp(pattern, flags);
    })();

    // Helper to scan directory files recursively
    function scanDirectory(dir: string) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item === "node_modules" || item === ".git" || item === "dist" || item === ".DS_Store") {
          continue;
        }

        const fullPath = path.join(dir, item);
        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          continue;
        }

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          // Verify file size to avoid search delays on huge files
          if (stat.size > 2 * 1024 * 1024) continue;

          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            const matches: any[] = [];

            lines.forEach((lineText, index) => {
              if (searchRegex.test(lineText)) {
                matches.push({
                  lineNumber: index + 1,
                  text: lineText.trim(),
                });
              }
            });

            if (matches.length > 0) {
              results.push({
                filePath: fullPath,
                relativePath: path.relative(WORKSPACE_ROOT, fullPath),
                matches,
              });
            }
          } catch {
            // Unreadable or binary file
            continue;
          }
        }
      }
    }

    scanDirectory(WORKSPACE_ROOT);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/git/status ──────────────────────────────────────────────
app.post("/api/git/status", (req, res) => {
  exec("git status --porcelain && git branch --show-current", { cwd: WORKSPACE_ROOT }, (error, stdout) => {
    try {
      if (error && error.code !== 0) {
        // Graceful fallback if git is not initialized
        return res.json({
          initialized: false,
          branch: "main",
          changes: [],
        });
      }

      const lines = stdout.trim().split("\n");
      // Find branch (last line is usually empty or branch if specified)
      exec("git branch --show-current", { cwd: WORKSPACE_ROOT }, (err, branchStdout) => {
        const branch = branchStdout.trim() || "main";
        const changes = lines
          .filter(line => line.length > 2)
          .map(line => {
            const status = line.slice(0, 2).trim();
            const filePath = line.slice(3).trim();
            return {
              status, // "M", "A", "D", "??", etc.
              path: path.join(WORKSPACE_ROOT, filePath),
              relativePath: filePath,
            };
          });

        res.json({
          initialized: true,
          branch,
          changes,
        });
      });
    } catch {
      res.json({ initialized: false, branch: "main", changes: [] });
    }
  });
});

// ── GET /api/terminal/shells ──────────────────────────────────────────
// Detects and lists all available shell prompts on the host system
function getInstalledShells() {
  const shells = [
    { name: "Command Prompt", path: "cmd.exe" },
    { name: "Windows PowerShell", path: "powershell.exe" }
  ];

  if (process.platform === "win32") {
    // Git Bash search
    const gitBashPaths = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files\\Git\\git-bash.exe",
      path.join(process.env.LocalAppData || "", "Programs\\Git\\bin\\bash.exe")
    ];
    for (const p of gitBashPaths) {
      if (fs.existsSync(p)) {
        shells.push({ name: "Git Bash", path: p });
        break;
      }
    }

    // PowerShell Core search
    const pwshPaths = [
      "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      "C:\\Program Files\\PowerShell\\6\\pwsh.exe"
    ];
    for (const p of pwshPaths) {
      if (fs.existsSync(p)) {
        shells.push({ name: "PowerShell Core", path: p });
        break;
      }
    }

    // WSL check (stub or active)
    if (fs.existsSync("C:\\Windows\\System32\\wsl.exe")) {
      shells.push({ name: "WSL (Linux)", path: "C:\\Windows\\System32\\wsl.exe" });
    }
  } else {
    // Unix fallback
    const unixShells = [
      { name: "Bash", path: "/bin/bash" },
      { name: "Zsh", path: "/bin/zsh" },
      { name: "Sh", path: "/bin/sh" }
    ];
    for (const s of unixShells) {
      if (fs.existsSync(s.path)) {
        shells.push(s);
      }
    }
  }

  return shells;
}

app.get("/api/terminal/shells", (req, res) => {
  try {
    const shells = getInstalledShells();
    res.json({ shells });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/terminal/run ────────────────────────────────────────────
// Executes a command and streams outcomes using standard Transfer-Encoding: chunked!
app.post("/api/terminal/run", (req, res) => {
  const { command, cwd, shell } = req.body;
  if (!command) {
    return res.status(400).json({ error: "Command string is required" });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  const targetCwd = cwd ? resolvePath(cwd) : WORKSPACE_ROOT;

  let child;
  try {
    // If shell is wsl.exe, run wsl.exe -- bash -c "command" instead of setting it in the shell options directly
    if (shell && (shell.toLowerCase().endsWith("wsl.exe") || shell.toLowerCase() === "wsl")) {
      child = spawn("wsl.exe", ["--", "bash", "-c", command], {
        cwd: targetCwd,
        env: { ...process.env, FORCE_COLOR: "1" }
      });
    } else {
      child = spawn(command, [], {
        cwd: targetCwd,
        shell: shell || true,
        env: { ...process.env, FORCE_COLOR: "1" }, // request colors in output
      });
    }

    child.stdout.on("data", (data) => {
      res.write(data);
    });

    child.stderr.on("data", (data) => {
      res.write(data);
    });

    child.on("close", (code) => {
      res.write(`\r\n\x1b[1;34mProcess completed with exit code ${code}\x1b[0m\r\n`);
      res.end();
    });

    child.on("error", (err) => {
      res.write(`\r\n\x1b[1;31mProcess error: ${err.message}\x1b[0m\r\n`);
      res.end();
    });
  } catch (err: any) {
    res.write(`\r\n\x1b[1;31mSpawning error: ${err.message}\x1b[0m\r\n`);
    res.end();
  }
});

// ── GET /api/packages/list ─────────────────────────────────────────────
// Returns installed NPM packages (from package.json) and Python packages (from pip list / requirements.txt)
app.get("/api/packages/list", async (req, res) => {
  try {
    const response: { npm: any[]; python: any[] } = { npm: [], python: [] };

    // 1. Read NPM modules
    const packageJsonPath = path.join(WORKSPACE_ROOT, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        if (pkg.dependencies) {
          for (const [name, version] of Object.entries(pkg.dependencies)) {
            response.npm.push({ name, version, dev: false });
          }
        }
        if (pkg.devDependencies) {
          for (const [name, version] of Object.entries(pkg.devDependencies)) {
            response.npm.push({ name, version, dev: true });
          }
        }
      } catch (err) {
        console.warn("Failed to parse package.json for list:", err);
      }
    }

    // 2. Read Python modules
    let pipSuccess = false;
    try {
      const pipOutput = execSync("pip list --format=json", {
        cwd: WORKSPACE_ROOT,
        timeout: 5000,
        encoding: "utf8",
        env: { ...process.env }
      });
      const parsed = JSON.parse(pipOutput);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          response.python.push({ name: item.name, version: item.version });
        });
        pipSuccess = true;
      }
    } catch (err) {
      try {
        const pipOutput2 = execSync("python -m pip list --format=json", {
          cwd: WORKSPACE_ROOT,
          timeout: 5000,
          encoding: "utf8",
          env: { ...process.env }
        });
        const parsed2 = JSON.parse(pipOutput2);
        if (Array.isArray(parsed2)) {
          parsed2.forEach((item: any) => {
            response.python.push({ name: item.name, version: item.version });
          });
          pipSuccess = true;
        }
      } catch (err2) {
        console.warn("pip list command failed, falling back to requirements.txt scanning");
      }
    }

    // Fallback: Scan requirements.txt if pip command failed
    if (!pipSuccess) {
      const requirementsPath = path.join(WORKSPACE_ROOT, "requirements.txt");
      if (fs.existsSync(requirementsPath)) {
        try {
          const content = fs.readFileSync(requirementsPath, "utf8");
          const lines = content.split("\n");
          lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine && !cleanLine.startsWith("#")) {
              const match = cleanLine.match(/^([a-zA-Z0-9_\-]+)(?:[>=<~!]+(.*))?$/);
              if (match) {
                response.python.push({
                  name: match[1],
                  version: match[2] || "installed"
                });
              }
            }
          });
        } catch (err) {
          console.warn("Failed to read requirements.txt:", err);
        }
      }
    }

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/packages/search ───────────────────────────────────────────
// Searches NPM packages from NPM registry or PyPI packages from PyPI
app.get("/api/packages/search", async (req, res) => {
  const { type, query } = req.query;
  if (!query || typeof query !== "string") {
    return res.json({ results: [] });
  }

  try {
    if (type === "npm") {
      const searchUrl = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=12`;
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`NPM registry returned status ${response.status}`);
      }
      const data = await response.json();
      const results = (data.objects || []).map((obj: any) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description || "",
        author: obj.package.publisher?.username || obj.package.author?.name || "unknown",
        date: obj.package.date || ""
      }));
      return res.json({ results });
    } else if (type === "python") {
      const searchUrl = `https://pypi.org/search/?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`PyPI search returned status ${response.status}`);
      }
      const html = await response.text();
      
      const results: any[] = [];
      const packageRegex = /<a class="package-snippet"[\s\S]*?<span class="package-snippet__name">([\s\S]*?)<\/span>[\s\S]*?<span class="package-snippet__version">([\s\S]*?)<\/span>[\s\S]*?<p class="package-snippet__description">([\s\S]*?)<\/p>/gi;
      
      let match;
      let count = 0;
      while ((match = packageRegex.exec(html)) !== null && count < 10) {
        results.push({
          name: match[1].trim(),
          version: match[2].trim(),
          description: match[3].trim().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"'),
          author: "PyPI",
          date: ""
        });
        count++;
      }

      if (results.length === 0) {
        try {
          const exactResponse = await fetch(`https://pypi.org/pypi/${encodeURIComponent(query)}/json`);
          if (exactResponse.ok) {
            const data = await exactResponse.json();
            results.push({
              name: data.info.name,
              version: data.info.version,
              description: data.info.summary || "",
              author: data.info.author || "PyPI",
              date: ""
            });
          }
        } catch {}
      }

      return res.json({ results });
    } else {
      return res.status(400).json({ error: "Invalid type parameter. Must be npm or python." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/gemini/chat ─────────────────────────────────────────────
// Powers the AI Assistant in the sidekick bar using GoogleGenAI SDK!
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, selectedFile, selectedCode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid context payload" });
    }

    if (!ai) {
      return res.json({
        reply: "Gemini AI Sidekick is currently in offline developer-assistant mode. To activate full AI-powered codebase diagnostics and autocompletions, configure your `GEMINI_API_KEY` in the **Settings > Secrets** panel of AI Studio.",
        isOfflineStub: true,
      });
    }

    // Format chat contents for Gemini 3.5
    // Last message is the active instruction, older ones act as chat history
    const userMessage = messages[messages.length - 1]?.text || "";

    const systemInstruction = `You are "Goldman", the elite AI Coding Copilot integrated natively inside 5080 IDE.
You are extremely smart, professional, helpful, and speak concisely.
Provide excellent, production-ready, beautiful code changes or detailed explanations based on the user's files and selection.

Contextual Sandbox:
${selectedFile ? `Active File: ${selectedFile.relativePath}` : "No file open"}
${selectedCode ? `Highlighted Code Block:\n\`\`\`\n${selectedCode}\n\`\`\`` : ""}

Guidelines:
1. When asked to write code, provide full, highly styled TypeScript/Tailwind blocks that drop directly into the workspace.
2. Maintain space efficiency in answers so they fit perfectly in the narrow 5080 sidebar panel.
3. Be friendly and highly developer-focused.`;

    // Package contents
    const contents: any[] = [];
    messages.forEach((msg: any) => {
      contents.push({
        role: msg.sender === "ai" ? "assistant" : "user",
        parts: [{ text: msg.text }],
      });
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents.length > 0 ? contents : userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "No reply generated by Gemini.",
    });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: `Gemini Exception: ${err.message}` });
  }
});

// ── GET /api/app/info ─────────────────────────────────────────────────
app.get("/api/app/info", (_req, res) => {
  res.json({
    name: "5080 IDE",
    version: "1.0.0-stable",
    workspace: WORKSPACE_ROOT,
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version,
    isElectron: !!process.env.ELECTRON_IS_DEV || !!process.versions?.electron,
  });
});

// ── Server Bootstrap ─────────────────────────────────────────────────────
export async function startServer() {
  // Load 5080 High-Performance PieceTree Core Native Addon dynamically on server startup
  try {
    const addonPath = path.resolve(process.cwd(), "build/Release/addon.node");
    if (fs.existsSync(addonPath)) {
      const { createRequire } = await import("module");
      const require = createRequire(import.meta.url);
      const addon = require(addonPath);
      if (addon && addon.EditorCore) {
        editorCoreInstance = new addon.EditorCore();
        console.log("🚀 [5080 SUCCESS] Native C++ PieceTree core loaded successfully.");
      }
    }
  } catch (err) {
    console.warn("Native C++ Core load fallback: Loading high-performance PieceTree JS/TS engine.");
  }

  if (!editorCoreInstance) {
    editorCoreInstance = new EditorCoreFallback();
    console.log("ℹ️ [5080] PieceTree high-performance backup simulator active.");
  }

  // Ensure the core is initialized and worker threads are running
  try {
    editorCoreInstance.init("Welcome to 5080 IDE Core Engine!\nType anywhere to begin ultra-low latency testing.");
    editorCoreInstance.start();
  } catch (e) {
    console.error("Failed to boot 5080 core loop:", e);
  }

  // Electron IPC bridge registration (when running as desktop app)
  const isElectron = !!process.versions?.electron;
  if (isElectron) {
    try {
      // @ts-ignore
      const { ipcMain } = await import("electron");
      ipcMain.handle("editor:pushEvent", async (_event: any, payload: any) => {
        return editorCoreInstance ? editorCoreInstance.pushEvent(payload) : false;
      });
      ipcMain.handle("editor:getText", async () => {
        return editorCoreInstance ? editorCoreInstance.getText() : "";
      });
      console.log("🔒 [5080 IPC] Electron IPC bridge registered.");
    } catch {
      // not in Electron, skip
    }
  }

  // Serve the built frontend (Electron always uses production build)
  const isElectronRuntime = !!process.versions?.electron;
  
  if (!isElectronRuntime && process.env.NODE_ENV !== "production") {
    // Dev web mode: use Vite middleware with HMR
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production or Electron mode: serve built static files
    const distPath = path.join(
      process.env.ELECTRON_APP_ROOT || process.cwd(),
      "dist"
    );
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      console.warn("[5080] dist/ not found. Run `npm run build` first.");
    }
  }

  return new Promise<void>((resolve) => {
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`🚀 5080 IDE Workspace active on http://localhost:${PORT}`);
      resolve();
    });
  });
}

// Auto-start when run directly (non-Electron web mode)
const isDirectRun = !process.versions?.electron;
if (isDirectRun) {
  startServer();
}
