# Sync Environment Variables to Vercel
# This script reads .env.local and syncs all variables to Vercel
# - If a variable exists on Vercel, it removes and re-adds it (update)
# - If a variable doesn't exist, it adds it
# - If a Vercel variable is not in .env.local, it deletes it

param(
    [string]$EnvFile = ".env.local",
    [switch]$DryRun = $false,
    [switch]$SkipDelete = $false
)

$environments = @("production", "preview", "development")

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

# Check if project is linked
if (-not (Test-Path ".vercel/project.json")) {
    Write-Host "[ERROR] Project not linked to Vercel. Run 'vercel link' first." -ForegroundColor Red
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
Write-Host "Found $($envVars.Count) environment variables in $EnvFile" -ForegroundColor Green
Write-Host ""

# Get existing Vercel env vars
Write-Host "Fetching existing Vercel environment variables..." -ForegroundColor Blue
$existingRaw = vercel env ls 2>&1 | Out-String
$existingKeys = @()

# Parse vercel env ls output - extract variable names (lines that start with a variable-like name)
foreach ($line in $existingRaw -split "`n") {
    $trimmed = $line.Trim()
    # Match lines that look like env var entries (name followed by spaces/tabs and environment info)
    if ($trimmed -match '^([A-Z][A-Z0-9_]+)\s') {
        $varName = $matches[1].Trim()
        if ($varName -ne "Name" -and $existingKeys -notcontains $varName) {
            $existingKeys += $varName
        }
    }
}

Write-Host "Found $($existingKeys.Count) existing variables on Vercel" -ForegroundColor Green
Write-Host ""

# Determine actions
$toAdd = @()
$toUpdate = @()
$toDelete = @()

foreach ($key in $envVars.Keys | Sort-Object) {
    if ($existingKeys -contains $key) {
        $toUpdate += $key
    } else {
        $toAdd += $key
    }
}

if (-not $SkipDelete) {
    foreach ($key in $existingKeys) {
        if (-not $envVars.ContainsKey($key)) {
            $toDelete += $key
        }
    }
}

Write-Host "Plan:" -ForegroundColor Yellow
Write-Host "  [ADD]    $($toAdd.Count) new variables" -ForegroundColor Green
Write-Host "  [UPDATE] $($toUpdate.Count) existing variables" -ForegroundColor Blue
Write-Host "  [DELETE] $($toDelete.Count) variables not in $EnvFile" -ForegroundColor Red

if ($toAdd.Count -gt 0) {
    Write-Host ""
    Write-Host "  New: $($toAdd -join ', ')" -ForegroundColor Green
}
if ($toDelete.Count -gt 0) {
    Write-Host ""
    Write-Host "  Delete: $($toDelete -join ', ')" -ForegroundColor Red
}
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] No changes made." -ForegroundColor Yellow
    exit 0
}

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "[CANCELLED]" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting sync..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$failedCount = 0
$deletedCount = 0
$failedVars = @()

# Helper function to add a variable to all environments
function Add-VercelEnv {
    param([string]$Name, [string]$Value)
    
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $Value -NoNewline
    
    $allOk = $true
    foreach ($env in $environments) {
        $result = Get-Content $tempFile | vercel env add $Name $env --force 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) {
            # Check if it's a "already exists" error - try remove then add
            if ($result -match "already exists") {
                vercel env rm $Name $env --yes 2>&1 | Out-Null
                Start-Sleep -Milliseconds 300
                $result = Get-Content $tempFile | vercel env add $Name $env --force 2>&1 | Out-String
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "    [FAILED] $env - $($result.Trim())" -ForegroundColor Red
                    $allOk = $false
                }
            } else {
                Write-Host "    [FAILED] $env - $($result.Trim())" -ForegroundColor Red
                $allOk = $false
            }
        }
    }
    
    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    return $allOk
}

# Helper function to remove a variable from all environments
function Remove-VercelEnv {
    param([string]$Name)
    
    $allOk = $true
    foreach ($env in $environments) {
        $result = vercel env rm $Name $env --yes 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0 -and $result -notmatch "not found") {
            $allOk = $false
        }
    }
    return $allOk
}

# Process UPDATES (remove then add)
foreach ($key in $toUpdate) {
    Write-Host "[UPDATE] $key" -ForegroundColor Blue
    
    # Remove from all environments first
    foreach ($env in $environments) {
        vercel env rm $key $env --yes 2>&1 | Out-Null
    }
    Start-Sleep -Milliseconds 300
    
    # Add back with new value
    $ok = Add-VercelEnv -Name $key -Value $envVars[$key]
    if ($ok) {
        Write-Host "  [OK] Updated" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  [FAILED] Could not update" -ForegroundColor Red
        $failedCount++
        $failedVars += $key
    }
}

# Process ADDS
foreach ($key in $toAdd) {
    Write-Host "[ADD] $key" -ForegroundColor Green
    
    $ok = Add-VercelEnv -Name $key -Value $envVars[$key]
    if ($ok) {
        Write-Host "  [OK] Added" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  [FAILED] Could not add" -ForegroundColor Red
        $failedCount++
        $failedVars += $key
    }
}

# Process DELETES
foreach ($key in $toDelete) {
    Write-Host "[DELETE] $key" -ForegroundColor Red
    
    $ok = Remove-VercelEnv -Name $key
    if ($ok) {
        Write-Host "  [OK] Deleted" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "  [WARN] May not have been fully removed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Sync Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[ADDED/UPDATED] $successCount variables" -ForegroundColor Green
Write-Host "[DELETED]       $deletedCount variables" -ForegroundColor Yellow
Write-Host "[FAILED]        $failedCount variables" -ForegroundColor Red
Write-Host ""

if ($failedVars.Count -gt 0) {
    Write-Host "Failed variables:" -ForegroundColor Yellow
    foreach ($var in $failedVars) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Verify with: vercel env ls" -ForegroundColor Cyan
Write-Host ""

if ($failedCount -gt 0) {
    exit 1
}

exit 0
