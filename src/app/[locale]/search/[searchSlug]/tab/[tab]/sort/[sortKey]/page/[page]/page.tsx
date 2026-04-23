import {
  AdSlot,
  Button,
  Div,
  Input,
  InteractiveProductCard,
  ROUTES,
  SearchView,
  Text,
  searchProducts,
} from "@mohasinac/appkit";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type SearchTab = "all" | "products" | "auctions" | "pre-orders";
type SearchSortKey = "relevance" | "newest" | "price-asc" | "price-desc";

type Props = {
  params: Promise<{
    locale: string;
    searchSlug: string;
    tab: string;
    sortKey: string;
    page: string;
  }>;
};

const DEFAULT_TAB: SearchTab = "all";
const DEFAULT_SORT: SearchSortKey = "relevance";

function decodeSearchQuery(searchSlug: string): string {
  try {
    return decodeURIComponent(searchSlug).trim();
  } catch {
    return searchSlug.trim();
  }
}

function normalizeTab(tab: string): SearchTab {
  const allowed: SearchTab[] = ["all", "products", "auctions", "pre-orders"];
  return allowed.includes(tab as SearchTab) ? (tab as SearchTab) : DEFAULT_TAB;
}

function normalizeSortKey(sortKey: string): SearchSortKey {
  const allowed: SearchSortKey[] = ["relevance", "newest", "price-asc", "price-desc"];
  return allowed.includes(sortKey as SearchSortKey)
    ? (sortKey as SearchSortKey)
    : DEFAULT_SORT;
}

function normalizePage(page: string): number {
  const parsed = Number(page);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function toSort(sortKey: SearchSortKey): string {
  switch (sortKey) {
    case "price-asc":
      return "price";
    case "price-desc":
      return "-price";
    case "newest":
      return "-createdAt";
    case "relevance":
    default:
      return "-createdAt";
  }
}

function buildCanonicalPath(
  locale: string,
  query: string,
  tab: SearchTab,
  sortKey: SearchSortKey,
  page: number,
): string {
  return `/${locale}/search/${encodeURIComponent(query)}/tab/${tab}/sort/${sortKey}/page/${page}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, searchSlug, tab, sortKey, page } = await params;
  const query = decodeSearchQuery(searchSlug);

  if (!query) {
    return {
      title: "Search",
      alternates: {
        canonical: `/${locale}/search`,
      },
    };
  }

  const normalizedTab = normalizeTab(tab);
  const normalizedSortKey = normalizeSortKey(sortKey);
  const pageNumber = normalizePage(page);
  const canonicalPath = buildCanonicalPath(
    locale,
    query,
    normalizedTab,
    normalizedSortKey,
    pageNumber,
  );

  return {
    title: `Search - ${query}`,
    description: `Search results for ${query}.`,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, searchSlug, tab, sortKey, page } = await params;

  const query = decodeSearchQuery(searchSlug);
  const normalizedTab = normalizeTab(tab);
  const normalizedSortKey = normalizeSortKey(sortKey);
  const pageNumber = normalizePage(page);

  if (!query) {
    redirect(`/${locale}/search`);
  }

  const canonicalPath = buildCanonicalPath(
    locale,
    query,
    normalizedTab,
    normalizedSortKey,
    pageNumber,
  );
  const currentPath = `/${locale}/search/${searchSlug}/tab/${tab}/sort/${sortKey}/page/${page}`;

  if (currentPath !== canonicalPath) {
    redirect(canonicalPath);
  }

  const result = await searchProducts({
    q: query,
    page: pageNumber,
    pageSize: 24,
    sort: toSort(normalizedSortKey),
    isAuction: normalizedTab === "auctions" ? true : undefined,
    isPreOrder: normalizedTab === "pre-orders" ? true : undefined,
  }).catch(() => null);

  const products = result?.items ?? [];

  return (
    <SearchView
      query={query}
      total={result?.total ?? 0}
      isLoading={false}
      renderSearchInput={() => (
        <Div className="space-y-4">
          <form method="get" action={`/${locale}/search`} className="flex items-center gap-2">
            <Input name="q" defaultValue={query} placeholder="Search products, categories, stores" />
            <Button type="submit">Search</Button>
          </form>
          <AdSlot id="search-inline" />
        </Div>
      )}
      renderResults={() => (
        products.length > 0 ? (
          <Div className="space-y-6">
            <Div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <InteractiveProductCard
                  key={product.id}
                  product={product as never}
                  href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id))}
                />
              ))}
            </Div>
            <AdSlot id="listing-between-rows" />
          </Div>
        ) : (
          <Div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
            <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">No results for "{query}"</Text>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Try a different keyword or browse categories.</Text>
          </Div>
        )
      )}
    />
  );
}
