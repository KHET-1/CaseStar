# CaseStar Launcher
Write-Host "Starting CaseStar..."
$p1 = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload --port 8000" -PassThru
$p2 = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
