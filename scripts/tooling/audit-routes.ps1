$apiPath = "D:\proj\letitrip.in\src\app\api"
$r = Get-ChildItem -Path $apiPath -Recurse -Filter "route.ts"
Write-Host "Found $($r.Count) files"
foreach ($f in $r) {
  $content = [System.IO.File]::ReadAllText($f.FullName)
  $rel = $f.FullName.Replace("D:\proj\letitrip.in\src\app\api\", "")
  $methods = (([regex]::Matches($content, 'export (?:const|async function) (GET|POST|PUT|DELETE|PATCH)')) | ForEach-Object { $_.Groups[1].Value }) -join ","
  $libViolations = (([regex]::Matches($content, 'from "@/lib/(?!validation/schemas)[^"]*"')) | ForEach-Object { $_.Value }) -join ";"
  $statusLits = ((([regex]::Matches($content, '"(?:approved|published|shipped|pending|rejected|active|outbid|inactive|cancelled|completed|processing|delivered|draft|eligible|requested)"')) | ForEach-Object { $_.Value }) | Select-Object -Unique) -join ";"
  $rzpShip = ((([regex]::Matches($content, '(?:razorpay_\w+|razorpayInstance|shiprocket\w+|SHIPROCKET_\w+)')) | ForEach-Object { $_.Value }) | Select-Object -Unique) -join ";"
  $hasAppkit = if ($content -match '@mohasinac/appkit/') { "Y" } else { "N" }
  $hasInlineSDK = if ($content -match 'admin\(\)|getFirestore\(\)|getDatabase\(\)|getApp\(\)') { "SDK" } else { "" }
  $hasPlatformFee = if ($content -match 'platformFee|commissionRate|PLATFORM_COMMISSION') { "FEE_CALC" } else { "" }
  Write-Host "$rel|$methods|$libViolations|$statusLits|$rzpShip|$hasAppkit|$hasInlineSDK|$hasPlatformFee"
}
