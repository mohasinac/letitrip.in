import type { Metadata } from "next";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.sellers.title,
  description: SEO_CONFIG.pages.sellers.description,
  keywords: [...SEO_CONFIG.pages.sellers.keywords],
  path: "/sellers",
});

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
