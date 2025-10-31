#!/usr/bin/env pwsh
# PowerShell script to sync environment variables to Vercel
# Run: .\sync-env-to-vercel.ps1

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("production", "preview", "development", "all")]
    [string]$Environment = "production"
)

Write-Host "🔄 Syncing Environment Variables to Vercel" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ Error: .env.production not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Reading .env.production..." -ForegroundColor Yellow

# Read .env.production file
$envVars = Get-Content .env.production | Where-Object {
    $_ -match '^[A-Z_]+=.+' -and $_ -notmatch '^#'
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Set environment scope
$scope = switch ($Environment) {
    "all" { "production,preview,development" }
    default { $Environment }
}

Write-Host "🎯 Target environment: $scope" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  This will add/update variables in Vercel" -ForegroundColor Yellow
$confirm = Read-Host "Continue? (y/N)"

if ($confirm -ne "y") {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📤 Uploading variables to Vercel..." -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($line in $envVars) {
    $parts = $line -split '=', 2
    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')
    
    Write-Host "  Adding: $key" -ForegroundColor Gray
    
    # Use echo to pipe value to vercel env add
    try {
        echo $value | vercel env add $key $scope --force 2>$null
        if ($LASTEXITCODE -eq 0) {
            $successCount++
        } else {
            $failCount++
            Write-Host "    ⚠️  Failed to add $key" -ForegroundColor Red
        }
    } catch {
        $failCount++
        Write-Host "    ⚠️  Error adding $key" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Successfully added: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "⚠️  Failed: $failCount" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Triggering redeployment..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Done! Environment variables synced" -ForegroundColor Green
Write-Host "📖 View in dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
