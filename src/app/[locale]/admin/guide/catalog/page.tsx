import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminCatalogGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Catalog Guide — Admin | LetItRip",
  description: "Admin guide: products, listing types, categories, brands, and reviews on LetItRip.",
  path: "/admin/guide/catalog",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminCatalogGuideView />;
}
