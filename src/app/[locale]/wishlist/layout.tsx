import { Suspense, type ReactNode } from "react";
import { productFeaturesRepository } from "@mohasinac/appkit";
import { ProductFeaturesProvider } from "@mohasinac/appkit/client";
import { safeRead } from "@mohasinac/appkit/server";

/**
 * Wraps the wishlist page in ProductFeaturesProvider so InteractiveProductCard
 * can render platform feature badges (free shipping, fast delivery, etc.)
 * the same way they appear on /products, /auctions, /pre-orders. S6 FI6-2.
 */

export default async function Layout({ children }: { children: ReactNode }) {
  const platformFeatures = await safeRead(
    () => productFeaturesRepository.listPlatform(),
    {
      route: "/wishlist",
      key: "productFeatures.listPlatform",
      fallback: [],
    },
  );
  return (
    <ProductFeaturesProvider features={platformFeatures}>
      <Suspense>{children}</Suspense>
    </ProductFeaturesProvider>
  );
}
