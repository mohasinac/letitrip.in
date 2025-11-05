# PowerShell script to update admin routes from Bearer token to session auth
# This script will update all route.ts files that use Bearer token authentication

Write-Host "Starting admin routes update..." -ForegroundColor Green
Write-Host ""

# Files to update
$filesToUpdate = @(
    "src/app/(backend)/api/admin/reviews/route.ts",
    "src/app/(backend)/api/admin/support/route.ts",
    "src/app/(backend)/api/admin/sales/route.ts",
    "src/app/(backend)/api/admin/sales/[id]/toggle/route.ts",
    "src/app/(backend)/api/admin/shipments/route.ts",
    "src/app/(backend)/api/admin/shipments/[id]/cancel/route.ts",
    "src/app/(backend)/api/admin/shipments/[id]/track/route.ts",
    "src/app/(backend)/api/admin/orders/[id]/cancel/route.ts",
    "src/app/(backend)/api/admin/migrate-products/route.ts",
    "src/app/(backend)/api/admin/hero-slides/route.ts",
    "src/app/(backend)/api/admin/hero-settings/route.ts",
    "src/app/(backend)/api/admin/coupons/route.ts",
    "src/app/(backend)/api/admin/coupons/[id]/toggle/route.ts",
    "src/app/(backend)/api/admin/bulk/route.ts",
    "src/app/(backend)/api/admin/bulk/export/route.ts",
    "src/app/(backend)/api/admin/bulk/[id]/route.ts",
    "src/app/(backend)/api/admin/categories/batch-update/route.ts"
)

$count = 0
$total = $filesToUpdate.Count

foreach ($file in $filesToUpdate) {
    $count++
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "[$count/$total] ⚠ Skipping (not found): $file" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "[$count/$total] 🔄 Updating: $file" -ForegroundColor Cyan
    
    # Read file content
    $content = Get-Content $fullPath -Raw
    
    # Replace imports
    $content = $content -replace "import \{ getAdminAuth \} from '[^']+';", "import { verifyAdminSession } from '../../_lib/auth/admin-auth';"
    $content = $content -replace "import \{ getAdminAuth, getAdminDb \} from '[^']+';", "import { verifyAdminSession } from '../../_lib/auth/admin-auth';`nimport { getAdminDb } from '../../_lib/database/admin';"
    
    # Remove verifyAdminAuth function definition
    $content = $content -replace "(?s)/\*\*\s*\*\s*Verify admin authentication\s*\*/\s*async function verifyAdminAuth\(request: NextRequest\) \{[^\}]+\}\s*\}\s*\}", ""
    
    # Replace verifyAdminAuth calls with verifyAdminSession
    $content = $content -replace "const user = await verifyAdminAuth\(request\);", "const session = await verifyAdminSession(request);"
    
    # Replace user parameter with session object
    $content = $content -replace ", user\)", ", {`n      uid: session.userId,`n      role: session.role,`n      email: session.email,`n    })"
    
    # Write back to file
    Set-Content $fullPath $content -NoNewline
    
    Write-Host "[$count/$total] ✓ Updated: $file" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Update complete! Updated $count files." -ForegroundColor Green
Write-Host ""
Write-Host "⚠ Note: Some files may need manual adjustment for complex cases" -ForegroundColor Yellow
