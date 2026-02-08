# Sync Environment Variables to Vercel
# This script reads .env.local and syncs all variables to Vercel

param(
    [string]$EnvFile = ".env.local",
    [string]$Environment = "production,preview,development",
    [switch]$DryRun = $false
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Sync Environment Variables to Vercel" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Vercel CLI not found." -ForegroundColor Red
    Write-Host "   Please install it with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "[ERROR] File not found: $EnvFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading environment variables from: $EnvFile" -ForegroundColor Blue
Write-Host ""

# Parse .env.local file
$envVars = @{}
$lineNumber = 0

Get-Content $EnvFile | ForEach-Object {
    $lineNumber++
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ($line -eq "" -or $line.StartsWith("#")) {
        return
    }
    
    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove surrounding quotes if present
        if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
        Write-Host "[Line $lineNumber] Found: $key" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN MODE] - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Variables that would be synced:" -ForegroundColor Blue
    foreach ($key in $envVars.Keys | Sort-Object) {
        Write-Host "  - $key" -ForegroundColor Cyan
    }
    exit 0
}

# Confirm sync
Write-Host "This will sync variables to Vercel environments: $Environment" -ForegroundColor Yellow
$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "[CANCELLED] Sync cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting sync..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$failedCount = 0
$skippedCount = 0
$failedVars = @()

foreach ($key in $envVars.Keys | Sort-Object) {
    $value = $envVars[$key]
    
    Write-Host "Processing: $key" -ForegroundColor Blue
    
    # Try to update first (remove old, add new)
    # Vercel doesn't have a direct "update" command, so we remove and re-add
    
    try {
        # Check if variable exists by listing
        $existingVars = vercel env ls $Environment 2>$null | Out-String
        
        if ($existingVars -match $key) {
            Write-Host "  Removing existing variable..." -ForegroundColor Gray
            
            # Remove from all specified environments
            $envs = $Environment -split ","
            foreach ($env in $envs) {
                $env = $env.Trim()
                # Use --yes to auto-confirm
                vercel env rm $key $env --yes 2>&1 | Out-Null
            }
            
            Start-Sleep -Milliseconds 500
        }
        
        # Add the variable
        Write-Host "  Adding variable to: $Environment" -ForegroundColor Gray
        
        # Create a temporary file with the value
        $tempFile = [System.IO.Path]::GetTempFileName()
        Set-Content -Path $tempFile -Value $value -NoNewline
        
        # Add to Vercel using stdin pipe
        $addResult = Get-Content $tempFile | vercel env add $key $Environment --force 2>&1
        
        # Clean up temp file
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [SUCCESS] $key synced" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  [FAILED] $key - $addResult" -ForegroundColor Red
            $failedCount++
            $failedVars += $key
        }
        
    } catch {
        Write-Host "  [ERROR] $key - $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
        $failedVars += $key
    }
    
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Sync Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] $successCount variables synced" -ForegroundColor Green
Write-Host "[FAILED]  $failedCount variables failed" -ForegroundColor Red
Write-Host ""

if ($failedVars.Count -gt 0) {
    Write-Host "Failed variables:" -ForegroundColor Yellow
    foreach ($var in $failedVars) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "To manually add a variable:" -ForegroundColor Blue
    Write-Host "  vercel env add VARIABLE_NAME production,preview,development" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "View environment variables:" -ForegroundColor Blue
Write-Host "  https://vercel.com/dashboard/[project]/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or using CLI:" -ForegroundColor Blue
Write-Host "  vercel env ls" -ForegroundColor Cyan
Write-Host ""

if ($failedCount -gt 0) {
    exit 1
}

exit 0
