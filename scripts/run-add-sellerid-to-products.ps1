# Add Seller ID to Products Script
# This script adds sellerId to products that don't have one

Write-Host "=== Add Seller ID to Products ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    exit 1
}

# Load environment variables from .env.local
Write-Host "Loading environment variables..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        $value = $value -replace '^["'']|["'']$', ''
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host "Running script..." -ForegroundColor Yellow
Write-Host ""

node scripts/add-sellerid-to-products.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Script failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
