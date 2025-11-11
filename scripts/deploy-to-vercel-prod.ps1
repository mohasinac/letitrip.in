# Automated Vercel Production Deployment Script
# This script updates all environment variables and deploys to production

param(
    [switch]$SkipEnvUpdate = $false,
    [switch]$Force = $false,
    [switch]$UseLocal = $false
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

    # Determine which env file to use
    if ($UseLocal) {
        $envFile = ".env.local"
        Write-Host "Using .env.local file (fallback mode)" -ForegroundColor Yellow
    } else {
        $envFile = ".env.production"
        Write-Host "Using .env.production file" -ForegroundColor Yellow
    }

    if (-not (Test-Path $envFile)) {
        Write-Host "Error: $envFile not found!" -ForegroundColor Red
        
        # Try fallback to .env.local if production file doesn't exist
        if ($envFile -eq ".env.production" -and (Test-Path ".env.local")) {
            Write-Host "Falling back to .env.local..." -ForegroundColor Yellow
            $envFile = ".env.local"
            $UseLocal = $true
        } else {
            exit 1
        }
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

    # Create a temporary file to store environment variables
    $tempEnvFile = [System.IO.Path]::GetTempFileName()
    
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
            # Write value to temp file
            $value | Out-File -FilePath $tempEnvFile -Encoding UTF8 -NoNewline
            
            # Use Get-Content and pipe to vercel env add
            $result = Get-Content $tempEnvFile -Raw | vercel env add $key production 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                $successCount++
                Write-Host "    Success" -ForegroundColor Green
            } else {
                $failCount++
                Write-Host "    Failed: $result" -ForegroundColor Red
            }
        } catch {
            $failCount++
            Write-Host "    Error: $_" -ForegroundColor Red
        }
    }

    # Clean up temp file
    if (Test-Path $tempEnvFile) {
        Remove-Item $tempEnvFile -Force
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
        Write-Host ""
        Write-Host "==================================================" -ForegroundColor Yellow
        Write-Host "Environment variables failed to update via CLI." -ForegroundColor Yellow
        Write-Host "==================================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Option 1: Set variables manually via Vercel Dashboard" -ForegroundColor Cyan
        Write-Host "  1. Go to: https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "  2. Select your project: letitrip-in" -ForegroundColor White
        Write-Host "  3. Go to: Settings -> Environment Variables" -ForegroundColor White
        Write-Host "  4. Copy variables from: $envFile" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 2: Try with .env.local file" -ForegroundColor Cyan
        Write-Host "  Run: .\scripts\deploy-to-vercel-prod.ps1 -UseLocal" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 3: Pull from .env.local and push to Vercel" -ForegroundColor Cyan
        Write-Host "  This script can read from .env.local instead" -ForegroundColor White
        Write-Host ""
        
        $continue = Read-Host "Continue with deployment anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "To set environment variables manually:" -ForegroundColor Cyan
            Write-Host "  1. Open Vercel Dashboard" -ForegroundColor White
            Write-Host "  2. Go to Project Settings -> Environment Variables" -ForegroundColor White
            Write-Host "  3. Add each variable from $envFile" -ForegroundColor White
            Write-Host "  4. Run deployment again with: npm run deploy:prod:skip-env" -ForegroundColor White
            Write-Host ""
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
    
    if ($successCount -eq 0 -and -not $SkipEnvUpdate) {
        Write-Host "WARNING: Environment variables were not updated!" -ForegroundColor Yellow
        Write-Host "Please set them manually in Vercel Dashboard:" -ForegroundColor Yellow
        Write-Host "  https://vercel.com/dashboard -> Project Settings -> Environment Variables" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Visit your production URL" -ForegroundColor White
    Write-Host "  2. Check the Vercel dashboard for deployment details" -ForegroundColor White
    Write-Host "  3. Verify environment variables in Settings" -ForegroundColor White
    Write-Host "  4. Monitor logs for any issues" -ForegroundColor White
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
