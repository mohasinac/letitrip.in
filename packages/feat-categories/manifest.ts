import type { FeatureManifest } from "@mohasinac/contracts";

export const manifest: FeatureManifest = {
  name: "categories",
  i18nNamespace: "categories",
  envKeys: [],
  routes: [
    { segment: "[locale]/categories", exports: { default: "CategoriesView" } },
    {
      segment: "[locale]/categories/[slug]",
      exports: { default: "CategoryDetailView" },
    },
  ],
  apiRoutes: [
    { segment: "api/categories", methods: ["GET", "POST"] },
    { segment: "api/categories/[id]", methods: ["GET", "PATCH", "DELETE"] },
    { segment: "api/categories/[id]/children", methods: ["GET"] },
    { segment: "api/categories/flat", methods: ["GET"] },
  ],
};
