$b = "d:\proj\letitrip.in\src\app\[locale]"
function W($rel, $txt) {
  $path = Join-Path $b $rel
  [System.IO.File]::WriteAllText($path, $txt, [System.Text.Encoding]::UTF8)
  Write-Host "OK: $rel"
}

W "user\addresses\edit\[id]\page.tsx" 'import { UserAddressesView } from "@mohasinac/appkit";

export default function Page() {
  return <UserAddressesView />;
}
'

W "seller\coupons\new\page.tsx" 'import { SellerCouponsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerCouponsView />;
}
'

Write-Host "Fix done"
