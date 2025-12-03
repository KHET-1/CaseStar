# CaseStar Launcher
Write-Host "Starting CaseStar on Custom Ports..."
$p1 = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload --port 50000" -PassThru
$p2 = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev -- -p 30000" -PassThru
Write-Host "Backend: http://localhost:50000"
Write-Host "Frontend: http://localhost:30000"
