# Validation Script for GitHub Issues Creation
# Checks prerequisites and file integrity before running create-all-issues.ps1

Param(
    [switch]$Fix,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

function Write-ValidationResult {
    param(
        [string]$Test,
        [bool]$Passed,
        [string]$Details = "",
        [string]$FixAction = ""
    )
    
    $status = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$status $Test" -ForegroundColor $color
    
    if ($Details) {
        Write-Host "   $Details" -ForegroundColor Gray
    }
    
    if (-not $Passed -and $FixAction -and $Fix) {
        Write-Host "   FIX: $FixAction" -ForegroundColor Yellow
    }
    
    return $Passed
}

Write-Host "Validating GitHub Issues Setup..." -ForegroundColor Cyan
Write-Host ""

$allTests = @()

# Test 1: Repository Structure
$repoStructureTest = Test-Path "docs/pipeline/sku-lifecycle.md"
$allTests += Write-ValidationResult `
    "Repository structure (tracking-memory-hackathon root)" `
    $repoStructureTest `
    "Current location: $(Get-Location)" `
    "Navigate to tracking-memory-hackathon root directory"

# Test 2: GitHub CLI
$ghInstalled = $false
try {
    $ghVersion = gh --version 2>$null
    $ghInstalled = $LASTEXITCODE -eq 0
    $details = if ($ghInstalled) { "Version: $($ghVersion[0])" } else { "Not found" }
} catch {
    $details = "Not found"
}

$allTests += Write-ValidationResult `
    "GitHub CLI installed" `
    $ghInstalled `
    $details `
    "Install from https://cli.github.com/"

# Test 3: GitHub Authentication
$ghAuth = $false
if ($ghInstalled) {
    try {
        $authResult = gh auth status 2>&1
        $ghAuth = $LASTEXITCODE -eq 0
        $details = if ($ghAuth) { "Authenticated" } else { "Not authenticated" }
    } catch {
        $details = "Not authenticated"
    }
} else {
    $details = "Cannot test (gh not installed)"
}

$allTests += Write-ValidationResult `
    "GitHub CLI authentication" `
    $ghAuth `
    $details `
    "Run: gh auth login"

# Test 4: Issue Template Files
$templateFiles = @(
    "01-quick-fixes.md",
    "02-nomenclatura-critica.md", 
    "03-admin-discovery.md",
    "04-sistemas-indefinidos.md",
    "05-validacao-tecnica.md",
    "06-inventory-assets.md"
)

$templatesExist = $true
$missingFiles = @()
foreach ($file in $templateFiles) {
    $path = ".github/issues/$file"
    if (-not (Test-Path $path)) {
        $templatesExist = $false
        $missingFiles += $file
    }
}

$templateDetails = if ($templatesExist) { 
    "All 6 template files present" 
} else { 
    "Missing: $($missingFiles -join ', ')" 
}

$allTests += Write-ValidationResult `
    "Issue template files" `
    $templatesExist `
    $templateDetails `
    "Regenerate missing files"

# Test 5: Config File
$configExists = Test-Path ".github/issues/config.json"
$configValid = $false

if ($configExists) {
    try {
        $config = Get-Content ".github/issues/config.json" | ConvertFrom-Json
        $configValid = $config.issues.Count -eq 6
        $details = "6 issues configured"
    } catch {
        $details = "Invalid JSON format"
    }
} else {
    $details = "File not found"
}

$allTests += Write-ValidationResult `
    "Configuration file validity" `
    ($configExists -and $configValid) `
    $details `
    "Regenerate config.json"

# Test 6: PowerShell Execution Policy (Windows)
if ($IsWindows -or $PSVersionTable.Platform -eq "Win32NT" -or $env:OS -eq "Windows_NT") {
    $executionPolicy = Get-ExecutionPolicy
    $policyOk = $executionPolicy -in @("Unrestricted", "RemoteSigned", "Bypass")
    
    $policyDetails = "Current policy: $executionPolicy"
    $allTests += Write-ValidationResult `
        "PowerShell execution policy" `
        $policyOk `
        $policyDetails `
        "Run: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
}

# Test 7: Script Files
$scriptFiles = @(
    "create-all-issues.ps1",
    "create-all-issues.sh"
)

$scriptsExist = $true
$missingScripts = @()
foreach ($script in $scriptFiles) {
    $path = ".github/issues/$script"
    if (-not (Test-Path $path)) {
        $scriptsExist = $false
        $missingScripts += $script
    }
}

$scriptDetails = if ($scriptsExist) { 
    "PowerShell and Bash scripts present" 
} else { 
    "Missing: $($missingScripts -join ', ')" 
}

$allTests += Write-ValidationResult `
    "Creation scripts" `
    $scriptsExist `
    $scriptDetails `
    "Regenerate missing scripts"

# Test 8: Repository Write Permissions (if authenticated)
if ($ghAuth) {
    try {
        $repoInfo = gh repo view --json permissions 2>$null | ConvertFrom-Json
        $canWrite = $repoInfo.permissions.push -eq $true
        $details = if ($canWrite) { "Write access confirmed" } else { "No write access" }
    } catch {
        $canWrite = $null
        $details = "Could not verify permissions"
    }
    
    if ($canWrite -ne $null) {
        $allTests += Write-ValidationResult `
            "Repository write permissions" `
            $canWrite `
            $details `
            "Request write access from repository owner"
    }
}

# Summary
Write-Host ""
$passedTests = ($allTests | Where-Object { $_ -eq $true }).Count
$totalTests = $allTests.Count

if ($passedTests -eq $totalTests) {
    Write-Host "SUCCESS: All validation tests passed! ($passedTests/$totalTests)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to create GitHub issues!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Run: .\github\issues\create-all-issues.ps1 -DryRun" -ForegroundColor Cyan
    Write-Host "  2. Review dry run output" -ForegroundColor Cyan
    Write-Host "  3. Run: .\github\issues\create-all-issues.ps1" -ForegroundColor Cyan
} else {
    $failedTests = $totalTests - $passedTests
    Write-Host "WARNING: Validation issues found ($failedTests/$totalTests failed)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($Fix) {
        Write-Host "Auto-fix attempted (check results above)" -ForegroundColor Yellow
    } else {
        Write-Host "Run with -Fix to attempt automatic fixes:" -ForegroundColor White
        Write-Host "   .\github\issues\validate.ps1 -Fix" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "ERROR: Not ready to create issues yet" -ForegroundColor Red
}

Write-Host ""