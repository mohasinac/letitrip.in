#!/usr/bin/env pwsh
# Pre-deployment checklist script
# Run: .\pre-deploy-checklist.ps1

Write-Host "📋 Pre-Deployment Checklist for HobbiesSpot" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$checks = @()

# Check 1: Environment files
Write-Host "1️⃣  Checking environment files..." -ForegroundColor Yellow
if (Test-Path ".env.production") {
    Write-Host "   ✅ .env.production exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ .env.production missing" -ForegroundColor Red
    Write-Host "      Create from: .env.production.example" -ForegroundColor Gray
    $checks += $false
}

# Check 2: Node modules
Write-Host "2️⃣  Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ⚠️  node_modules missing - run npm install" -ForegroundColor Yellow
    $checks += $false
}

# Check 3: Build
Write-Host "3️⃣  Testing build..." -ForegroundColor Yellow
Write-Host "   Running: npm run build" -ForegroundColor Gray
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build successful" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ Build failed" -ForegroundColor Red
    Write-Host "   Fix build errors before deploying" -ForegroundColor Gray
    $checks += $false
}

# Check 4: TypeScript
Write-Host "4️⃣  Checking TypeScript..." -ForegroundColor Yellow
$tsOutput = npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ No TypeScript errors" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ⚠️  TypeScript errors found (but build will succeed due to ignoreBuildErrors)" -ForegroundColor Yellow
    $checks += $true  # Warning but not blocking
}

# Check 5: Git status
Write-Host "5️⃣  Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
if ($null -ne $gitStatus -and $gitStatus.Length -gt 0) {
    Write-Host "   ⚠️  Uncommitted changes detected" -ForegroundColor Yellow
    Write-Host "      Commit before deploying for clean history" -ForegroundColor Gray
    $checks += $true  # Warning but not blocking
} else {
    Write-Host "   ✅ Working directory clean" -ForegroundColor Green
    $checks += $true
}

# Check 6: Required env vars
Write-Host "6️⃣  Checking critical environment variables..." -ForegroundColor Yellow
$requiredVars = @(
    "NEXT_PUBLIC_APP_URL",
    "JWT_SECRET",
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY"
)

$envContent = Get-Content .env.production -ErrorAction SilentlyContinue
$missingVars = @()

foreach ($var in $requiredVars) {
    $found = $envContent | Where-Object { $_ -match "^$var=" }
    if ($found) {
        Write-Host "   ✅ $var is set" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $var is missing" -ForegroundColor Red
        $missingVars += $var
    }
}

if ($missingVars.Count -eq 0) {
    $checks += $true
} else {
    $checks += $false
}

# Check 7: Port availability
Write-Host "7️⃣  Checking port availability..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ⚠️  Port 3000 is in use (development server running)" -ForegroundColor Yellow
    $checks += $true  # Warning but not blocking
} else {
    Write-Host "   ✅ Port 3000 is available" -ForegroundColor Green
    $checks += $true
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$passedChecks = ($checks | Where-Object { $_ -eq $true }).Count
$totalChecks = $checks.Count

if ($passedChecks -eq $totalChecks) {
    Write-Host "✅ All checks passed! ($passedChecks/$totalChecks)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ready to deploy!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\deploy-to-vercel.ps1" -ForegroundColor Gray
    Write-Host "  2. Configure domain in Vercel dashboard" -ForegroundColor Gray
    Write-Host "  3. Deploy Socket.io server to Render.com" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "⚠️  Checks passed: $passedChecks/$totalChecks" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above before deploying" -ForegroundColor Red
    exit 1
}
