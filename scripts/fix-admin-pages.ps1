$b = "d:\proj\letitrip.in\src\app\[locale]"
function W($rel, $txt) {
  $path = Join-Path $b $rel
  [System.IO.File]::WriteAllText($path, $txt, [System.Text.Encoding]::UTF8)
  Write-Host "OK: $rel"
}

W "admin\products\[[...action]]\page.tsx" 'import { AdminProductsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminProductsView />;
}
'
W "admin\orders\[[...action]]\page.tsx" 'import { AdminOrdersView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminOrdersView />;
}
'
W "admin\users\[[...action]]\page.tsx" 'import { AdminUsersView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminUsersView />;
}
'
W "admin\reviews\[[...action]]\page.tsx" 'import { AdminReviewsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminReviewsView />;
}
'
W "admin\blog\[[...action]]\page.tsx" 'import { AdminBlogView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminBlogView />;
}
'
W "admin\faqs\[[...action]]\page.tsx" 'import { AdminFaqsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminFaqsView />;
}
'
W "admin\coupons\[[...action]]\page.tsx" 'import { AdminCouponsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminCouponsView />;
}
'
W "admin\bids\[[...action]]\page.tsx" 'import { AdminBidsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminBidsView />;
}
'
W "admin\carousel\[[...action]]\page.tsx" 'import { AdminCarouselView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminCarouselView />;
}
'
W "admin\categories\[[...action]]\page.tsx" 'import { AdminCategoriesView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminCategoriesView />;
}
'

Write-Host "Admin catch-all pages fixed"
