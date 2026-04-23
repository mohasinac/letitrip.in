$b = "d:\proj\letitrip.in\src\app\[locale]"
function W($rel, $txt) {
  $path = Join-Path $b $rel
  [System.IO.File]::WriteAllText($path, $txt, [System.Text.Encoding]::UTF8)
  Write-Host "OK: $rel"
}

# Fix detail pages - use correct prop names from interfaces
W "auctions\[id]\page.tsx" 'import { AuctionDetailPageView } from "@mohasinac/appkit";

export const revalidate = 30;

export default function Page({ params }: { params: { id: string } }) {
  return <AuctionDetailPageView id={params.id} />;
}
'

W "pre-orders\[id]\page.tsx" 'import { PreOrderDetailPageView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { id: string } }) {
  return <PreOrderDetailPageView id={params.id} />;
}
'

W "products\[slug]\page.tsx" 'import { ProductDetailPageView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailPageView slug={params.slug} />;
}
'

# EventDetailView and EventParticipateView use render slots - no id prop
# The client hook inside the view reads the event from context/search params
W "events\[id]\page.tsx" 'import { EventDetailView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page() {
  return <EventDetailView />;
}
'

W "events\[id]\participate\page.tsx" 'import { EventParticipateView } from "@mohasinac/appkit";

export default function Page() {
  return <EventParticipateView />;
}
'

# BlogPostView takes a slug prop
W "blog\[slug]\page.tsx" 'import { BlogPostView } from "@mohasinac/appkit";

export const revalidate = 300;

export default function Page({ params }: { params: { slug: string } }) {
  return <BlogPostView slug={params.slug} />;
}
'

# OrderDetailView and UserOrderTrackView use render slots - no orderId prop
W "user\orders\view\[id]\page.tsx" 'import { OrderDetailView } from "@mohasinac/appkit";

export default function Page() {
  return <OrderDetailView />;
}
'

W "user\orders\[id]\track\page.tsx" 'import { UserOrderTrackView } from "@mohasinac/appkit";

export default function Page() {
  return <UserOrderTrackView />;
}
'

Write-Host "Detail pages fixed"
