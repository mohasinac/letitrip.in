"use client";

import type { StoreProductItem } from "@mohasinac/appkit/features/stores";
import { StoreProductsView } from "@mohasinac/appkit/features/stores";
import { Div, Text } from "@mohasinac/appkit/ui";

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
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No store products available yet.</Text>
        </Div>
      )}
    />
  );
}
