import type { Metadata } from "next";
import { generateMetadata as genMetadata } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: "Search Results - LetItRip",
  description: "Search across thousands of products and auctions on LetItRip.",
  path: "/search",
  noIndex: true,
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
