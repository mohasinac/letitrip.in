#!/usr/bin/env pwsh
# PowerShell script to set up Vercel environment variables
# Run: .\deploy-to-vercel.ps1

Write-Host "🚀 HobbiesSpot Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ Error: .env.production not found!" -ForegroundColor Red
    Write-Host "📝 Please create .env.production from .env.production.example" -ForegroundColor Yellow
    Write-Host "   cp .env.production.example .env.production" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Found .env.production" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Cyan
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 Please login to Vercel:" -ForegroundColor Yellow
    vercel login
}

Write-Host ""
Write-Host "📤 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Ask for deployment type
$deployType = Read-Host "Deploy to (1) Preview or (2) Production? [1/2]"

if ($deployType -eq "2") {
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Magenta
    vercel --prod
} else {
    Write-Host "🔍 Deploying to PREVIEW..." -ForegroundColor Yellow
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Configure environment variables in Vercel dashboard" -ForegroundColor Gray
    Write-Host "   2. Add custom domain: hobbiesspot.com" -ForegroundColor Gray
    Write-Host "   3. Deploy Socket.io server to Render.com" -ForegroundColor Gray
    Write-Host "   4. Test all functionality" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "📋 Check logs with: vercel logs" -ForegroundColor Yellow
    exit 1
}
