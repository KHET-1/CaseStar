# CaseStar Quality Gate - Comprehensive Code Validation
# Catches: CSP issues, linting, TypeScript, PowerShell, encoding, and more!

param(
    [switch]$Fix,
    [switch]$Verbose,
    [switch]$SkipTests
)

$ErrorActionPreference = "Continue"
$script:IssuesFound = 0
$script:WarningsFound = 0

function Write-Header {
    param([string]$Text)
    Write-Host "`n$('═' * 70)" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor White
    Write-Host "$('═' * 70)" -ForegroundColor Cyan
}

function Write-Check {
    param([string]$Text, [string]$Status, [string]$Color = "Green")
    $icon = switch ($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️ " }
        "INFO" { "ℹ️ " }
        default { "•" }
    }
    Write-Host "  $icon $Text" -ForegroundColor $Color
}

function Test-FileEncoding {
    Write-Header "FILE ENCODING CHECK"
    
    $badEncodings = @()
    Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx,*.ps1,*.md -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch 'node_modules|\.next|dist|build' } | 
        ForEach-Object {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match '\x00') {
                $badEncodings += $_.FullName
                Write-Check "$($_.Name) - Contains null bytes" "FAIL" "Red"
                $script:IssuesFound++
            }
            # Check for BOM
            $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
            if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                Write-Check "$($_.Name) - UTF-8 BOM detected (may cause issues)" "WARN" "Yellow"
                $script:WarningsFound++
            }
        }
    
    if ($badEncodings.Count -eq 0) {
        Write-Check "All files have correct encoding" "PASS"
    }
}

function Test-CSPViolations {
    Write-Header "CSP VIOLATION CHECK"
    
    $cspViolations = @()
    
    # Check for eval, Function constructor, inline handlers
    Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx -Recurse -ErrorAction SilentlyContinue | 
        ForEach-Object {
            $lineNum = 0
            Get-Content $_.FullName -ErrorAction SilentlyContinue | ForEach-Object {
                $lineNum++
                $line = $_
                
                # Check for styled-jsx (requires eval)
                if ($line -match '<style\s+jsx>') {
                    $cspViolations += @{
                        File = $_.FullName
                        Line = $lineNum
                        Issue = "styled-jsx requires 'unsafe-eval' in CSP"
                        Severity = "ERROR"
                    }
                    Write-Check "$($_.Name):$lineNum - styled-jsx (CSP unsafe-eval)" "FAIL" "Red"
                    $script:IssuesFound++
                }
                
                # Check for eval()
                if ($line -match '\beval\s*\(') {
                    $cspViolations += @{
                        File = $_.FullName
                        Line = $lineNum
                        Issue = "eval() usage"
                        Severity = "ERROR"
                    }
                    Write-Check "$($_.Name):$lineNum - eval() usage" "FAIL" "Red"
                    $script:IssuesFound++
                }
                
                # Check for Function constructor
                if ($line -match 'new\s+Function\s*\(') {
                    Write-Check "$($_.Name):$lineNum - Function() constructor" "FAIL" "Red"
                    $script:IssuesFound++
                }
                
                # Check for setTimeout/setInterval with strings
                if ($line -match '(setTimeout|setInterval)\s*\(\s*[''"]') {
                    Write-Check "$($_.Name):$lineNum - setTimeout/setInterval with string" "WARN" "Yellow"
                    $script:WarningsFound++
                }
                
                # Check for inline event handlers in JSX
                if ($line -match 'on\w+\s*=\s*[''"]') {
                    Write-Check "$($_.Name):$lineNum - Inline event handler (avoid in JSX)" "WARN" "Yellow"
                    $script:WarningsFound++
                }
            }
        }
    
    if ($cspViolations.Count -eq 0) {
        Write-Check "No CSP violations detected" "PASS"
    }
}

function Test-TypeScript {
    Write-Header "TYPESCRIPT CHECK"
    
    if (Test-Path "tsconfig.json") {
        $result = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "TypeScript compilation successful" "PASS"
        } else {
            Write-Check "TypeScript errors found" "FAIL" "Red"
            $result | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
            
            if ($Fix) {
                Write-Host "  Attempting auto-fix..." -ForegroundColor Yellow
                
                # Run ESLint with --fix to auto-fix TypeScript issues
                npx eslint . --ext .ts,.tsx --fix 2>&1 | Out-Null
                
                # Re-check TypeScript
                $retryResult = npx tsc --noEmit 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Check "Auto-fix successful! TypeScript now passes" "PASS"
                    return
                } else {
                    Write-Check "Auto-fix applied, but some errors remain" "WARN" "Yellow"
                }
            }
            
            $script:IssuesFound++
        }
    } else {
        Write-Check "No tsconfig.json found" "WARN" "Yellow"
    }
}

function Test-ESLint {
    Write-Header "ESLINT CHECK"
    
    if ((Test-Path ".eslintrc.json") -or (Test-Path ".eslintrc.js")) {
        $cmd = if ($Fix) { "npx eslint . --ext .ts,.tsx,.js,.jsx --fix" } else { "npx eslint . --ext .ts,.tsx,.js,.jsx" }
        $result = Invoke-Expression $cmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Check "ESLint passed" "PASS"
        } else {
            Write-Check "ESLint issues found" "FAIL" "Red"
            if ($Verbose) {
                $result | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
            }
            $script:IssuesFound++
        }
    } else {
        Write-Check "No ESLint config found (recommended)" "WARN" "Yellow"
        $script:WarningsFound++
    }
}

function Test-PowerShellScripts {
    Write-Header "POWERSHELL SCRIPT CHECK"
    
    $psScripts = Get-ChildItem -Path . -Filter *.ps1 -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch 'node_modules' }
    
    if ($psScripts.Count -eq 0) {
        Write-Check "No PowerShell scripts to check" "INFO" "Gray"
        return
    }
    
    foreach ($script in $psScripts) {
        # Syntax check
        $errors = $null
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $script.FullName -Raw), [ref]$errors)
        
        if ($errors.Count -gt 0) {
            Write-Check "$($script.Name) - Syntax errors" "FAIL" "Red"
            $errors | ForEach-Object { Write-Host "    Line $($_.Token.StartLine): $($_.Message)" -ForegroundColor Red }
            $script:IssuesFound++
        } else {
            Write-Check "$($script.Name) - Syntax OK" "PASS"
        }
        
        # Check for PSScriptAnalyzer if available
        if (Get-Module -ListAvailable -Name PSScriptAnalyzer) {
            $analysis = Invoke-ScriptAnalyzer -Path $script.FullName -Severity Error,Warning
            if ($analysis) {
                Write-Check "$($script.Name) - PSScriptAnalyzer issues" "WARN" "Yellow"
                if ($Verbose) {
                    $analysis | ForEach-Object { 
                        Write-Host "    $($_.Severity): $($_.Message)" -ForegroundColor Yellow 
                    }
                }
                $script:WarningsFound++
            }
        }
    }
}

function Test-ImportPaths {
    Write-Header "IMPORT PATH CHECK"
    
    Get-ChildItem -Path src -Include *.ts,*.tsx -Recurse -ErrorAction SilentlyContinue | 
        ForEach-Object {
            $lineNum = 0
            Get-Content $_.FullName -ErrorAction SilentlyContinue | ForEach-Object {
                $lineNum++
                $line = $_
                
                # Check for default import of named export
                if ($line -match "import\s+(\w+)\s+from\s+['""]@/components") {
                    $importName = $matches[1]
                    # This is a heuristic - actual check would require parsing
                    if ($importName -match '^[A-Z]') {
                        Write-Check "Line $lineNum - Possible default import of named export" "WARN" "Yellow"
                        $script:WarningsFound++
                    }
                }
                
                # Check for missing file extensions in relative imports
                if ($line -match "from\s+['""]\.\.?/[^'""]+(?<![.tsx|.ts|.jsx|.js])['""]") {
                    Write-Check "Line $lineNum - Relative import without extension (may fail)" "WARN" "Yellow"
                    $script:WarningsFound++
                }
            }
        }
}

function Test-DependencyVulnerabilities {
    Write-Header "DEPENDENCY SECURITY CHECK"
    
    if (Test-Path "package.json") {
        Write-Host "  Running npm audit..." -ForegroundColor Gray
        $audit = npm audit --json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($audit.metadata.vulnerabilities.critical -gt 0) {
            Write-Check "$($audit.metadata.vulnerabilities.critical) CRITICAL vulnerabilities" "FAIL" "Red"
            $script:IssuesFound++
        }
        if ($audit.metadata.vulnerabilities.high -gt 0) {
            Write-Check "$($audit.metadata.vulnerabilities.high) HIGH vulnerabilities" "WARN" "Yellow"
            $script:WarningsFound++
        }
        if ($audit.metadata.vulnerabilities.moderate -gt 0) {
            Write-Check "$($audit.metadata.vulnerabilities.moderate) MODERATE vulnerabilities" "INFO" "Gray"
        }
        
        if ($audit.metadata.vulnerabilities.total -eq 0) {
            Write-Check "No vulnerabilities found" "PASS"
        }
    }
}

function Test-CodeQuality {
    Write-Header "CODE QUALITY CHECKS"
    
    # Check for console.log in production code
    $consoleLogs = 0
    Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.Name -notmatch '.test.|.spec.' } |
        ForEach-Object {
            $matchResults = Select-String -Path $_.FullName -Pattern 'console\.(log|debug|info)' -AllMatches
            if ($matchResults) {
                $consoleLogs += $matchResults.Matches.Count
            }
        }
    
    if ($consoleLogs -gt 0) {
        Write-Check "$consoleLogs console.log statements in production code" "WARN" "Yellow"
        $script:WarningsFound++
    }
    
    # Check for TODO/FIXME comments
    $todos = 0
    Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx,*.ps1 -Recurse -ErrorAction SilentlyContinue | 
        ForEach-Object {
            $todoMatches = Select-String -Path $_.FullName -Pattern '(TODO|FIXME):' -AllMatches
            if ($todoMatches) {
                $todos += $todoMatches.Matches.Count
            }
        }
    
    if ($todos -gt 0) {
        Write-Check "$todos TODO/FIXME comments found" "INFO" "Gray"
    }
    
    # Check for large files (>500 lines)
    $largeFiles = Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx -Recurse -ErrorAction SilentlyContinue |
        Where-Object { 
            (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 500 
        }
    
    if ($largeFiles) {
        Write-Check "$($largeFiles.Count) files over 500 lines (consider refactoring)" "WARN" "Yellow"
        $script:WarningsFound++
    }
}

function Test-GitIgnore {
    Write-Header ".GITIGNORE CHECK"
    
    if (!(Test-Path ".gitignore")) {
        Write-Check "No .gitignore found" "WARN" "Yellow"
        $script:WarningsFound++
        return
    }
    
    $gitignore = Get-Content ".gitignore" -Raw
    $required = @('node_modules', '.next', '.env', '*.log', '__pycache__', '*.pyc')
    
    foreach ($pattern in $required) {
        if ($gitignore -notmatch [regex]::Escape($pattern)) {
            Write-Check "Missing pattern: $pattern" "WARN" "Yellow"
            $script:WarningsFound++
        }
    }
}

function Test-EnvironmentFiles {
    Write-Header "ENVIRONMENT FILES CHECK"
    
    # Check for .env in git
    if (Test-Path ".env") {
        $gitTracked = git ls-files .env 2>&1
        if ($gitTracked) {
            Write-Check ".env is tracked in git (SECURITY RISK!)" "FAIL" "Red"
            $script:IssuesFound++
        }
    }
    
    # Check for .env.example
    if (!(Test-Path ".env.example")) {
        Write-Check "No .env.example found (recommended)" "WARN" "Yellow"
        $script:WarningsFound++
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Clear-Host
Write-Host @"

   ╔═══════════════════════════════════════════════════════════╗
   ║                                                           ║
   ║            🌟 CaseStar Quality Gate 🌟                   ║
   ║         Comprehensive Code Quality Checks                 ║
   ║                                                           ║
   ╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$startTime = Get-Date

# Run all checks
Test-FileEncoding
Test-CSPViolations
Test-TypeScript
Test-ESLint
Test-PowerShellScripts
Test-ImportPaths
Test-DependencyVulnerabilities
Test-CodeQuality
Test-GitIgnore
Test-EnvironmentFiles

# Summary
$duration = (Get-Date) - $startTime
Write-Host "`n$('═' * 70)" -ForegroundColor Cyan
Write-Host "  QUALITY GATE SUMMARY" -ForegroundColor White
Write-Host "$('═' * 70)" -ForegroundColor Cyan

if ($script:IssuesFound -eq 0 -and $script:WarningsFound -eq 0) {
    Write-Host "`n  ✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "  Duration: $($duration.TotalSeconds.ToString('F2'))s" -ForegroundColor Gray
    exit 0
} elseif ($script:IssuesFound -eq 0) {
    Write-Host "`n  ⚠️  PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "  Warnings: $script:WarningsFound" -ForegroundColor Yellow
    Write-Host "  Duration: $($duration.TotalSeconds.ToString('F2'))s" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "`n  ❌ QUALITY GATE FAILED" -ForegroundColor Red
    Write-Host "  Issues: $script:IssuesFound" -ForegroundColor Red
    Write-Host "  Warnings: $script:WarningsFound" -ForegroundColor Yellow
    Write-Host "  Duration: $($duration.TotalSeconds.ToString('F2'))s" -ForegroundColor Gray
    Write-Host "`n  Fix issues and run again." -ForegroundColor Red
    exit 1
}
