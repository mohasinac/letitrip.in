import {
  StoreAboutView,
  StoreAuctionsPageView,
  StoreProductsPageView,
  StoreReviewsPageView,
  storeRepository,
  type StoreDetail,
} from "@mohasinac/appkit";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type StoreTab = "products" | "auctions" | "reviews" | "about";
type StoreSortKey = "relevance" | "newest" | "price-asc" | "price-desc";

type Props = {
  params: Promise<{
    locale: string;
    storeSlug: string;
    tab: string;
    sortKey: string;
    page: string;
  }>;
};

const DEFAULT_TAB: StoreTab = "products";
const DEFAULT_SORT: StoreSortKey = "relevance";

function normalizeTab(tab: string): StoreTab {
  const allowed: StoreTab[] = ["products", "auctions", "reviews", "about"];
  return allowed.includes(tab as StoreTab) ? (tab as StoreTab) : DEFAULT_TAB;
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
  tab: StoreTab,
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

function tabLabel(tab: StoreTab): string {
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, storeSlug, tab, sortKey, page } = await params;
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

  return {
    title: `${formatSlug(storeSlug)} - ${tabLabel(normalizedTab)} - Stores`,
    description: `Explore ${tabLabel(normalizedTab).toLowerCase()} for ${formatSlug(storeSlug)} store.`,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, storeSlug, tab, sortKey, page } = await params;

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

  if (normalizedTab === "products") {
    return <StoreProductsPageView storeSlug={storeSlug} />;
  }

  if (normalizedTab === "auctions") {
    return <StoreAuctionsPageView storeSlug={storeSlug} />;
  }

  if (normalizedTab === "reviews") {
    return <StoreReviewsPageView storeSlug={storeSlug} />;
  }

  const store = await storeRepository.findBySlug(storeSlug).catch(() => undefined);
  if (!store) {
    return null;
  }

  return <StoreAboutView store={store as unknown as StoreDetail} />;
}
