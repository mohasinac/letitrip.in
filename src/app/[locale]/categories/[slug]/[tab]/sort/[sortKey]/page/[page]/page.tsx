import { CategoryDetailPageView } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type CategoryTab = "products";
type CategorySortKey = "relevance" | "newest" | "price-asc" | "price-desc";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
    tab: string;
    sortKey: string;
    page: string;
  }>;
};

const DEFAULT_TAB: CategoryTab = "products";
const DEFAULT_SORT: CategorySortKey = "relevance";

function normalizeTab(tab: string): CategoryTab {
  return tab === "products" ? "products" : DEFAULT_TAB;
}

function normalizeSortKey(sortKey: string): CategorySortKey {
  const allowed: CategorySortKey[] = ["relevance", "newest", "price-asc", "price-desc"];
  return allowed.includes(sortKey as CategorySortKey)
    ? (sortKey as CategorySortKey)
    : DEFAULT_SORT;
}

function normalizePage(page: string): number {
  const parsed = Number(page);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildCanonicalPath(
  locale: string,
  slug: string,
  tab: CategoryTab,
  sortKey: CategorySortKey,
  page: number,
): string {
  return `/${locale}/categories/${slug}/${tab}/sort/${sortKey}/page/${page}`;
}

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, tab, sortKey, page } = await params;
  const normalizedTab = normalizeTab(tab);
  const normalizedSort = normalizeSortKey(sortKey);
  const normalizedPage = normalizePage(page);
  const canonicalPath = buildCanonicalPath(
    locale,
    slug,
    normalizedTab,
    normalizedSort,
    normalizedPage,
  );

  return {
    title: `${formatSlug(slug)} - Categories`,
    description: `Browse items in ${formatSlug(slug)} category.`,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug, tab, sortKey, page } = await params;

  const normalizedTab = normalizeTab(tab);
  const normalizedSort = normalizeSortKey(sortKey);
  const normalizedPage = normalizePage(page);

  const canonicalPath = buildCanonicalPath(
    locale,
    slug,
    normalizedTab,
    normalizedSort,
    normalizedPage,
  );

  const currentPath = `/${locale}/categories/${slug}/${tab}/sort/${sortKey}/page/${page}`;
  if (currentPath !== canonicalPath) {
    redirect(canonicalPath);
  }

  return <CategoryDetailPageView slug={slug} />;
}
