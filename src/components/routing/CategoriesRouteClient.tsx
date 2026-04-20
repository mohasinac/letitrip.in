"use client";

import type { CategoryItem } from "@mohasinac/appkit/features/categories";
import { CategoriesListView } from "@mohasinac/appkit/features/categories";
import { Div, Text } from "@mohasinac/appkit/ui";

export function CategoriesRouteClient() {
  return (
    <CategoriesListView
      labels={{
        title: "Categories",
        subtitle: "Browse marketplace categories.",
      }}
      items={[] as CategoryItem[]}
      total={0}
      renderCategories={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No categories available yet.</Text>
        </Div>
      )}
    />
  );
}
