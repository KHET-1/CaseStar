# CaseStar Setup Verification Script

Write-Host "🔍 Verifying CaseStar Setup..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Python
Write-Host "Checking Python..." -NoNewline
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python 3\.(\d+)") {
        $minorVersion = [int]$matches[1]
        if ($minorVersion -ge 10) {
            Write-Host " ✅ $pythonVersion" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  $pythonVersion (Python 3.10+ recommended)" -ForegroundColor Yellow
        }
    } else {
        Write-Host " ❌ Python not found or version too old" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ❌ Python not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 20) {
            Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  $nodeVersion (Node.js 20+ recommended)" -ForegroundColor Yellow
        }
    } else {
        Write-Host " ❌ Node.js not found or invalid version" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ❌ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Check Ollama
Write-Host "Checking Ollama..." -NoNewline
try {
    $ollamaCheck = ollama list 2>&1
    if ($ollamaCheck -match "llama3.1:8b") {
        Write-Host " ✅ Ollama installed with llama3.1:8b" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Ollama installed but llama3.1:8b model not found" -ForegroundColor Yellow
        Write-Host "   Run: ollama pull llama3.1:8b" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ Ollama not found" -ForegroundColor Red
    Write-Host "   Install from: https://ollama.ai/" -ForegroundColor Red
    $allGood = $false
}

# Check Python packages
Write-Host "Checking Python packages..." -NoNewline
try {
    $packages = @("fastapi", "uvicorn", "chromadb", "langchain-ollama")
    $missingPackages = @()
    
    foreach ($pkg in $packages) {
        $check = pip show $pkg 2>&1
        if ($LASTEXITCODE -ne 0) {
            $missingPackages += $pkg
        }
    }
    
    if ($missingPackages.Count -eq 0) {
        Write-Host " ✅ All required packages installed" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Missing packages: $($missingPackages -join ', ')" -ForegroundColor Yellow
        Write-Host "   Run: pip install -r requirements.txt" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ⚠️  Could not verify packages" -ForegroundColor Yellow
}

# Check Node modules
Write-Host "Checking Node modules..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✅ node_modules directory exists" -ForegroundColor Green
} else {
    Write-Host " ⚠️  node_modules not found" -ForegroundColor Yellow
    Write-Host "   Run: npm install" -ForegroundColor Yellow
}

# Check critical files
Write-Host "Checking project files..." -NoNewline
$criticalFiles = @("main.py", "package.json", "requirements.txt", "start-dev.ps1")
$missingFiles = @()

foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host " ✅ All critical files present" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
    $allGood = $false
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
if ($allGood) {
    Write-Host "✅ Setup verification complete! You're ready to start." -ForegroundColor Green
    Write-Host ""
    Write-Host "Start development servers with:" -ForegroundColor Cyan
    Write-Host "   .\start-dev.ps1" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues detected. Please address them before starting." -ForegroundColor Yellow
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
