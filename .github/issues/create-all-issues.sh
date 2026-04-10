#!/bin/bash

# GitHub Issues Creation Script for Tracking GO Documentation
# Generated on 2026-04-09 by BaIAninho
# Repository: tracking-memory-hackathon

set -e  # Exit on any error

echo "🚀 Creating GitHub Issues for Tracking GO Documentation..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) could not be found"
    echo "   Install from: https://cli.github.com/"
    exit 1
fi

# Check if we're in the correct repository
if [[ ! -f "docs/pipeline/sku-lifecycle.md" ]]; then
    echo "❌ Error: This script must be run from tracking-memory-hackathon root"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Verify authentication
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI not authenticated"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Issue creation function
create_issue() {
    local title="$1"
    local labels="$2"
    local assignee="$3"
    local body_file="$4"
    local priority="$5"
    
    echo "📝 Creating: $title"
    
    # Build gh command
    local cmd=("gh" "issue" "create" "--title" "$title" "--label" "$labels")
    
    # Add assignee if specified
    if [[ -n "$assignee" && "$assignee" != "none" ]]; then
        cmd+=("--assignee" "$assignee")
    fi
    
    # Add body from file
    if [[ -f ".github/issues/$body_file" ]]; then
        cmd+=("--body-file" ".github/issues/$body_file")
    else
        echo "⚠️  Warning: Body file .github/issues/$body_file not found"
        cmd+=("--body" "See .github/issues/$body_file for details (file missing)")
    fi
    
    # Execute command and capture issue URL
    if issue_url=$("${cmd[@]}" 2>/dev/null); then
        echo "   ✅ Created: $issue_url"
        echo ""
    else
        echo "   ❌ Failed to create issue: $title"
        echo ""
        return 1
    fi
}

echo "🏷️  Creating issues in priority order..."
echo ""

# P1 Issues (High Priority)
echo "=== P1 High Priority Issues ==="

create_issue \
    "Nomenclatura Crítica — Campos com Risco de Implementação" \
    "P1-high,fix,needs-validation" \
    "douglas-souza-wolff" \
    "02-nomenclatura-critica.md" \
    "P1"

create_issue \
    "E06/E07 — Admin Discovery (Etapas Vazias)" \
    "P1-high,documentation,needs-sme,admin" \
    "juliana-dos-santos" \
    "03-admin-discovery.md" \
    "P1"

# P2 Issues (Medium Priority)
echo "=== P2 Medium Priority Issues ==="

create_issue \
    "Research — Sistemas e Termos Indefinidos" \
    "P2-medium,research,needs-sme" \
    "ricardo-tadeu-lima" \
    "04-sistemas-indefinidos.md" \
    "P2"

create_issue \
    "Validação Técnica — Campos e Queries SQL" \
    "P2-medium,validation,sql,technical" \
    "douglas-souza-wolff" \
    "05-validacao-tecnica.md" \
    "P2"

# P3 Issues (Low Priority)
echo "=== P3 Low Priority Issues ==="

create_issue \
    "Quick Fixes — Inconsistências Documentais" \
    "P3-low,fix,quick-fix" \
    "none" \
    "01-quick-fixes.md" \
    "P3"

create_issue \
    "Inventário e Coerência de Assets" \
    "P3-low,documentation,maintenance" \
    "none" \
    "06-inventory-assets.md" \
    "P3"

echo "🎉 All issues created successfully!"
echo ""
echo "📊 Summary:"
echo "   • P1 Issues: 2 (Critical for implementation)"
echo "   • P2 Issues: 2 (Important research)"
echo "   • P3 Issues: 2 (Quality improvements)"
echo ""
echo "🔗 View all issues: gh issue list"
echo "📋 Next steps:"
echo "   1. Review assignees and adjust if needed"
echo "   2. Add project board if using GitHub Projects"
echo "   3. Coordinate with assigned team members"
echo "   4. Set up weekly sync for P1/P2 issues"
echo ""
echo "💡 Tips:"
echo "   • Use 'gh issue view <number>' to see details"
echo "   • Use 'gh issue edit <number>' to modify issues"
echo "   • Add milestone if tracking towards specific date"