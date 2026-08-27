import { Suspense, type ReactNode } from "react";
import { productFeaturesRepository } from "@mohasinac/appkit";
import { ProductFeaturesProvider } from "@mohasinac/appkit/client";

/**
 * Wraps the wishlist page in ProductFeaturesProvider so InteractiveProductCard
 * can render platform feature badges (free shipping, fast delivery, etc.)
 * the same way they appear on /products, /auctions, /pre-orders. S6 FI6-2.
 */

/**
 * A wishlist is per-user and auth-gated — there is no correct static HTML for
 * it, so prerendering was always wrong here. Opting out also removes the
 * build-time `useSearchParams()` bailout: the page renders `<ListingLayout>`,
 * whose `useUrlTable()` reads search params, and a parent `<Suspense>` does not
 * satisfy the static-export check when the enclosing layout is an async server
 * component. Same treatment as the admin routes (Root Cause #17).
 */
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const platformFeatures = await productFeaturesRepository
    .listPlatform()
    .catch(() => []);
  return (
    <ProductFeaturesProvider features={platformFeatures}>
      <Suspense>{children}</Suspense>
    </ProductFeaturesProvider>
  );
}
