#!/usr/bin/env pwsh
# Migration Helper Script
# Run this to start your migration session

Write-Host "🚀 Starting LetItRip Migration Session..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Start dev server in background
Write-Host "📦 Starting development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Start-Sleep -Seconds 2

Write-Host "✅ Dev server starting at http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Open documentation files
Write-Host "📚 Opening migration documentation..." -ForegroundColor Yellow
code MIGRATION-TRACKER.md
code MIGRATION-QUICK-REFERENCE.md
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "✅ Migration session ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Reference:" -ForegroundColor Cyan
Write-Host "  - Tracker:          MIGRATION-TRACKER.md" -ForegroundColor White
Write-Host "  - Quick Reference:  MIGRATION-QUICK-REFERENCE.md" -ForegroundColor White
Write-Host "  - Action Plan:      MIGRATION-ACTION-PLAN.md" -ForegroundColor White
Write-Host "  - Resume Prompt:    CONTINUE-MIGRATION-PROMPT.md" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Migration Order:" -ForegroundColor Cyan
Write-Host "  1. Public Pages (51)" -ForegroundColor Yellow
Write-Host "  2. Auth Pages (5)" -ForegroundColor Yellow
Write-Host "  3. Admin Pages (66)" -ForegroundColor Yellow
Write-Host "  4. Seller Pages (24)" -ForegroundColor Yellow
Write-Host "  5. User Pages (20)" -ForegroundColor Yellow
Write-Host "  6. Remaining Pages" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Remember:" -ForegroundColor Cyan
Write-Host "  - Test each change in real-time at http://localhost:3000" -ForegroundColor White
Write-Host "  - Update tracker immediately after each completion" -ForegroundColor White
Write-Host "  - Create constants/enums for hardcoded values" -ForegroundColor White
Write-Host "  - Commit after each logical change" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to start migration!" -ForegroundColor Green
Write-Host ""
