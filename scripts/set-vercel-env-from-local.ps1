# Set Environment Variables from .env.local to Vercel Production
# This script uses vercel env pull/push method

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Vercel Environment Variables Updater" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Error: .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading environment variables from .env.local..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local" -Raw
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
    Write-Host "DRY RUN MODE - Commands that would be executed:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($key in $envVars.Keys) {
        Write-Host "vercel env add $key production" -ForegroundColor DarkGray
    }
    Write-Host ""
    Write-Host "Run without -DryRun to execute these commands" -ForegroundColor Yellow
    exit 0
}

Write-Host "Setting environment variables in Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This will open interactive prompts for each variable." -ForegroundColor Cyan
Write-Host "Copy and paste the value when prompted." -ForegroundColor Cyan
Write-Host ""

$count = 0
foreach ($key in $envVars.Keys) {
    $count++
    $value = $envVars[$key]
    
    Write-Host "[$count/$($envVars.Count)] Setting: $key" -ForegroundColor White
    Write-Host "Value: " -NoNewline -ForegroundColor DarkGray
    
    # Show truncated value for preview
    if ($value.Length -gt 50) {
        Write-Host "$($value.Substring(0, 47))..." -ForegroundColor DarkGray
    } else {
        Write-Host $value -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "Running: vercel env add $key production" -ForegroundColor Cyan
    
    # Copy value to clipboard for easy pasting
    Set-Clipboard -Value $value
    Write-Host "  Value copied to clipboard! Just paste when prompted." -ForegroundColor Green
    
    # Run vercel env add interactively
    vercel env add $key production
    
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Green
Write-Host "Environment Variables Update Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "All $($envVars.Count) environment variables have been set." -ForegroundColor Green
Write-Host ""
Write-Host "Next: Deploy to production" -ForegroundColor Cyan
Write-Host "  Run: npm run deploy:prod:skip-env" -ForegroundColor White
Write-Host "  Or:  vercel --prod" -ForegroundColor White
Write-Host ""
