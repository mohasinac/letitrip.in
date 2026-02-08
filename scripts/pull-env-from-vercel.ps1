# Pull Environment Variables from Vercel
# This script downloads environment variables from Vercel

param(
    [string]$Environment = "development",
    [string]$OutputFile = ".env.vercel"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Pull Environment Variables from Vercel" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Vercel CLI not found." -ForegroundColor Red
    Write-Host "   Please install it with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "Environment: $Environment" -ForegroundColor Blue
Write-Host "Output file: $OutputFile" -ForegroundColor Blue
Write-Host ""

# Confirm pull
if (Test-Path $OutputFile) {
    Write-Host "[WARNING] File $OutputFile already exists and will be overwritten!" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "[CANCELLED] Pull cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Pulling environment variables..." -ForegroundColor Green

try {
    # Use Vercel CLI to pull environment variables
    vercel env pull $OutputFile --environment=$Environment
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Environment variables saved to: $OutputFile" -ForegroundColor Green
        Write-Host ""
        
        # Count variables
        $varCount = (Get-Content $OutputFile | Where-Object { $_ -match '^[^#].*=' }).Count
        Write-Host "Downloaded $varCount environment variables" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Next steps:" -ForegroundColor Blue
        Write-Host "  1. Review the file: notepad $OutputFile" -ForegroundColor Cyan
        Write-Host "  2. Copy to .env.local if needed" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERROR] Failed to pull environment variables" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
