import { Suspense } from "react";
import { CategoryDetailPageView, getCategoryBySlug } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { notFound, redirect } from "@/i18n/navigation";

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
    title: normalizedPage > 1
      ? `${formatSlug(slug)} — Page ${normalizedPage} | LetItRip`
      : `${formatSlug(slug)} Collectibles | LetItRip`,
    description: `Browse ${formatSlug(slug)} collectibles on LetItRip — India's largest marketplace for trading cards, figures, diecast and more.`,
    alternates: {
      canonical: canonicalPath,
    },
    ...(normalizedPage > 1 && { robots: { index: false, follow: true } }),
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

  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  return (
    <Suspense>
      <CategoryDetailPageView slug={slug} />
    </Suspense>
  );
}
