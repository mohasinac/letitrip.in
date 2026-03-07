<#
.SYNOPSIS
    Build and deploy Firebase Cloud Functions.

.DESCRIPTION
    Compiles TypeScript, then deploys all functions (or a named subset) to Firebase.

.PARAMETER FunctionName
    Optional. Deploy a single function by name (e.g. -FunctionName auctionSettlement).

.PARAMETER OnlyBuild
    Compile only — do not deploy.

.EXAMPLE
    .\scripts\deploy-functions.ps1
    .\scripts\deploy-functions.ps1 -FunctionName auctionSettlement
    .\scripts\deploy-functions.ps1 -OnlyBuild
#>

param(
    [string]$FunctionName = "",
    [switch]$OnlyBuild
)

$ErrorActionPreference = "Stop"
$Root   = Split-Path -Parent $PSScriptRoot
$FnDir  = Join-Path $Root "functions"

Write-Host ""
Write-Host "=== LetItRip Functions Deploy ===" -ForegroundColor Cyan
Write-Host "Functions directory: $FnDir" -ForegroundColor Gray
Write-Host ""

# ── 1. Install dependencies ──────────────────────────────────────────────────
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Push-Location $FnDir
try {
    $prevPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    npm ci --prefer-offline 2>&1 | Where-Object { $_ -notmatch "EBADENGINE" } | Out-Host
    $ErrorActionPreference = $prevPref
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
}
finally {
    Pop-Location
}

# ── 2. Build TypeScript ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "Compiling TypeScript..." -ForegroundColor Yellow
Push-Location $FnDir
try {
    npx tsc --noEmit 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation errors found" }
    npm run build 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Build succeeded." -ForegroundColor Green

if ($OnlyBuild) {
    Write-Host "Skipping deploy (--OnlyBuild flag set)." -ForegroundColor Gray
    exit 0
}

# ── 3. Deploy ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
Push-Location $Root
try {
    if ($FunctionName) {
        Write-Host "Deploying single function: $FunctionName" -ForegroundColor Cyan
        firebase deploy --only "functions:$FunctionName" 2>&1 | Out-Host
    } else {
        Write-Host "Deploying all functions" -ForegroundColor Cyan
        firebase deploy --only functions 2>&1 | Out-Host
    }
    if ($LASTEXITCODE -ne 0) { throw "Firebase deploy failed" }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Deploy complete ===" -ForegroundColor Green
