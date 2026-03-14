<#
.SYNOPSIS
  Pulls Vercel environment variables into .env.local (wraps `vercel env pull`).

.DESCRIPTION
  Creates a backup of the current .env.local, then overwrites it with
  the development environment variables from Vercel.

.PARAMETER NoBackup
  Skip creating a backup of the existing .env.local.

.EXAMPLE
  .\scripts\pull-env-from-vercel.ps1
  .\scripts\pull-env-from-vercel.ps1 -NoBackup
#>
param(
  [switch]$NoBackup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$envFile = Join-Path (Join-Path $PSScriptRoot "..") ".env.local"

# Backup existing file
if ((Test-Path $envFile) -and -not $NoBackup) {
  $backupPath = "$envFile.bak"
  Copy-Item -Path $envFile -Destination $backupPath -Force
  Write-Host "Backed up .env.local to .env.local.bak" -ForegroundColor Cyan
}

Write-Host "Pulling environment variables from Vercel..." -ForegroundColor Cyan
vercel env pull $envFile
Write-Host "`nDone. Variables written to .env.local" -ForegroundColor Green
