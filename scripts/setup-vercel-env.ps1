# Vercel Environment Variables Setup Script
# Run this to get the commands to set up Vercel environment variables

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy and run these commands in your terminal (after installing Vercel CLI):" -ForegroundColor Yellow
Write-Host ""

# Read .env.production file
$envFile = ".env.production"
if (Test-Path $envFile) {
    $envVars = Get-Content $envFile | Where-Object { $_ -match "^[^#].*=.*" }
    
    Write-Host "# Install Vercel CLI (if not installed)" -ForegroundColor Green
    Write-Host "npm i -g vercel" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Login to Vercel" -ForegroundColor Green
    Write-Host "vercel login" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Link your project" -ForegroundColor Green
    Write-Host "vercel link" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Set environment variables" -ForegroundColor Green
    foreach ($line in $envVars) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            
            # Skip comments and empty values
            if ($key -notmatch "^#" -and $value) {
                # Escape quotes for PowerShell
                $escapedValue = $value -replace '"', '\"'
                Write-Host "vercel env add $key production" -ForegroundColor White
                Write-Host "# When prompted, paste: $escapedValue" -ForegroundColor DarkGray
                Write-Host ""
            }
        }
    }
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Alternative: Use Vercel Dashboard" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Go to Settings -> Environment Variables" -ForegroundColor White
    Write-Host "4. Add the following variables:" -ForegroundColor White
    Write-Host ""
    
    foreach ($line in $envVars) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            
            if ($key -notmatch "^#" -and $value) {
                Write-Host "  $key" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
    Write-Host "Environment variables file location: $envFile" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Error: .env.production file not found!" -ForegroundColor Red
    Write-Host "Please ensure .env.production exists in the project root." -ForegroundColor Red
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Quick Deploy Commands" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Deploy to preview" -ForegroundColor Green
Write-Host "vercel" -ForegroundColor White
Write-Host ""
Write-Host "# Deploy to production" -ForegroundColor Green
Write-Host "vercel --prod" -ForegroundColor White
Write-Host ""
