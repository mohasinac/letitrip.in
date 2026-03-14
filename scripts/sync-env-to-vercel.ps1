<#
.SYNOPSIS
  Syncs .env.local → Vercel environment variables for all environments
  (production, preview, development).

.DESCRIPTION
  - Adds new variables that exist locally but not on Vercel.
  - Updates existing variables whose names match.
  - Removes Vercel variables that no longer exist in .env.local (with confirmation).
  - Skips blank lines and comments in .env.local.

.PARAMETER DryRun
  Show what would happen without making changes.

.PARAMETER SkipRemove
  Skip removal of Vercel-only variables (add/update only).

.EXAMPLE
  .\scripts\sync-env-to-vercel.ps1
  .\scripts\sync-env-to-vercel.ps1 -DryRun
  .\scripts\sync-env-to-vercel.ps1 -SkipRemove
#>
param(
  [switch]$DryRun,
  [switch]$SkipRemove
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$envFile = Join-Path (Join-Path $PSScriptRoot "..") ".env.local"
if (-not (Test-Path $envFile)) {
  Write-Host "ERROR: .env.local not found at $envFile" -ForegroundColor Red
  exit 1
}

# ── Parse .env.local ─────────────────────────────────────────────────────────
$localVars = [ordered]@{}
foreach ($line in [System.IO.File]::ReadAllLines((Resolve-Path $envFile).Path)) {
  $trimmed = $line.Trim()
  if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
  $eqIdx = $trimmed.IndexOf("=")
  if ($eqIdx -le 0) { continue }
  $key = $trimmed.Substring(0, $eqIdx).Trim()
  $val = $trimmed.Substring($eqIdx + 1)
  # Strip surrounding quotes if present
  if (($val.StartsWith('"') -and $val.EndsWith('"')) -or
      ($val.StartsWith("'") -and $val.EndsWith("'"))) {
    $val = $val.Substring(1, $val.Length - 2)
  }
  $localVars[$key] = $val
}

Write-Host "`nParsed $($localVars.Count) variables from .env.local" -ForegroundColor Cyan

# ── Fetch current Vercel env var names ───────────────────────────────────────
Write-Host "Fetching Vercel environment variables..." -ForegroundColor Cyan
$oldPref = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$vercelOutput = vercel env ls 2>&1 | Out-String
$ErrorActionPreference = $oldPref

# Extract unique variable names from the listing
$vercelVarNames = [System.Collections.Generic.HashSet[string]]::new()
foreach ($line in $vercelOutput -split "`n") {
  # Lines with env vars start with whitespace + VAR_NAME followed by spaces + "Encrypted"
  if ($line -match '^\s+([A-Za-z_][A-Za-z0-9_]*)\s+Encrypted') {
    [void]$vercelVarNames.Add($Matches[1])
  }
}

Write-Host "Found $($vercelVarNames.Count) unique variables on Vercel`n" -ForegroundColor Cyan

$environments = @("production", "preview", "development")

# Vercel CLI writes version info to stderr; suppress terminating errors for CLI calls
$ErrorActionPreference = "Continue"

# ── Add or Update ────────────────────────────────────────────────────────────
$addCount = 0
$updateCount = 0

foreach ($key in $localVars.Keys) {
  $val = $localVars[$key]
  $exists = $vercelVarNames.Contains($key)

  if ($exists) {
    # Update
    $updateCount++
    foreach ($env in $environments) {
      if ($DryRun) {
        Write-Host "  [DRY-RUN] Would update $key in $env" -ForegroundColor Yellow
      } else {
        Write-Host "  Updating $key in $env..." -ForegroundColor Yellow -NoNewline
        $val | vercel env update $key $env 2>&1 | Out-Null
        Write-Host " done" -ForegroundColor Green
      }
    }
  } else {
    # Add
    $addCount++
    foreach ($env in $environments) {
      if ($DryRun) {
        Write-Host "  [DRY-RUN] Would add $key to $env" -ForegroundColor Green
      } else {
        Write-Host "  Adding $key to $env..." -ForegroundColor Green -NoNewline
        $val | vercel env add $key $env 2>&1 | Out-Null
        Write-Host " done" -ForegroundColor Green
      }
    }
  }
}

# ── Remove Vercel-only variables ─────────────────────────────────────────────
$removeCount = 0
$vercelOnly = $vercelVarNames | Where-Object { -not $localVars.Contains($_) }

if ($vercelOnly -and -not $SkipRemove) {
  Write-Host "`nVariables on Vercel but NOT in .env.local:" -ForegroundColor Magenta
  foreach ($name in $vercelOnly) {
    Write-Host "  - $name" -ForegroundColor Magenta
  }

  if (-not $DryRun) {
    $confirm = Read-Host "`nRemove these from Vercel? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
      foreach ($name in $vercelOnly) {
        $removeCount++
        foreach ($env in $environments) {
          Write-Host "  Removing $name from $env..." -ForegroundColor Red -NoNewline
          vercel env rm $name $env --yes 2>&1 | Out-Null
          Write-Host " done" -ForegroundColor Green
        }
      }
    } else {
      Write-Host "Skipped removal." -ForegroundColor Gray
    }
  } else {
    foreach ($name in $vercelOnly) {
      $removeCount++
      Write-Host "  [DRY-RUN] Would remove $name from all environments" -ForegroundColor Red
    }
  }
} elseif ($SkipRemove -and $vercelOnly) {
  Write-Host "`nSkipped removal of $($vercelOnly.Count) Vercel-only variable(s) (--SkipRemove)" -ForegroundColor Gray
} else {
  Write-Host "`nNo Vercel-only variables to remove." -ForegroundColor Gray
}

# ── Summary ──────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"
$prefix = if ($DryRun) { "[DRY-RUN] " } else { "" }
Write-Host "`n${prefix}Summary: $addCount added, $updateCount updated, $removeCount removed" -ForegroundColor Cyan
