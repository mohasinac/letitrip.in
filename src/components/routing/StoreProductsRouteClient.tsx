"use client";

import { StoreProductsView, type StoreProductItem } from "@mohasinac/appkit/client";
import { EmptyState } from "@mohasinac/appkit/ui";

type StoreProductsRouteClientProps = {
  storeSlug: string;
};

export function StoreProductsRouteClient({ storeSlug }: StoreProductsRouteClientProps) {
  return (
    <StoreProductsView
      storeSlug={storeSlug}
      labels={{ title: "Store Products" }}
      items={[] as StoreProductItem[]}
      total={0}
      renderProducts={() => (
        <EmptyState
          title="No products yet"
          description="This store hasn't listed any products yet. Check back soon."
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
      )}
    />
  );
}
