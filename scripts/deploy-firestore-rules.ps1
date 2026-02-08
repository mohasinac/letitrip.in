# Deploy Firestore Rules
# This script deploys Firestore security rules to production

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deploying Firestore Rules" -ForegroundColor Cyan
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
Write-Host "Rules files:" -ForegroundColor Blue
Write-Host "   * firestore.rules (Firestore security rules)" -ForegroundColor Cyan
Write-Host "   * storage.rules (Storage security rules)" -ForegroundColor Cyan
Write-Host "   * database.rules.json (Realtime DB rules)" -ForegroundColor Cyan
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy ALL security rules? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "[CANCELLED] Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying rules..." -ForegroundColor Green

# Deploy all rules
firebase deploy --only firestore:rules,storage:rules,database:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Rules deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View rules in Firebase Console:" -ForegroundColor Blue
    Write-Host "   https://console.firebase.google.com/project/_/firestore/rules" -ForegroundColor Cyan
    Write-Host "   https://console.firebase.google.com/project/_/storage/rules" -ForegroundColor Cyan
    Write-Host "   https://console.firebase.google.com/project/_/database/rules" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
    exit 1
}
