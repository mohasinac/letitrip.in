# publish-all.ps1
# Publishes all @mohasinac/* packages to npm.
#
# USING AN OTP (one-time password from authenticator app):
#   $env:NPM_OTP = "123456"; .\scripts\publish-all.ps1
#
# USING AN AUTOMATION TOKEN (recommended for CI):
#   1. Generate at https://www.npmjs.com/settings/tokens (type: Automation)
#   2. Save as `//registry.npmjs.org/:_authToken=TOKEN` in ~/.npmrc
#   3. Then just run: .\scripts\publish-all.ps1

param(
  [string]$Otp = $env:NPM_OTP
)

$packages = @(
  "contracts","core","tokens","errors","utils","validation",
  "http","next","react","ui","monitoring","seo","security",
  "css-tailwind","css-vanilla",
  "db-firebase","auth-firebase","email-resend","storage-firebase",
  "feat-layout","feat-forms","feat-filters","feat-media","feat-search",
  "feat-categories","feat-blog","feat-reviews","feat-faq","feat-auth",
  "feat-account","feat-homepage","feat-products","feat-wishlist",
  "feat-cart","feat-payments","feat-checkout","feat-orders",
  "feat-admin","feat-events","feat-auctions","feat-promotions",
  "feat-seller","feat-stores","feat-pre-orders",
  "cli","eslint-plugin-letitrip","create-app"
)

$root = Split-Path $PSScriptRoot -Parent

$ok   = @()
$skip = @()
$fail = @()

foreach ($pkg in $packages) {
  $pkgDir = "$root\packages\$pkg"
  $cmd = "npm publish --access public"
  if ($Otp) { $cmd += " --otp $Otp" }

  $output = & cmd /c "cd /d `"$pkgDir`" && $cmd 2>&1"
  $txt    = ($output -join " ")

  if     ($txt -match "403.*Two-factor|E403") { $fail += "2FA_REQUIRED: $pkg (use --otp or automation token)" }
  elseif ($txt -match "previously published|already exists|409|E409") { $skip += "ALREADY: $pkg" }
  elseif ($txt -match "npm notice.*total files") { $ok += "OK: $pkg" }
  elseif ($LASTEXITCODE -eq 0) { $ok += "OK: $pkg" }
  else  {
    $err = ($output | Where-Object { $_ -match "npm error" } | Select-Object -First 1)
    $fail += "FAIL: $pkg -- $err"
  }
  Write-Host ($ok + $skip + $fail)[-1]
}

Write-Host ""
Write-Host "=== RESULTS ==="
Write-Host "Published OK  : $($ok.Count)"
Write-Host "Already exists: $($skip.Count)"
Write-Host "Failed        : $($fail.Count)"
if ($fail.Count -gt 0) {
  Write-Host ""
  Write-Host "Failures:"
  $fail | ForEach-Object { Write-Host "  $_" }
}
