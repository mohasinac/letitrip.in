"use client";

import { CategoryProductsView } from "@mohasinac/appkit/features/categories";
import { Div, Text } from "@mohasinac/appkit/ui";

type CategoryProductsRouteClientProps = {
  slug: string;
};

export function CategoryProductsRouteClient({ slug }: CategoryProductsRouteClientProps) {
  return (
    <CategoryProductsView
      slug={slug}
      renderProducts={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No products found in this category.</Text>
        </Div>
      )}
    />
  );
}
