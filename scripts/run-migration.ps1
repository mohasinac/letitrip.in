# PowerShell script to run the migration with environment variables loaded
Write-Host "Loading environment variables from .env.local..." -ForegroundColor Cyan

# Read and set environment variables from .env.local
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
        Write-Host "Set $name" -ForegroundColor Green
    }
}

Write-Host "`nRunning migration script..." -ForegroundColor Cyan
node scripts/migrate-products.js

Write-Host "`nMigration script completed" -ForegroundColor Green
