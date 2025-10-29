# Firebase Auth Migration Script
# This script helps migrate API routes from JWT middleware to Firebase token auth

Write-Host "Firebase Authentication Migration Tool" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Find all files using JWT middleware
Write-Host "Step 1: Finding files using JWT middleware..." -ForegroundColor Yellow

$patterns = @(
    @{Old = "createAdminHandler"; New = "createFirebaseAdminHandler"; From = "@/lib/auth/api-middleware"; To = "@/lib/auth/firebase-api-auth" },
    @{Old = "createSellerHandler"; New = "createFirebaseSellerHandler"; From = "@/lib/auth/api-middleware"; To = "@/lib/auth/firebase-api-auth" },
    @{Old = "createUserHandler"; New = "createFirebaseUserHandler"; From = "@/lib/auth/api-middleware"; To = "@/lib/auth/firebase-api-auth" }
)

$apiRoutesPath = "src\app\api"
$totalFiles = 0
$updatedFiles = 0

foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path $apiRoutesPath -Filter "*.ts" -Recurse | 
    Select-String -Pattern $pattern.Old -List |
    Select-Object -ExpandProperty Path -Unique

    foreach ($file in $files) {
        $totalFiles++
        Write-Host "Processing: $file" -ForegroundColor Gray
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Replace import
        $content = $content -replace [regex]::Escape("import { $($pattern.Old) } from '$($pattern.From)';"), "import { $($pattern.New) } from '$($pattern.To)';"
        
        # Replace handler usage
        $content = $content -replace "export const (GET|POST|PUT|DELETE|PATCH) = $($pattern.Old)", "export const `$1 = $($pattern.New)"
        
        # Replace user.userId with user.uid
        $content = $content -replace "user\.userId", "user.uid"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            $updatedFiles++
            Write-Host "  ✓ Updated" -ForegroundColor Green
        }
        else {
            Write-Host "  - No changes needed" -ForegroundColor DarkGray
        }
    }
}

Write-Host ""
Write-Host "Step 2: Update service files to use apiClient..." -ForegroundColor Yellow

$servicesPath = "src\lib\services"
$serviceFiles = Get-ChildItem -Path $servicesPath -Filter "*.ts" -Recurse | 
Select-String -Pattern "credentials: `"include`"" -List |
Select-Object -ExpandProperty Path -Unique

foreach ($file in $serviceFiles) {
    Write-Host "Service: $file" -ForegroundColor Gray
    Write-Host "  ! Manual review needed - Check FIREBASE_AUTH_MIGRATION.md" -ForegroundColor Magenta
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Migration Summary:" -ForegroundColor Cyan
Write-Host "  Files processed: $totalFiles" -ForegroundColor White
Write-Host "  Files updated: $updatedFiles" -ForegroundColor Green
Write-Host "  Services needing review: $($serviceFiles.Count)" -ForegroundColor Magenta
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes in git" -ForegroundColor White
Write-Host "  2. Update service files manually (see docs/FIREBASE_AUTH_MIGRATION.md)" -ForegroundColor White
Write-Host "  3. Test authentication flows" -ForegroundColor White
Write-Host "  4. Run: npm run build" -ForegroundColor White
Write-Host ""
