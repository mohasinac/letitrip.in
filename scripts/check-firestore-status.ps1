# Check Firestore Deployment Status
# This script checks the status of Firestore indices and rules

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Firestore Deployment Status" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Firebase CLI not found." -ForegroundColor Red
    Write-Host "   Please install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Display current project
Write-Host "Current Firebase project:" -ForegroundColor Blue
firebase use
Write-Host ""

# Check indices status
Write-Host "Firestore Indices Status:" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Gray
firebase firestore:indexes

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Display quick links
Write-Host "Quick Links:" -ForegroundColor Blue
Write-Host ""
Write-Host "   Firestore Console:" -ForegroundColor Yellow
Write-Host "      https://console.firebase.google.com/project/_/firestore" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Indices Management:" -ForegroundColor Yellow
Write-Host "      https://console.firebase.google.com/project/_/firestore/indexes" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Security Rules:" -ForegroundColor Yellow
Write-Host "      https://console.firebase.google.com/project/_/firestore/rules" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Storage Rules:" -ForegroundColor Yellow
Write-Host "      https://console.firebase.google.com/project/_/storage/rules" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Realtime Database Rules:" -ForegroundColor Yellow
Write-Host "      https://console.firebase.google.com/project/_/database/rules" -ForegroundColor Cyan
Write-Host ""

# Check for pending indices
Write-Host "Tips:" -ForegroundColor Blue
Write-Host "   * Indices can take several minutes to build" -ForegroundColor Gray
Write-Host "   * Check status regularly after deployment" -ForegroundColor Gray
Write-Host "   * Delete unused indices to reduce costs" -ForegroundColor Gray
Write-Host ""
