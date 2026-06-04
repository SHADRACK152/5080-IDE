# ────────────────────────────────────────────────────────────────────────────
# build-win.ps1  –  One-click Windows installer builder for 5080 IDE
# Usage:  .\build-win.ps1 [-Target installer|portable|both]
# ────────────────────────────────────────────────────────────────────────────
param(
    [ValidateSet("installer","portable","both")]
    [string]$Target = "both"
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Write-Step([string]$msg) {
    Write-Host ""
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
}

Set-Location $root

# ── 1. Pre-flight checks ─────────────────────────────────────────────────────
Write-Step "Pre-flight checks"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js not found. Install from https://nodejs.org"
}
Write-Host "  Node : $(node --version)" -ForegroundColor Green

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm not found."
}
Write-Host "  npm  : $(npm --version)" -ForegroundColor Green

if (-not (Test-Path "$root\electron\resources\icon.ico")) {
    Write-Step "Generating icon.ico from icon.png"
    node scripts/png-to-ico.js
}
Write-Host "  Icon : OK" -ForegroundColor Green

# ── 2. Install dependencies ───────────────────────────────────────────────────
Write-Step "Installing dependencies"
npm ci --prefer-offline

# ── 3. Build Vite + Electron ─────────────────────────────────────────────────
Write-Step "Building Vite renderer + Electron main process"
npm run build

# ── 4. Package with electron-builder ─────────────────────────────────────────
Write-Step "Packaging Windows installer(s) — target: $Target"

switch ($Target) {
    "installer" {
        npx electron-builder --config electron-builder.yml --win nsis --x64
    }
    "portable" {
        npx electron-builder --config electron-builder.yml --win portable --x64
    }
    default {
        # both: NSIS + portable (matches default electron-builder.yml targets)
        npx electron-builder --config electron-builder.yml --win --x64
    }
}

# ── 5. Report output ─────────────────────────────────────────────────────────
Write-Step "Build complete"
Write-Host ""
Write-Host "Output files in .\release\" -ForegroundColor Yellow
Get-ChildItem "$root\release" -File | Where-Object { $_.Extension -in ".exe",".blockmap" } |
    Select-Object Name, @{N="Size (MB)";E={[math]::Round($_.Length/1MB,1)}} |
    Format-Table -AutoSize

Write-Host ""
Write-Host "Done! Installers ready for distribution." -ForegroundColor Green
