# Script to fix Next.js 15+ async params in all API routes
# Replaces: { params }: { params: { id: string } }
# With: { params }: { params: Promise<{ id: string }> }
# And adds: const { id } = await params;

Write-Host "Fixing async params in API routes..." -ForegroundColor Cyan

$files = @(
    "src\app\api\addresses\[id]\route.ts",
    "src\app\api\seller\coupons\[id]\route.ts",
    "src\app\api\seller\orders\[id]\route.ts",
    "src\app\api\seller\orders\[id]\reject\route.ts",
    "src\app\api\seller\orders\[id]\approve\route.ts",
    "src\app\api\seller\orders\[id]\cancel\route.ts",
    "src\app\api\seller\orders\[id]\invoice\route.ts",
    "src\app\api\seller\coupons\[id]\toggle\route.ts",
    "src\app\api\seller\shipments\[id]\label\route.ts",
    "src\app\api\seller\sales\[id]\route.ts",
    "src\app\api\seller\sales\[id]\toggle\route.ts",
    "src\app\api\seller\shipments\[id]\track\route.ts",
    "src\app\api\seller\shipments\[id]\route.ts",
    "src\app\api\seller\shipments\[id]\cancel\route.ts",
    "src\app\api\seller\alerts\[id]\route.ts",
    "src\app\api\products\[slug]\route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $fullPath) {
        Write-Host "Fixing: $file" -ForegroundColor Yellow
        
        # Read content
        $content = Get-Content $fullPath -Raw
        
        # Replace params type
        $content = $content -replace '\{ params \}: \{ params: \{ ([^}]+) \} \}', '{ params }: { params: Promise<{ $1 }> }'
        
        # Save
        Set-Content $fullPath $content -NoNewline
        
        Write-Host "  ✓ Updated" -ForegroundColor Green
    } else {
        Write-Host "  ! Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! Remember to manually add 'const { id/slug } = await params;' at the start of each function." -ForegroundColor Cyan
