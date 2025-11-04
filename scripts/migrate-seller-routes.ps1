# PowerShell Script to Migrate Seller Routes from Bearer Token Auth to Session Auth
# This script updates all seller API routes to use session-based authentication

Write-Host "🔄 Starting Seller Routes Migration..." -ForegroundColor Cyan
Write-Host ""

# Get all seller route files
$sellerRoutes = Get-ChildItem -Path "src\app\(backend)\api\seller" -Filter "route.ts" -Recurse

Write-Host "📁 Found $($sellerRoutes.Count) seller route files" -ForegroundColor Yellow
Write-Host ""

$updatedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $sellerRoutes) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "Processing: $relativePath" -ForegroundColor White
    
    try {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check if file uses old authentication
        if ($content -match "getAdminAuth|verifySellerAuth|verifySeller") {
            $originalContent = $content
            
            # Replace import statements
            $content = $content -replace "import \{ getAdminAuth \} from '[^']+';", ""
            $content = $content -replace "import \{ getAdminAuth, getAdminDb \} from '[^']+';", "import { getAdminDb } from '../../_lib/database/admin';"
            $content = $content -replace "import \{ getAdminAuth, getAdminDb, getAdminStorage \} from '[^']+';", "import { getAdminDb, getAdminStorage } from '../../../_lib/database/admin';"
            
            # Add session middleware import if not present
            if ($content -notmatch "requireSeller") {
                # Find the right import path depth
                $depth = ($relativePath -split "\\api\\seller\\").Count - 1
                $pathPrefix = "../" * ($depth + 1)
                $importPath = $pathPrefix + "_lib/auth/session-middleware"
                
                # Add import after other imports
                $content = $content -replace "(import.*from.*;\r?\n)", "`$1import { requireSeller } from '$importPath';`n"
            }
            
            # Remove verifySellerAuth or similar function definitions
            $content = $content -replace "(?s)/\*\*\s*\* Verify seller authentication\s*\*/\s*async function verify\w+Auth\(request: NextRequest\) \{.*?\}", ""
            
            # Replace verifySellerAuth/verifySeller calls with requireSeller pattern
            $content = $content -replace "(?s)const (user|seller) = await verify\w+Auth\(request\);", @"
// Verify seller authentication using session
    const sessionOrError = await requireSeller(request);
    
    // If it's a NextResponse, it's an error response
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError;
    }
    
    const session = sessionOrError;
"@
            
            # Replace await verify...Auth(request); (without assignment)
            $content = $content -replace "await verify\w+Auth\(request\);", @"
// Verify seller authentication using session
    const sessionOrError = await requireSeller(request);
    
    // If it's a NextResponse, it's an error response
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError;
    }
    
    const session = sessionOrError;
"@
            
            # Replace user/seller references with session in controller calls
            $content = $content -replace ",\s*(user|seller)\)", ", {`n      uid: session.userId,`n      role: session.role,`n      email: session.email || undefined,`n    })"
            
            # Remove AuthorizationError handling
            $content = $content -replace "(?s)if \(error instanceof AuthorizationError\) \{.*?\}", ""
            
            # Clean up extra blank lines
            $content = $content -replace "\r?\n\r?\n\r?\n+", "`n`n"
            
            # Only update if content actually changed
            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                Write-Host "  ✅ Updated" -ForegroundColor Green
                $updatedCount++
            } else {
                Write-Host "  ⚠️  No changes needed" -ForegroundColor Yellow
                $skippedCount++
            }
        } else {
            Write-Host "  ⏭️  Already using session auth" -ForegroundColor Gray
            $skippedCount++
        }
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "📊 Migration Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Updated: $updatedCount files" -ForegroundColor Green
Write-Host "  ⏭️  Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host ""

if ($updatedCount -gt 0) {
    Write-Host "🎉 Migration completed! Please review the changes and test your seller routes." -ForegroundColor Green
} else {
    Write-Host "ℹ️  No files needed updating." -ForegroundColor Blue
}
