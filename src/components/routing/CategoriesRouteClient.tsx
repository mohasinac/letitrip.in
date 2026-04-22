"use client";

import { CategoriesListView, type CategoryItem } from "@mohasinac/appkit/client";
import { EmptyState } from "@mohasinac/appkit/ui";

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
        <EmptyState
          title="No categories yet"
          description="Categories will appear here once they are added to the marketplace."
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          }
        />
      )}
    />
  );
}
