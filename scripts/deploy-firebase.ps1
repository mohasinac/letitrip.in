# Firebase Setup and Deployment Script
# This script helps deploy Firebase rules, indexes, and configuration

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Firebase Setup & Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if firebase-tools is installed
Write-Host "Checking Firebase CLI installation..." -ForegroundColor Yellow
$firebaseCheck = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseCheck) {
    Write-Host "Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
    Write-Host "Firebase CLI installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Firebase CLI is already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Step 1: Login to Firebase" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running: firebase login" -ForegroundColor White
firebase login

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Step 2: Set Firebase Project" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setting project to: letitrip-in-app" -ForegroundColor White
firebase use letitrip-in-app

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Step 3: Deploy Firestore Rules" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploying Firestore security rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Step 4: Deploy Firestore Indexes" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploying Firestore indexes..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Step 5: Deploy Storage Rules" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploying Storage security rules..." -ForegroundColor Yellow
firebase deploy --only storage

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Step 6: Deploy Realtime Database Rules" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploying Realtime Database rules..." -ForegroundColor Yellow
firebase deploy --only database

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/project/letitrip-in-app" -ForegroundColor White
Write-Host "2. Enable Authentication -> Email/Password provider" -ForegroundColor White
Write-Host "3. Verify Firestore Database is created" -ForegroundColor White
Write-Host "4. Verify Storage bucket is created" -ForegroundColor White
Write-Host "5. Verify Realtime Database is created" -ForegroundColor White
Write-Host ""
Write-Host "Project Details:" -ForegroundColor Cyan
Write-Host "  Project ID: letitrip-in-app" -ForegroundColor White
Write-Host "  Region: Asia Southeast 1" -ForegroundColor White
Write-Host "  Repository: https://github.com/mohasinac/letitrip.in" -ForegroundColor White
Write-Host ""
