# Master Migration Script - Updates ALL API routes to use session-based authentication
# Runs both admin and seller route migrations

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 Session Authentication Migration Tool                ║" -ForegroundColor Cyan
Write-Host "║   Converting Bearer Token Auth → Session-Based Auth       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Check if we're in the right directory
if (-not (Test-Path "src\app\(backend)\api")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📍 Working Directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Step 1: Migrate Admin Routes
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 1: Migrating Admin Routes" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& ".\scripts\migrate-admin-routes.ps1"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 2: Migrating Seller Routes" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& ".\scripts\migrate-seller-routes.ps1"

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ All Migrations Completed!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️  Total Time: $($duration.TotalSeconds.ToString('0.00')) seconds" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the changes in your git diff" -ForegroundColor White
Write-Host "  2. Test your admin and seller dashboards" -ForegroundColor White
Write-Host "  3. Check for any remaining 401/403 errors" -ForegroundColor White
Write-Host "  4. Commit the changes if everything works" -ForegroundColor White
Write-Host ""
