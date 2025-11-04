# Migrate imports from @/types to @/types/shared
# This script updates all import statements to use the new organized structure

Write-Host "Migrating type imports..." -ForegroundColor Cyan

$rootPath = "d:\proj\justforview.in\src"
$fileCount = 0
$updateCount = 0

# Find all TypeScript and TypeScript React files
$files = Get-ChildItem -Path $rootPath -Include "*.ts","*.tsx" -Recurse -File | 
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileUpdated = $false
    
    # Pattern 1: import { Types } from "@/types"
    # Replace with: import { Types } from "@/types/shared"
    if ($content -match 'from\s+[''"]@/types[''"]') {
        $content = $content -replace 'from\s+([''"])@/types\1', 'from $1@/types/shared$1'
        $fileUpdated = $true
    }
    
    # Pattern 2: import type { Types } from "@/types"
    # Replace with: import type { Types } from "@/types/shared"
    if ($content -match 'from\s+[''"]@/types[''"]') {
        $content = $content -replace 'from\s+([''"])@/types\1', 'from $1@/types/shared$1'
        $fileUpdated = $true
    }
    
    # Write changes if file was modified
    if ($fileUpdated -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $relativePath = $file.FullName.Replace($rootPath, "src")
        Write-Host "Updated: $relativePath" -ForegroundColor Green
        $updateCount++
    }
    
    $fileCount++
}

Write-Host ""
Write-Host "Migration complete!" -ForegroundColor Cyan
Write-Host "Files scanned: $fileCount" -ForegroundColor White
Write-Host "Files updated: $updateCount" -ForegroundColor Green
