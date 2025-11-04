# Fix unterminated string literals caused by migration script
# This script fixes import statements that were incorrectly modified

Write-Host "Fixing unterminated string literals..." -ForegroundColor Cyan

$rootPath = "d:\proj\justforview.in\src"
$fileCount = 0
$fixCount = 0

# Find all TypeScript and TypeScript React files with potential issues
$files = Get-ChildItem -Path $rootPath -Include "*.ts","*.tsx" -Recurse -File | 
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }

foreach ($file in $files) {
    $lines = Get-Content -Path $file.FullName
    $originalContent = $lines -join "`n"
    $modified = $false
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        
        # Fix pattern: from '@/types/shared'
        if ($line -match "from\s+'@/types/shared'") {
            $lines[$i] = $line -replace "from\s+'@/types/shared'", 'from "@/types/shared"'
            $modified = $true
        }
        
        # Fix pattern: from "@/types/shared
        if ($line -match 'from\s+"@/types/shared[^"]') {
            $lines[$i] = $line -replace 'from\s+"@/types/shared', 'from "@/types/shared"'
            $modified = $true
        }
    }
    
    if ($modified) {
        $lines | Set-Content -Path $file.FullName
        $relativePath = $file.FullName.Replace($rootPath, "src")
        Write-Host "Fixed: $relativePath" -ForegroundColor Green
        $fixCount++
    }
    
    $fileCount++
}

Write-Host ""
Write-Host "Fix complete!" -ForegroundColor Cyan
Write-Host "Files scanned: $fileCount" -ForegroundColor White
Write-Host "Files fixed: $fixCount" -ForegroundColor Green
