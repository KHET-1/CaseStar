# CaseStar Development Server Launcher
# Runs Next.js frontend (port 3000) and FastAPI backend (port 8000) concurrently

Write-Host "🌟 CaseStar God-Mode Setup - Starting Services..." -ForegroundColor Cyan

# Check if ports are available
$frontendPort = 3000
$backendPort = 8000

$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue
$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue

if ($frontendInUse) {
    Write-Host "⚠️  Port $frontendPort is already in use. Please stop the existing process." -ForegroundColor Yellow
}

if ($backendInUse) {
    Write-Host "⚠️  Port $backendPort is already in use. Please stop the existing process." -ForegroundColor Yellow
}

if ($frontendInUse -or $backendInUse) {
    exit 1
}

# Start FastAPI backend in a new window
Write-Host "🚀 Starting FastAPI backend on port $backendPort..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload --port $backendPort"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Next.js frontend in a new window
Write-Host "🚀 Starting Next.js frontend on port $frontendPort..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✅ CaseStar services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:$frontendPort" -ForegroundColor White
Write-Host "   Backend API: http://localhost:$backendPort" -ForegroundColor White
Write-Host "   API Docs: http://localhost:$backendPort/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
