# Start CaseStar Production Server
# This script starts the production Next.js server

$ErrorActionPreference = "Stop"

Write-Host @"

   ╔═══════════════════════════════════════════════════════════╗
   ║                                                           ║
   ║            🌟 CaseStar Production Server 🌟              ║
   ║                                                           ║
   ╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Check if build exists
if (!(Test-Path ".next")) {
    Write-Host "⚠️  No production build found. Building now..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Kill any existing node processes on common ports
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Gray
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

# Start the server
Write-Host "🚀 Starting production server..." -ForegroundColor Green
Write-Host ""

# Set port if not already set
if (!$env:PORT) {
    $env:PORT = 3000
}

Write-Host "📡 Server will be available at: http://localhost:$env:PORT" -ForegroundColor Cyan
Write-Host "🔒 Running with production CSP (no eval)" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm start
