# CaseStar Quality Gate 🌟

Comprehensive code quality checking system that catches issues before they hit production.

## What It Catches

✅ **CSP Violations** - `styled-jsx`, `eval()`, `Function()`, inline handlers  
✅ **TypeScript Errors** - Type checking, compilation errors  
✅ **ESLint Issues** - Code style, best practices  
✅ **PowerShell Problems** - Syntax errors, PSScriptAnalyzer issues  
✅ **Import/Export Mismatches** - Named vs default exports  
✅ **File Encoding Issues** - Null bytes, BOM markers  
✅ **Security Vulnerabilities** - npm audit for dependencies  
✅ **Code Quality** - console.log, large files, TODOs  
✅ **Environment Safety** - .env tracking, .gitignore completeness  

## Usage

### Run Manually
```bash
# Basic check
npm run quality-gate

# With auto-fix for linting
npm run quality-gate:fix

# Verbose output
npm run quality-gate:verbose
```

### Pre-Commit Hook (Automatic)
The quality gate runs automatically before every commit:

```bash
git commit -m "your message"
# → Quality gate runs automatically
# → Commit blocked if issues found
```

To bypass (NOT recommended):
```bash
git commit -m "your message" --no-verify
```

## What Gets Checked

### 1. File Encoding
- Null bytes that corrupt files
- UTF-8 BOM markers that cause issues
- Invalid characters

### 2. CSP Violations (⭐ NEW!)
- `<style jsx>` requires `unsafe-eval` ❌
- `eval()` usage ❌
- `new Function()` constructor ❌
- `setTimeout/setInterval` with strings ⚠️
- Inline event handlers in JSX ⚠️

### 3. TypeScript
- Compilation errors
- Type mismatches
- Missing types

### 4. ESLint
- Code style issues
- Best practice violations
- Unused variables

### 5. PowerShell Scripts
- Syntax errors
- PSScriptAnalyzer warnings
- Encoding issues

### 6. Import Paths
- Default import of named export
- Missing file extensions
- Invalid module paths

### 7. Dependencies
- Critical vulnerabilities
- High/moderate security issues
- Outdated packages

### 8. Code Quality
- `console.log` in production
- Files over 500 lines
- TODO/FIXME comments

### 9. Git Safety
- `.env` tracked in git ❌
- Missing `.gitignore` patterns
- No `.env.example`

## Exit Codes

- `0` = All checks passed
- `1` = Issues found (commit blocked)

## Examples

### Successful Run
```
═══════════════════════════════════════════════════════
  FILE ENCODING CHECK
═══════════════════════════════════════════════════════
  ✅ All files have correct encoding

═══════════════════════════════════════════════════════
  CSP VIOLATION CHECK
═══════════════════════════════════════════════════════
  ✅ No CSP violations detected

...

═══════════════════════════════════════════════════════
  QUALITY GATE SUMMARY
═══════════════════════════════════════════════════════

  ✅ ALL CHECKS PASSED!
  Duration: 3.42s
```

### Failed Run
```
═══════════════════════════════════════════════════════
  CSP VIOLATION CHECK
═══════════════════════════════════════════════════════
  ❌ Stars.tsx:8 - styled-jsx (CSP unsafe-eval)
  ❌ page.tsx:42 - eval() usage

═══════════════════════════════════════════════════════
  QUALITY GATE SUMMARY
═══════════════════════════════════════════════════════

  ❌ QUALITY GATE FAILED
  Issues: 2
  Warnings: 1
  Duration: 4.12s

  Fix issues and run again.
```

## Customization

Edit `scripts/quality-gate.ps1` to:
- Add new checks
- Adjust severity levels
- Skip certain checks
- Customize error messages

## Integration with CI/CD

Add to GitHub Actions:

```yaml
name: Quality Gate
on: [push, pull_request]
jobs:
  quality:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run quality-gate
```

## Troubleshooting

### Pre-commit hook not running
```bash
# Make executable (Git Bash)
chmod +x .git/hooks/pre-commit

# Or reinstall
npm run prepare
```

### Too many warnings
Use `-Verbose` flag to see details:
```bash
npm run quality-gate:verbose
```

### Need to commit urgently
```bash
git commit --no-verify -m "emergency fix"
# ⚠️ Use sparingly!
```

## Performance

- Typical run: **3-5 seconds**
- With fixes: **5-8 seconds**
- Large codebases: **10-15 seconds**

## What This Would Have Caught

✅ The `styled-jsx` CSP issue we just fixed!  
✅ Import/export mismatches  
✅ TypeScript errors before runtime  
✅ Security vulnerabilities  
✅ Encoding issues  

---

**Bottom line**: Run before every commit, sleep better at night. 😴🌟
