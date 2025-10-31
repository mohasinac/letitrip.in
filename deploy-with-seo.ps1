# Complete deployment script with SEO verification
# Run: .\deploy-with-seo.ps1

param(
    [switch]$SkipBuild,
    [switch]$Preview
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║        🚀 HobbiesSpot Deployment with SEO Setup           ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Pre-Deployment Checks
# ============================================================================
Write-Host "📋 Step 1: Pre-Deployment Checks" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════" -ForegroundColor Gray
Write-Host ""

$checks = @()

# Check 1: Environment file
Write-Host "  [1/7] Checking environment file..." -NoNewline
if (Test-Path ".env.production") {
    Write-Host " ✅" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "        Create .env.production from .env.production.example" -ForegroundColor Gray
    $checks += $false
}

# Check 2: SEO files
Write-Host "  [2/7] Checking SEO infrastructure..." -NoNewline
$seoFiles = @(
    "src\components\seo\SEOHead.tsx",
    "src\lib\seo\metadata.ts",
    "src\lib\seo\structured-data.ts",
    "src\app\sitemap.ts",
    "public\robots.txt"
)
$seoOk = $true
foreach ($file in $seoFiles) {
    if (-not (Test-Path $file)) {
        $seoOk = $false
        break
    }
}
if ($seoOk) {
    Write-Host " ✅" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host " ❌" -ForegroundColor Red
    $checks += $false
}

# Check 3: Node modules
Write-Host "  [3/7] Checking dependencies..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✅" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "        Installing dependencies..." -ForegroundColor Gray
    npm install
    $checks += $true
}

# Check 4: Vercel CLI
Write-Host "  [4/7] Checking Vercel CLI..." -NoNewline
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercel) {
    Write-Host " ✅" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "        Install with: npm install -g vercel" -ForegroundColor Gray
    $checks += $false
}

# Check 5: Git status
Write-Host "  [5/7] Checking Git status..." -NoNewline
$gitStatus = git status --porcelain 2>$null
if ($null -ne $gitStatus -and $gitStatus.Length -gt 0) {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "        Warning: Uncommitted changes detected" -ForegroundColor Gray
    $checks += $true
} else {
    Write-Host " ✅" -ForegroundColor Green
    $checks += $true
}

# Check 6: Build test
if (-not $SkipBuild) {
    Write-Host "  [6/7] Testing build..." -NoNewline
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $checks += $true
    } else {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "        Build failed - fix errors before deploying" -ForegroundColor Gray
        $checks += $false
    }
} else {
    Write-Host "  [6/7] Skipping build test..." -NoNewline
    Write-Host " ⊘" -ForegroundColor Gray
    $checks += $true
}

# Check 7: Domain in SEO files
Write-Host "  [7/7] Verifying domain in SEO files..." -NoNewline
$metadataContent = Get-Content "src\lib\seo\metadata.ts" -Raw -ErrorAction SilentlyContinue
if ($metadataContent -match "hobbiesspot\.com") {
    Write-Host " ✅" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "        Domain may not be set to hobbiesspot.com" -ForegroundColor Gray
    $checks += $true
}

Write-Host ""

# Summary
$passed = ($checks | Where-Object { $_ -eq $true }).Count
$total = $checks.Count

if ($passed -lt $total) {
    Write-Host "❌ Pre-deployment checks failed ($passed/$total passed)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before deploying." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All pre-deployment checks passed! ($passed/$total)" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 2: Verify Vercel Authentication
# ============================================================================
Write-Host "📋 Step 2: Vercel Authentication" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════" -ForegroundColor Gray
Write-Host ""

vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 Please login to Vercel:" -ForegroundColor Cyan
    vercel login
    Write-Host ""
}

# ============================================================================
# STEP 3: SEO Pre-Deployment Summary
# ============================================================================
Write-Host "📋 Step 3: SEO Configuration Summary" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════" -ForegroundColor Gray
Write-Host ""

Write-Host "  SEO Components:" -ForegroundColor Cyan
Write-Host "    • Metadata Generator (generateSEOMetadata)" -ForegroundColor Gray
Write-Host "    • Structured Data (Schema.org JSON-LD)" -ForegroundColor Gray
Write-Host "    • Dynamic Sitemap (sitemap.ts)" -ForegroundColor Gray
Write-Host "    • Robots.txt" -ForegroundColor Gray
Write-Host ""

Write-Host "  Domain Configuration:" -ForegroundColor Cyan
Write-Host "    • Primary: hobbiesspot.com" -ForegroundColor Gray
Write-Host "    • WWW: www.hobbiesspot.com" -ForegroundColor Gray
Write-Host ""

Write-Host "  After deployment, verify:" -ForegroundColor Cyan
Write-Host "    • https://hobbiesspot.com/sitemap.xml" -ForegroundColor Gray
Write-Host "    • https://hobbiesspot.com/robots.txt" -ForegroundColor Gray
Write-Host "    • Meta tags in page source" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 4: Deploy to Vercel
# ============================================================================
Write-Host "📋 Step 4: Deploying to Vercel" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════" -ForegroundColor Gray
Write-Host ""

if ($Preview) {
    Write-Host "🔍 Deploying to PREVIEW environment..." -ForegroundColor Yellow
    Write-Host ""
    vercel
} else {
    Write-Host "🚀 Deploying to PRODUCTION environment..." -ForegroundColor Magenta
    Write-Host ""
    vercel --prod
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check logs: vercel logs --follow" -ForegroundColor Gray
    Write-Host "  2. Verify environment variables in Vercel dashboard" -ForegroundColor Gray
    Write-Host "  3. Check DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║              ✅ Deployment Successful! 🎉                  ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 5: Post-Deployment Verification
# ============================================================================
Write-Host "📋 Step 5: Post-Deployment Verification" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════" -ForegroundColor Gray
Write-Host ""

Write-Host "🧪 Test these URLs after deployment:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Homepage:" -ForegroundColor White
Write-Host "    https://hobbiesspot.com" -ForegroundColor Gray
Write-Host ""
Write-Host "  SEO Files:" -ForegroundColor White
Write-Host "    https://hobbiesspot.com/sitemap.xml" -ForegroundColor Gray
Write-Host "    https://hobbiesspot.com/robots.txt" -ForegroundColor Gray
Write-Host ""
Write-Host "  SEO Testing Tools:" -ForegroundColor White
Write-Host "    • Google Rich Results: https://search.google.com/test/rich-results" -ForegroundColor Gray
Write-Host "    • Facebook Debugger: https://developers.facebook.com/tools/debug" -ForegroundColor Gray
Write-Host "    • Twitter Validator: https://cards-dev.twitter.com/validator" -ForegroundColor Gray
Write-Host "    • PageSpeed Insights: https://pagespeed.web.dev" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Configure Custom Domain:" -ForegroundColor White
Write-Host "     • Go to Vercel Dashboard → Project → Settings → Domains" -ForegroundColor Gray
Write-Host "     • Add: hobbiesspot.com and www.hobbiesspot.com" -ForegroundColor Gray
Write-Host "     • Update DNS records at your registrar" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Add Environment Variables:" -ForegroundColor White
Write-Host "     • Settings → Environment Variables" -ForegroundColor Gray
Write-Host "     • Add all variables from .env.production" -ForegroundColor Gray
Write-Host "     • Or run: .\sync-env-to-vercel.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Deploy Socket.io Server:" -ForegroundColor White
Write-Host "     • Go to https://render.com/dashboard" -ForegroundColor Gray
Write-Host "     • Create new Web Service" -ForegroundColor Gray
Write-Host "     • Use settings from render.yaml" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Submit to Google Search Console:" -ForegroundColor White
Write-Host "     • Add property: hobbiesspot.com" -ForegroundColor Gray
Write-Host "     • Submit sitemap: https://hobbiesspot.com/sitemap.xml" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Monitor Deployment:" -ForegroundColor White
Write-Host "     • Check Vercel logs: vercel logs --follow" -ForegroundColor Gray
Write-Host "     • Test all critical features" -ForegroundColor Gray
Write-Host "     • Monitor error rates" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   • Complete Guide: DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "   • Quick Start: QUICK_DEPLOY.md" -ForegroundColor Gray
Write-Host "   • Checklist: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Congratulations! Your application is deployed with full SEO setup!" -ForegroundColor Green
Write-Host ""
