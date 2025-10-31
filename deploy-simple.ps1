# Simple Deployment Script with SEO for HobbiesSpot
# Run: .\deploy-simple.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HobbiesSpot Deployment with SEO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pre-deployment checks
Write-Host "Running pre-deployment checks..." -ForegroundColor Yellow
Write-Host ""

$allGood = $true

# Check 1: .env.production
if (Test-Path ".env.production") {
    Write-Host "[OK] .env.production exists" -ForegroundColor Green
} else {
    Write-Host "[FAIL] .env.production missing" -ForegroundColor Red
    $allGood = $false
}

# Check 2: SEO files
$seoFiles = @("src\components\seo\SEOHead.tsx", "src\lib\seo\metadata.ts", "src\app\sitemap.ts", "public\robots.txt")
$seoGood = $true
foreach ($file in $seoFiles) {
    if (-not (Test-Path $file)) {
        $seoGood = $false
    }
}
if ($seoGood) {
    Write-Host "[OK] SEO files present" -ForegroundColor Green
} else {
    Write-Host "[WARN] Some SEO files missing" -ForegroundColor Yellow
}

# Check 3: Vercel CLI
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercelCmd) {
    Write-Host "[OK] Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Vercel CLI not installed" -ForegroundColor Red
    Write-Host "       Install with: npm install -g vercel" -ForegroundColor Gray
    $allGood = $false
}

Write-Host ""

if (-not $allGood) {
    Write-Host "Please fix the issues above before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "All checks passed!" -ForegroundColor Green
Write-Host ""

# Login check
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Vercel:" -ForegroundColor Cyan
    vercel login
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying to Vercel Production" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Deploy
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Test SEO:" -ForegroundColor White
    Write-Host "   https://hobbiesspot.com/sitemap.xml" -ForegroundColor Gray
    Write-Host "   https://hobbiesspot.com/robots.txt" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Verify with tools:" -ForegroundColor White
    Write-Host "   Google Rich Results: https://search.google.com/test/rich-results" -ForegroundColor Gray
    Write-Host "   Facebook Debugger: https://developers.facebook.com/tools/debug" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Configure domain in Vercel dashboard" -ForegroundColor White
    Write-Host "   Add: hobbiesspot.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Deploy Socket.io server to Render.com" -ForegroundColor White
    Write-Host "   https://render.com/dashboard" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    Write-Host "Check logs with: vercel logs --follow" -ForegroundColor Yellow
    exit 1
}
