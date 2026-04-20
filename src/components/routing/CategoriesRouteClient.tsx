"use client";

import { CategoriesListView, Div, Text, type CategoryItem } from "@mohasinac/appkit/client";

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
