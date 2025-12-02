# CaseStar Launcher
Write-Output "Starting CaseStar..."
Write-Output ""

# Start backend
Write-Output "🚀 Starting backend server..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload --port 8000" -PassThru | Out-Null

# Start frontend
Write-Output "🚀 Starting frontend server..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru | Out-Null

Write-Output ""
Write-Output "✅ Servers started!"
Write-Output "   Backend:  http://localhost:8000"
Write-Output "   Frontend: http://localhost:3000"
Write-Output ""
