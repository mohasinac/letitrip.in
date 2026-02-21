import type { Metadata } from "next";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.destinations.title,
  description: SEO_CONFIG.pages.destinations.description,
  keywords: [...SEO_CONFIG.pages.destinations.keywords],
  path: "/categories",
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
