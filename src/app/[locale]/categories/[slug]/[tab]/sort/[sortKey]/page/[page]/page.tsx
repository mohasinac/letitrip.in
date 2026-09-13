import { Suspense } from "react";
import { CategoryDetailPageView, getCategoryBySlug } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";
import type { Metadata } from "next";
import { notFound, redirect } from "@/i18n/navigation";
import { generateMetadata as _gm } from "@/constants/seo.server";

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
  const { slug, page } = await params;
  const normalizedPage = normalizePage(page);

  // Canonical points at the UNFACETED category page, not at this permutation.
  //
  // Two things were wrong with the previous self-canonical. It declared every
  // (tab x sortKey x page) combination a distinct canonical page, splitting the
  // category's link equity across thousands of near-identical URLs. And it was
  // built as `/${locale}/categories/...` — a locale-PREFIXED path, which 307s
  // to the unprefixed form in production, so the canonical named a URL that
  // redirects and that the sitemap does not contain.
  //
  // `_gm` takes an unprefixed path and resolves the host from
  // `SEO_CONFIG.siteUrl`, the single canonical-host definition enforced by
  // scripts/audit-seo-canonical-host.mjs. Do not hand-build this string.
  //
  // Unlike the store route, there is no `categories/[slug]/layout.tsx` to
  // inherit from, so it has to be declared here rather than simply omitted.
  return {
    ..._gm({
      title:
        normalizedPage > 1
          ? `${formatSlug(slug)} — Page ${normalizedPage} | LetItRip`
          : `${formatSlug(slug)} Collectibles | LetItRip`,
      description: `Browse ${formatSlug(slug)} collectibles on LetItRip — India's largest marketplace for trading cards, figures, diecast and more.`,
      path: `/categories/${slug}`,
    }),
    // Deeper pages stay out of the index; they are pagination of content that
    // the canonical page above already represents. `follow: true` so crawl
    // still traverses to the listings themselves.
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

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <Suspense>
      <PageViewTracker entityType="category" entityId={slug} url={`/categories/${slug}`} />
      <CategoryDetailPageView slug={slug} />
    </Suspense>
  );
}
