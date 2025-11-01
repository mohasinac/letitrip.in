# Migration Runner Script
# Migrates seller-specific collections to common collections

Write-Host "🚀 Collection Migration Runner" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Firebase is logged in
Write-Host "Checking Firebase authentication..." -ForegroundColor Yellow
$firebaseStatus = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase. Please run: firebase login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Firebase authenticated`n" -ForegroundColor Green

# Set Firebase project
Write-Host "Setting Firebase project to justforview1..." -ForegroundColor Yellow
firebase use justforview1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set Firebase project" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project set to justforview1`n" -ForegroundColor Green

# Confirm migration
Write-Host "⚠️  WARNING: This will migrate data from:" -ForegroundColor Yellow
Write-Host "   • seller_orders → orders" -ForegroundColor White
Write-Host "   • seller_coupons → coupons" -ForegroundColor White
Write-Host "   • seller_sales → sales" -ForegroundColor White
Write-Host "   • seller_shipments → shipments" -ForegroundColor White
Write-Host "   • seller_alerts → alerts" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Red
    exit 0
}

# Run migration script
Write-Host "`n🚀 Running migration script...`n" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

node scripts\migrate-collections.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Check Firebase Console to verify data: https://console.firebase.google.com/project/justforview1/firestore" -ForegroundColor White
    Write-Host "   2. Test your application thoroughly" -ForegroundColor White
    Write-Host "   3. Once verified, consider backing up old collections before deletion" -ForegroundColor White
} else {
    Write-Host "`n❌ Migration failed! Check the errors above." -ForegroundColor Red
    exit 1
}
