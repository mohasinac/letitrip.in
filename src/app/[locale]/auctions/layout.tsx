import type { Metadata } from "next";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.auctions.title,
  description: SEO_CONFIG.pages.auctions.description,
  keywords: [...SEO_CONFIG.pages.auctions.keywords],
  path: "/auctions",
});

export default function AuctionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
