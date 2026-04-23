$b = "d:\proj\letitrip.in\src\app\[locale]"
function W($rel, $txt) {
  $path = Join-Path $b $rel
  [System.IO.File]::WriteAllText($path, $txt, [System.Text.Encoding]::UTF8)
  Write-Host "OK: $rel"
}

W "cart\page.tsx" 'import { CartRouteClient } from "@/components/routing/CartRouteClient";

export default function Page() {
  return <CartRouteClient />;
}
'

W "checkout\page.tsx" 'import { CheckoutRouteClient } from "@/components/routing/CheckoutRouteClient";

export default function Page() {
  return <CheckoutRouteClient />;
}
'

W "checkout\success\page.tsx" 'import { CheckoutSuccessRouteClient } from "@/components/routing/CheckoutSuccessRouteClient";

export default function Page() {
  return <CheckoutSuccessRouteClient />;
}
'

Write-Host "Checkout pages updated"
