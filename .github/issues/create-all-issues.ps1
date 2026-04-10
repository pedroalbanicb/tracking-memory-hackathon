# GitHub Issues Creation Script for Tracking GO Documentation
# Generated on 2026-04-09 by BaIAninho
# Repository: tracking-memory-hackathon
# PowerShell Version for Windows

Param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Blue" = [ConsoleColor]::Blue
        "Cyan" = [ConsoleColor]::Cyan
        "Magenta" = [ConsoleColor]::Magenta
        "White" = [ConsoleColor]::White
    }
    
    Write-Host $Message -ForegroundColor $colors[$Color]
}

Write-ColorOutput "Creating GitHub Issues for Tracking GO Documentation..." "Cyan"
Write-Host ""

# Check if gh CLI is installed
try {
    $null = Get-Command gh -ErrorAction Stop
    Write-ColorOutput "[OK] GitHub CLI found" "Green"
} catch {
    Write-ColorOutput "[ERROR] GitHub CLI (gh) could not be found" "Red"
    Write-ColorOutput "   Install from: https://cli.github.com/" "Yellow"
    exit 1
}

# Check if we're in the correct repository
if (-not (Test-Path "docs/pipeline/sku-lifecycle.md")) {
    Write-ColorOutput "[ERROR] This script must be run from tracking-memory-hackathon root" "Red"
    Write-ColorOutput "   Current directory: $(Get-Location)" "Yellow"
    exit 1
}

# Verify authentication
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-ColorOutput "[OK] GitHub CLI authenticated" "Green"
} catch {
    Write-ColorOutput "[ERROR] GitHub CLI not authenticated" "Red"
    Write-ColorOutput "   Run: gh auth login" "Yellow"
    exit 1
}

Write-Host ""

# Issue creation function
function New-GitHubIssue {
    param(
        [string]$Title,
        [string]$Labels,
        [string]$Assignee,
        [string]$BodyFile,
        [string]$Priority
    )
    
    Write-ColorOutput "Creating: $Title" "Blue"
    
    if ($DryRun) {
        Write-ColorOutput "   [DRY RUN] Would create issue with:" "Yellow"
        Write-ColorOutput "      Title: $Title" "White"
        Write-ColorOutput "      Labels: $Labels" "White"
        Write-ColorOutput "      Assignee: $Assignee" "White"
        Write-ColorOutput "      Body File: .github/issues/$BodyFile" "White"
        Write-Host ""
        return $true
    }
    
    # Build gh command arguments
    $args = @(
        "issue", "create",
        "--title", $Title,
        "--label", $Labels
    )
    
    # Add assignee if specified
    if ($Assignee -and $Assignee -ne "none") {
        $args += "--assignee", $Assignee
    }
    
    # Add body from file
    $bodyFilePath = ".github/issues/$BodyFile"
    if (Test-Path $bodyFilePath) {
        $args += "--body-file", $bodyFilePath
    } else {
        Write-ColorOutput "   [WARNING] Body file $bodyFilePath not found" "Yellow"
        $args += "--body", "See $bodyFilePath for details (file missing)"
    }
    
    # Execute command
    try {
        if ($Verbose) {
            Write-ColorOutput "   Command: gh $($args -join ' ')" "Cyan"
        }
        
        $issueUrl = gh @args
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "   [SUCCESS] Created: $issueUrl" "Green"
        } else {
            throw "gh command failed with exit code $LASTEXITCODE"
        }
    } catch {
        Write-ColorOutput "   [FAILED] Failed to create issue: $Title" "Red"
        Write-ColorOutput "   Error: $_" "Red"
        return $false
    }
    
    Write-Host ""
    return $true
}

if ($DryRun) {
    Write-ColorOutput "[DRY RUN MODE] No issues will be created" "Yellow"
    Write-Host ""
}

Write-ColorOutput "Creating issues in priority order..." "Magenta"
Write-Host ""

$successCount = 0
$totalCount = 0

# P1 Issues (High Priority)
Write-ColorOutput "=== P1 High Priority Issues ===" "Red"

$totalCount++
if (New-GitHubIssue `
    -Title "Nomenclatura Critica - Campos com Risco de Implementacao" `
    -Labels "P1-high,fix,needs-validation" `
    -Assignee "douglas-souza-wolff" `
    -BodyFile "02-nomenclatura-critica.md" `
    -Priority "P1") {
    $successCount++
}

$totalCount++
if (New-GitHubIssue `
    -Title "E06/E07 - Admin Discovery (Etapas Vazias)" `
    -Labels "P1-high,documentation,needs-sme,admin" `
    -Assignee "juliana-dos-santos" `
    -BodyFile "03-admin-discovery.md" `
    -Priority "P1") {
    $successCount++
}

# P2 Issues (Medium Priority)
Write-ColorOutput "=== P2 Medium Priority Issues ===" "Yellow"

$totalCount++
if (New-GitHubIssue `
    -Title "Research - Sistemas e Termos Indefinidos" `
    -Labels "P2-medium,research,needs-sme" `
    -Assignee "ricardo-tadeu-lima" `
    -BodyFile "04-sistemas-indefinidos.md" `
    -Priority "P2") {
    $successCount++
}

$totalCount++
if (New-GitHubIssue `
    -Title "Validacao Tecnica - Campos e Queries SQL" `
    -Labels "P2-medium,validation,sql,technical" `
    -Assignee "douglas-souza-wolff" `
    -BodyFile "05-validacao-tecnica.md" `
    -Priority "P2") {
    $successCount++
}

# P3 Issues (Low Priority)
Write-ColorOutput "=== P3 Low Priority Issues ===" "Green"

$totalCount++
if (New-GitHubIssue `
    -Title "Quick Fixes - Inconsistencias Documentais" `
    -Labels "P3-low,fix,quick-fix" `
    -Assignee "none" `
    -BodyFile "01-quick-fixes.md" `
    -Priority "P3") {
    $successCount++
}

$totalCount++
if (New-GitHubIssue `
    -Title "Inventario e Coerencia de Assets" `
    -Labels "P3-low,documentation,maintenance" `
    -Assignee "none" `
    -BodyFile "06-inventory-assets.md" `
    -Priority "P3") {
    $successCount++
}

# Summary
Write-Host ""
if ($DryRun) {
    Write-ColorOutput "[DRY RUN] COMPLETED" "Cyan"
} elseif ($successCount -eq $totalCount) {
    Write-ColorOutput "[SUCCESS] All issues created successfully!" "Green"
} else {
    Write-ColorOutput "[WARNING] Some issues failed to create ($successCount/$totalCount)" "Yellow"
}

Write-Host ""
Write-ColorOutput "Summary:" "White"
Write-ColorOutput "   P1 Issues: 2 (Critical for implementation)" "White"
Write-ColorOutput "   P2 Issues: 2 (Important research)" "White"
Write-ColorOutput "   P3 Issues: 2 (Quality improvements)" "White"
Write-Host ""

if (-not $DryRun) {
    Write-ColorOutput "View all issues: gh issue list" "Cyan"
    Write-Host ""
    
    Write-ColorOutput "Next steps:" "White"
    Write-ColorOutput "   1. Review assignees and adjust if needed" "White"
    Write-ColorOutput "   2. Add project board if using GitHub Projects" "White"
    Write-ColorOutput "   3. Coordinate with assigned team members" "White"
    Write-ColorOutput "   4. Set up weekly sync for P1/P2 issues" "White"
    Write-Host ""
    
    Write-ColorOutput "Tips:" "White"
    Write-ColorOutput "   Use 'gh issue view <number>' to see details" "White"
    Write-ColorOutput "   Use 'gh issue edit <number>' to modify issues" "White"
    Write-ColorOutput "   Add milestone if tracking towards specific date" "White"
} else {
    Write-Host ""
    Write-ColorOutput "To create the issues for real, run:" "Cyan"
    Write-ColorOutput "   ./.github/issues/create-all-issues.ps1" "White"
}

Write-Host ""