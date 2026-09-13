import { Suspense } from "react";
import {
  StoreAboutView,
  StoreArtStickersPageView,
  StoreAuctionsPageView,
  StoreClassifiedsPageView,
  StoreDigitalCodesPageView,
  StoreLiveItemsPageView,
  StorePreOrdersPageView,
  StorePrizeDrawsPageView,
  StoreProductsPageView,
  StoreReviewsPageView,
  STORE_PAGE_TABS,
  storeRepository,
} from "@mohasinac/appkit";
import { toStoreDetail } from "@mohasinac/appkit/server";
import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";

/**
 * Legacy canonical store URL: `/stores/{slug}/{tab}/sort/{sortKey}/page/{n}`.
 *
 * `normalizeTab` used to allow only `products | auctions | reviews | about`, so
 * every other real store tab — pre-orders, prize-draws, classified,
 * digital-codes, live, art — silently fell back to Products and rendered the
 * wrong inventory under a URL that named a different one. The allowlist is now
 * derived from STORE_PAGE_TABS (itself derived from the listing-type plugin
 * registry), so a new listing type is reachable here the moment it exists.
 */
type StoreSortKey = "relevance" | "newest" | "price-asc" | "price-desc";

type Props = {
  params: Promise<{
    locale: string;
    storeSlug: string;
    tab: string;
    sortKey: string;
    page: string;
  }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

/** Tabs backed by a listing type, plus the two non-listing store tabs. */
const ALLOWED_TABS: string[] = [
  ...STORE_PAGE_TABS.map((t) => t.id),
  "reviews",
  "about",
];

const DEFAULT_TAB = "products";
const DEFAULT_SORT: StoreSortKey = "relevance";

function normalizeTab(tab: string): string {
  return ALLOWED_TABS.includes(tab) ? tab : DEFAULT_TAB;
}

function normalizeSortKey(sortKey: string): StoreSortKey {
  const allowed: StoreSortKey[] = ["relevance", "newest", "price-asc", "price-desc"];
  return allowed.includes(sortKey as StoreSortKey)
    ? (sortKey as StoreSortKey)
    : DEFAULT_SORT;
}

function normalizePage(page: string): number {
  const parsed = Number(page);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildCanonicalPath(
  locale: string,
  storeSlug: string,
  tab: string,
  sortKey: StoreSortKey,
  page: number,
): string {
  return `/${locale}/stores/${storeSlug}/${tab}/sort/${sortKey}/page/${page}`;
}

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Prefer the tab's registered label; fall back to a title-cased slug. */
function tabLabel(tab: string): string {
  return STORE_PAGE_TABS.find((t) => t.id === tab)?.label ?? formatSlug(tab);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug, tab } = await params;
  const normalizedTab = normalizeTab(tab);

  // 🛑 Deliberately NO `alternates` here.
  //
  // This route is one sort/page permutation of content that already has a
  // canonical home at `/stores/{storeSlug}` — the URL the sitemap advertises.
  // It used to self-canonicalise to its own faceted path, which told search
  // engines that every (tab x sortKey x page) combination was a distinct
  // canonical page and split the store's link equity across all of them.
  //
  // Omitting `alternates` is the fix rather than an oversight: Next MERGES
  // metadata, so this page inherits the canonical that
  // `stores/[storeSlug]/layout.tsx` already declares via `_gm({ path })`.
  // That is the convention recorded in CLAUDE.md (Known TS Patterns) — declare
  // the canonical once on the parent layout and let the tabs inherit it.
  //
  // Title and description stay per-tab: those are genuinely different content
  // and are what a SERP entry for the tab should read.
  return {
    title: `${formatSlug(storeSlug)} - ${tabLabel(normalizedTab)} - Stores`,
    description: `Explore ${tabLabel(normalizedTab).toLowerCase()} for ${formatSlug(storeSlug)} store.`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale, storeSlug, tab, sortKey, page } = await params;
  const sp = await searchParams;

  const normalizedTab = normalizeTab(tab);
  const normalizedSort = normalizeSortKey(sortKey);
  const normalizedPage = normalizePage(page);

  const canonicalPath = buildCanonicalPath(
    locale,
    storeSlug,
    normalizedTab,
    normalizedSort,
    normalizedPage,
  );

  const currentPath = `/${locale}/stores/${storeSlug}/${tab}/sort/${sortKey}/page/${page}`;
  if (currentPath !== canonicalPath) {
    redirect(canonicalPath);
  }

  // One branch per store tab. Keyed on the same `tabSlug` values
  // STORE_PAGE_TABS produces, so a tab can never render another tab's content.
  switch (normalizedTab) {
    case "products":
      return <Suspense><StoreProductsPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "auctions":
      return <Suspense><StoreAuctionsPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "pre-orders":
      return <Suspense><StorePreOrdersPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "prize-draws":
      return <Suspense><StorePrizeDrawsPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "classifieds":
      return <Suspense><StoreClassifiedsPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "digital-codes":
      return <Suspense><StoreDigitalCodesPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "live":
      return <Suspense><StoreLiveItemsPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "art":
      return <Suspense><StoreArtStickersPageView storeSlug={storeSlug} searchParams={sp} /></Suspense>;
    case "reviews":
      return <Suspense><StoreReviewsPageView storeSlug={storeSlug} /></Suspense>;
    default:
      break;
  }

  // `bundles` and `about` both land here; bundles has no legacy canonical URL
  // of its own, so it falls through to the store's About view as before.
  const store = await storeRepository.findBySlug(storeSlug);
  if (!store) {
    return null;
  }

  // StoreAboutView is a Client Component — project through the public
  // allow-list so the raw document (Meta access token, adminNotes,
  // customCommissionRate) never reaches the RSC flight payload.
  return <StoreAboutView store={toStoreDetail(store)} />;
}
