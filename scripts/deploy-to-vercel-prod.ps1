# Automated Vercel Production Deployment Script
# This script updates all environment variables and deploys to production

param(
    [switch]$SkipEnvUpdate = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Vercel Production Deployment Automation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI installation..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Vercel CLI. Please install manually: npm i -g vercel" -ForegroundColor Red
        exit 1
    }
    Write-Host "Success: Vercel CLI installed successfully" -ForegroundColor Green
} else {
    Write-Host "Success: Vercel CLI is installed" -ForegroundColor Green
}

Write-Host ""

# Check if project is linked
Write-Host "Checking Vercel project link..." -ForegroundColor Yellow
if (-not (Test-Path ".vercel")) {
    Write-Host "Project not linked to Vercel. Linking now..." -ForegroundColor Red
    vercel link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to link project. Please run 'vercel link' manually." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Success: Project is linked to Vercel" -ForegroundColor Green
Write-Host ""

# Update environment variables if not skipped
if (-not $SkipEnvUpdate) {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "Updating Environment Variables" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    # Read .env.production file
    $envFile = ".env.production"
    if (-not (Test-Path $envFile)) {
        Write-Host "Error: $envFile not found!" -ForegroundColor Red
        exit 1
    }

    Write-Host "Reading environment variables from $envFile..." -ForegroundColor Yellow
    $envContent = Get-Content $envFile -Raw
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
            
            $envVars[$key] = $value
        }
    }

    Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
    Write-Host ""

    # Remove all existing production environment variables
    Write-Host "Removing existing production environment variables..." -ForegroundColor Yellow
    try {
        $existingVars = vercel env ls production --json 2>$null | ConvertFrom-Json
        if ($existingVars -and $existingVars.envs) {
            foreach ($envVar in $existingVars.envs) {
                Write-Host "  Removing: $($envVar.key)" -ForegroundColor DarkGray
                vercel env rm $envVar.key production --yes 2>$null | Out-Null
            }
        }
        Write-Host "Success: Existing variables removed" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not remove existing variables" -ForegroundColor Yellow
    }
    Write-Host ""

    # Add new environment variables
    Write-Host "Adding environment variables to Vercel production..." -ForegroundColor Yellow
    $successCount = 0
    $failCount = 0

    foreach ($key in $envVars.Keys) {
        $value = $envVars[$key]
        
        # Skip empty values
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "  Skipping $key (empty value)" -ForegroundColor DarkGray
            continue
        }

        Write-Host "  Setting: $key" -ForegroundColor White
        
        try {
            # Use echo to pipe value to vercel env add
            $value | vercel env add $key production 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                $successCount++
                Write-Host "    Success" -ForegroundColor Green
            } else {
                $failCount++
                Write-Host "    Failed" -ForegroundColor Red
            }
        } catch {
            $failCount++
            Write-Host "    Error: $_" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "Environment Variables Summary:" -ForegroundColor Cyan
    Write-Host "  Success: $successCount" -ForegroundColor Green
    if ($failCount -gt 0) {
        Write-Host "  Failed: $failCount" -ForegroundColor Red
    } else {
        Write-Host "  Failed: $failCount" -ForegroundColor Green
    }
    Write-Host ""

    if ($failCount -gt 0 -and -not $Force) {
        $continue = Read-Host "Some environment variables failed to update. Continue with deployment? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-Host "Skipping environment variable update (SkipEnvUpdate flag)" -ForegroundColor Yellow
    Write-Host ""
}

# Deploy to production
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Deploying to Production" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting production deployment..." -ForegroundColor Yellow
Write-Host ""

vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your application is now live in production!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Visit your production URL" -ForegroundColor White
    Write-Host "  2. Check the Vercel dashboard for deployment details" -ForegroundColor White
    Write-Host "  3. Monitor logs for any issues" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "Deployment Failed!" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Build errors - Check your code for compilation issues" -ForegroundColor White
    Write-Host "  2. Missing dependencies - Run 'npm install' locally" -ForegroundColor White
    Write-Host "  3. Environment variables - Verify all required vars are set" -ForegroundColor White
    Write-Host ""
    exit 1
}
