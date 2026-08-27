import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { AdSlot, CouponsIndexListing, Div, Heading, PromotionsHero, Row, Text, getPromotions, productFeaturesRepository } from "@mohasinac/appkit";
import { ProductFeaturesProvider } from "@mohasinac/appkit/client";
import { PromotionsProductsClient } from "./PromotionsProductsClient";

const __O = {
  xAuto: "overflow-x-auto",
} as const;

export const revalidate = 120;

const VALID_TABS = ["deals", "coupons", "featured", "all"] as const;
type PromotionsTab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<PromotionsTab, string> = {
  deals: "Deals",
  coupons: "Coupons",
  featured: "Featured",
  all: "All",
};

function normalizeTab(value: string): PromotionsTab {
  return (VALID_TABS as readonly string[]).includes(value)
    ? (value as PromotionsTab)
    : "deals";
}

/**
 * Where an unrecognised tab gets sent — a NAVIGATION target, not a canonical.
 *
 * It was named `buildCanonicalPath` while doing double duty as both, which is
 * how the section ended up with four competing canonicals. The canonical now
 * lives on `../layout.tsx`; this only normalises `/promotions/wat` →
 * `/promotions/deals`.
 */
function buildRedirectPath(locale: string, tab: PromotionsTab): string {
  return `/${locale}/promotions/${tab}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tab: string }>;
}): Promise<Metadata> {
  const { tab } = await params;
  const activeTab = normalizeTab(tab);

  const descriptions: Record<PromotionsTab, string> = {
    deals: "Shop top deals and promoted products at special prices.",
    coupons: "Browse and copy active discount coupons for your next order.",
    featured: "Explore hand-picked featured products from top sellers.",
    all: "All promotions — deals, coupons, and featured products in one place.",
  };

  /*
   * No `alternates` — the canonical is inherited from `../layout.tsx`, which
   * names `/promotions`, the URL the sitemap advertises. Next merges metadata,
   * so omitting the key here keeps the parent's.
   *
   * These four tabs are views of one page, and they consolidate onto it the
   * same way every `stores/[storeSlug]/*` tab consolidates onto
   * `/stores/{slug}`. Each declaring its own canonical split the section into
   * four competing URLs, none of which was the one in the sitemap — and it did
   * so with a locale-prefixed relative string while `_gm` emits absolute
   * unprefixed URLs, so the two never even agreed on a format.
   *
   * Per-tab title and description stay: they are genuinely different content.
   */
  return {
    title: `Promotions — ${TAB_LABELS[activeTab]} | LetItRip`,
    description: descriptions[activeTab],
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; tab: string }>;
}) {
  const { locale, tab } = await params;
  const activeTab = normalizeTab(tab);

  if (tab !== activeTab) {
    redirect(buildRedirectPath(locale, activeTab));
  }

  const promotions = await getPromotions().catch(() => null);
  const activeCoupons = promotions?.activeCoupons ?? [];
  const promotedProducts = (promotions?.promotedProducts ?? []) as unknown as { id: string; slug?: string; [key: string]: unknown }[];
  const featuredProducts = (promotions?.featuredProducts ?? []) as unknown as { id: string; slug?: string; [key: string]: unknown }[];
  const platformFeatures = await productFeaturesRepository
    .listPlatform()
    .catch(() => []);

  return (
    <ProductFeaturesProvider features={platformFeatures}>
    <Div surface="default" className="min-h-screen">
      {/* Hero */}
      <PromotionsHero
        labels={{
          exclusiveOffersBadge: "Exclusive Offers",
          title: "Promotions",
          subtitle: "Latest deals, coupons, and featured picks",
        }}
      />

      {/* Tab navigation */}
      <Div border="default" surface="default" className="border-b">
        <Row className={`mx-auto max-w-5xl ${__O.xAuto} scrollbar-hide`} align="center" gap="xs" padding="y-xs">
          {VALID_TABS.map((tabValue) => {
            const isActive = tabValue === activeTab;
            return (
              <Link
                key={tabValue}
                href={`/${locale}/promotions/${tabValue}`}
                className={[
                  "shrink-0 rounded-full border px-[var(--appkit-space-4)] py-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-[var(--appkit-color-border)] text-[var(--appkit-color-text-muted)] hover:bg-surface-hover",
                ].join(" ")}
              >
                {TAB_LABELS[tabValue]}
              </Link>
            );
          })}
        </Row>
      </Div>

      {/* Tab content */}
      <Div paddingX="x-page" className="max-w-5xl mx-auto" padding="y-xl">
        {/* ── COUPONS tab ──────────────────────────────────────────────── */}
        {(activeTab === "coupons" || activeTab === "all") && (
          <Div className={activeTab === "all" ? "mb-12" : ""}>
            {activeTab === "all" && (
              <Div className="mb-6">
                <Heading level={2}>Coupons</Heading>
                <Text variant="secondary" className="mt-1">
                  Active discount codes you can use at checkout
                </Text>
              </Div>
            )}
            <Suspense><CouponsIndexListing initialCoupons={activeCoupons as any} /></Suspense>
            {activeTab === "coupons" && <AdSlot id="listing-between-rows" />}
          </Div>
        )}

        {/* ── DEALS tab ────────────────────────────────────────────────── */}
        {(activeTab === "deals" || activeTab === "all") && (
          <Div className={activeTab === "all" ? "mb-12" : ""}>
            <PromotionsProductsClient
              title="Deals"
              subtitle="Top promoted products at special prices"
              products={promotedProducts}
              adSlotId="search-inline"
            />
            {promotedProducts.length === 0 && (
              <Div className="text-center" padding="y-3xl">
                <Text color="faint">
                  No deals available right now. Check back soon!
                </Text>
              </Div>
            )}
          </Div>
        )}

        {/* ── FEATURED tab ─────────────────────────────────────────────── */}
        {(activeTab === "featured" || activeTab === "all") && (
          <Div>
            <PromotionsProductsClient
              title="Featured"
              subtitle="Hand-picked products from top sellers"
              products={featuredProducts}
              adSlotId="listing-between-rows"
            />
            {featuredProducts.length === 0 && activeTab === "featured" && (
              <Div className="text-center" padding="y-3xl">
                <Text color="faint">
                  No featured products right now. Check back soon!
                </Text>
              </Div>
            )}
          </Div>
        )}
      </Div>
    </Div>
    </ProductFeaturesProvider>
  );
}
