import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{
    searchSlug: string;
    tab: string;
  }>;
};

const TAB_ROUTE: Record<string, string> = {
  auctions:    "/auctions",
  "pre-orders": "/pre-orders",
};

function decodeSearchQuery(searchSlug: string): string {
  try { return decodeURIComponent(searchSlug).trim(); } catch { return searchSlug.trim(); }
}

export default async function LegacySearchRedirectPage({ params }: Props) {
  const { searchSlug, tab } = await params;
  const query = decodeSearchQuery(searchSlug);
  const base = TAB_ROUTE[tab] ?? "/products";
  permanentRedirect(query ? `${base}?q=${encodeURIComponent(query)}` : base);
}
