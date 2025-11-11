# Sync Environment Variables to Vercel Production
# This script properly sets environment variables using Vercel CLI

param(
    [string]$EnvFile = ".env.local",
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Vercel Environment Variables Sync" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if environment file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "Error: $EnvFile file not found!" -ForegroundColor Red
    Write-Host "Available options: .env.local, .env.production" -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading environment variables from $EnvFile..." -ForegroundColor Yellow
$envContent = Get-Content $EnvFile -Raw
$envVars = @{}

# Parse environment variables
$lines = $envContent -split "`n"
foreach ($line in $lines) {
    $line = $line.Trim()
    
    # Skip comments and empty lines
    if ($line -match "^#" -or $line -eq "") {
        continue
    }
    
    # Parse key=value
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove surrounding quotes if present
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        }
        
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $envVars[$key] = $value
        }
    }
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - Variables to be set:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($key in $envVars.Keys) {
        $value = $envVars[$key]
        $preview = if ($value.Length -gt 50) { "$($value.Substring(0, 47))..." } else { $value }
        Write-Host "  $key = $preview" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Run without -DryRun to execute" -ForegroundColor Yellow
    exit 0
}

# Create a temporary file for batch setting
$tempFile = [System.IO.Path]::GetTempFileName()
$envFileContent = ""

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    # Escape special characters for environment files
    $value = $value -replace '"', '\"'
    $envFileContent += "$key=`"$value`"`n"
}

Set-Content -Path $tempFile -Value $envFileContent -NoNewline

Write-Host "Setting environment variables in Vercel production..." -ForegroundColor Yellow
Write-Host ""

# Use vercel env pull to get existing, then push new ones
Write-Host "Step 1: Pulling existing environment configuration..." -ForegroundColor Cyan
$pullFile = ".env.vercel.tmp"
vercel env pull $pullFile --environment production --yes 2>$null | Out-Null

Write-Host "Step 2: Merging with new variables..." -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    # Show preview
    $preview = if ($value.Length -gt 50) { "$($value.Substring(0, 47))..." } else { $value }
    Write-Host "  Setting: $key" -ForegroundColor White -NoNewline
    
    # Create a temp file with just this value
    $singleVarFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $singleVarFile -Value $value -NoNewline
    
    try {
        # Use Get-Content and pipe to vercel env add
        $output = Get-Content $singleVarFile -Raw | vercel env add $key production --force 2>&1
        
        if ($LASTEXITCODE -eq 0 -or $output -match "Created|Updated") {
            Write-Host " ✓" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "    Error: $output" -ForegroundColor DarkRed
            $failCount++
        }
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor DarkRed
        $failCount++
    } finally {
        Remove-Item $singleVarFile -Force -ErrorAction SilentlyContinue
    }
}

# Cleanup
Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
Remove-Item $pullFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Environment Variables Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Total: $($envVars.Count)" -ForegroundColor White
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✓ Environment variables successfully synced to Vercel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Deploy to production: npm run deploy:prod:skip-env" -ForegroundColor White
    Write-Host "  2. Or use: vercel --prod" -ForegroundColor White
    Write-Host ""
}

if ($failCount -gt 0) {
    Write-Host "⚠ Some variables failed to update" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set variables manually:" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "  2. Select your project" -ForegroundColor White
    Write-Host "  3. Settings → Environment Variables" -ForegroundColor White
    Write-Host ""
    
    if (-not $Force) {
        exit 1
    }
}
