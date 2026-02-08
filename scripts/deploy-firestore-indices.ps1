# Deploy Firestore Indices
# This script deploys Firestore composite indices to production

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deploying Firestore Indices" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Firebase CLI not found." -ForegroundColor Red
    Write-Host "   Please install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Display current project
Write-Host "Checking Firebase project..." -ForegroundColor Blue
firebase use

Write-Host ""
Write-Host "Index file: firestore.indexes.json" -ForegroundColor Blue
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy indices to Firestore? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "[CANCELLED] Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying indices..." -ForegroundColor Green

# Deploy indices
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Indices deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View indices:" -ForegroundColor Blue
    Write-Host "   https://console.firebase.google.com/project/_/firestore/indexes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check index status:" -ForegroundColor Blue
    Write-Host "   firebase firestore:indexes" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
    exit 1
}
