# Fix Next.js 16 async params in all dynamic route files

$files = @(
    "src\app\api\admin\static-assets\[id]\route.ts",
    "src\app\api\auctions\[id]\route.ts",
    "src\app\api\blog\[slug]\route.ts",
    "src\app\api\cart\[itemId]\route.ts",
    "src\app\api\categories\[slug]\route.ts",
    "src\app\api\coupons\[code]\route.ts",
    "src\app\api\favorites\[productId]\route.ts",
    "src\app\api\orders\[id]\route.ts",
    "src\app\api\payouts\[id]\route.ts",
    "src\app\api\products\[slug]\route.ts",
    "src\app\api\returns\[id]\route.ts",
    "src\app\api\reviews\[id]\route.ts",
    "src\app\api\shops\[slug]\route.ts",
    "src\app\api\tickets\[id]\route.ts",
    "src\app\api\user\addresses\[id]\route.ts"
)

$paramPatterns = @(
    @{ old = '{ params }: { params: { id: string } }'; new = '{ params }: { params: Promise<{ id: string }> }'; extract = 'const { id } = await params;' },
    @{ old = '{ params }: { params: { slug: string } }'; new = '{ params }: { params: Promise<{ slug: string }> }'; extract = 'const { slug } = await params;' },
    @{ old = '{ params }: { params: { code: string } }'; new = '{ params }: { params: Promise<{ code: string }> }'; extract = 'const { code } = await params;' },
    @{ old = '{ params }: { params: { productId: string } }'; new = '{ params }: { params: Promise<{ productId: string }> }'; extract = 'const { productId } = await params;' },
    @{ old = '{ params }: { params: { itemId: string } }'; new = '{ params }: { params: Promise<{ itemId: string }> }'; extract = 'const { itemId } = await params;' }
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        $modified = $false

        foreach ($pattern in $paramPatterns) {
            if ($content -match [regex]::Escape($pattern.old)) {
                Write-Host "  - Found pattern: $($pattern.old)" -ForegroundColor Yellow
                
                # Replace the params type
                $content = $content -replace [regex]::Escape($pattern.old), $pattern.new
                
                # Add await params extraction after function signature
                # Look for pattern: export async function METHOD(\n  req: NextRequest,\n  { params }: ...)\n) {\n  try {
                $content = $content -replace '(export async function \w+\([^)]+\) \{\s*try \{)', "`$1`n    $($pattern.extract)"
                
                $modified = $true
            }
        }

        if ($modified) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Updated successfully" -ForegroundColor Green
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green
