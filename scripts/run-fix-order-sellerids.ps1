# Fix Order Seller IDs Script
# This script fixes orders that have "default-seller" or missing sellerId

Write-Host "=== Fix Order Seller IDs ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with Firebase Admin credentials" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env.local
Write-Host "Loading environment variables from .env.local..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Verify required variables are set
$requiredVars = @(
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY"
)

$missingVars = @()
foreach ($var in $requiredVars) {
    if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($var))) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "ERROR: Missing required environment variables:" -ForegroundColor Red
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
Write-Host ""

# Run the migration script
Write-Host "Running order seller ID fix..." -ForegroundColor Yellow
Write-Host ""

node scripts/fix-order-sellerids.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Script failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
