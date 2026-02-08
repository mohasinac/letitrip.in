# List Vercel Environment Variables
# This script displays all environment variables configured in Vercel

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Vercel Environment Variables" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Vercel CLI not found." -ForegroundColor Red
    Write-Host "   Please install it with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "Fetching environment variables..." -ForegroundColor Blue
Write-Host ""

try {
    # List all environment variables
    vercel env ls
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Manage environment variables:" -ForegroundColor Blue
    Write-Host "  Dashboard: https://vercel.com/dashboard/[project]/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "CLI Commands:" -ForegroundColor Blue
    Write-Host "  Add variable:    vercel env add NAME production,preview,development" -ForegroundColor Cyan
    Write-Host "  Remove variable: vercel env rm NAME production" -ForegroundColor Cyan
    Write-Host "  Pull to file:    vercel env pull .env.vercel" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
