import { normalizeError, ALL_LISTING_TYPES, pluginFor, ROUTES } from "@mohasinac/appkit";
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

/**
 * Legacy `/search/…/tab/<tab>` slug → the browse page that now owns that tab.
 *
 * Derived from the listing-type plugin registry (2026-08-21). It used to be a
 * hardcoded two-entry map, so seven of the nine tab slugs — prize-draws,
 * classified, digital-codes, live, art, stickers and products itself — all
 * fell through to `/products`, which at the time filtered them out. Those
 * permanent redirects landed on a page that could not show the thing they
 * asked for.
 */
const TAB_ROUTE: Record<string, string> = Object.fromEntries(
  ALL_LISTING_TYPES.map((type) => {
    const plugin = pluginFor(type);
    return [plugin.tabSlug, plugin.browseRoute ?? String(ROUTES.PUBLIC.PRODUCTS)];
  }),
);

function decodeSearchQuery(searchSlug: string): string {
  try { return decodeURIComponent(searchSlug).trim(); } catch (_err) { void normalizeError(_err); return searchSlug.trim(); }
}

export default async function LegacySearchRedirectPage({ params }: Props) {
  const { searchSlug, tab } = await params;
  const query = decodeSearchQuery(searchSlug);
  const base = TAB_ROUTE[tab] ?? "/products";
  permanentRedirect(query ? `${base}?q=${encodeURIComponent(query)}` : base);
}
