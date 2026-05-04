import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AdSlot,
  CouponsIndexListing,
  Div,
  getPromotions,
  Heading,
  InteractiveProductCard,
  PromotionsHero,
  PromotionsViewProductSection,
  ROUTES,
  Text,
} from "@mohasinac/appkit";

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

function buildCanonicalPath(locale: string, tab: PromotionsTab): string {
  return `/${locale}/promotions/${tab}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tab: string }>;
}): Promise<Metadata> {
  const { locale, tab } = await params;
  const activeTab = normalizeTab(tab);

  const descriptions: Record<PromotionsTab, string> = {
    deals: "Shop top deals and promoted products at special prices.",
    coupons: "Browse and copy active discount coupons for your next order.",
    featured: "Explore hand-picked featured products from top sellers.",
    all: "All promotions — deals, coupons, and featured products in one place.",
  };

  return {
    title: `Promotions — ${TAB_LABELS[activeTab]} | LetItRip`,
    description: descriptions[activeTab],
    alternates: { canonical: buildCanonicalPath(locale, activeTab) },
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
    redirect(buildCanonicalPath(locale, activeTab));
  }

  // Only fetch product data (deals/featured) — coupons are fetched client-side
  const needsProducts = activeTab === "all" || activeTab === "deals" || activeTab === "featured";
  const promotions = needsProducts ? await getPromotions().catch(() => null) : null;
  const activeCoupons = promotions?.activeCoupons ?? [];
  const promotedProducts = promotions?.promotedProducts ?? [];
  const featuredProducts = promotions?.featuredProducts ?? [];

  return (
    <Div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <PromotionsHero
        labels={{
          exclusiveOffersBadge: "Exclusive Offers",
          title: "Promotions",
          subtitle: "Latest deals, coupons, and featured picks",
        }}
      />

      {/* Tab navigation */}
      <Div className="sticky top-[var(--header-height,0px)] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-slate-700">
        <Div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
          {VALID_TABS.map((tabValue) => {
            const isActive = tabValue === activeTab;
            return (
              <Link
                key={tabValue}
                href={`/${locale}/promotions/${tabValue}`}
                className={[
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {TAB_LABELS[tabValue]}
              </Link>
            );
          })}
        </Div>
      </Div>

      {/* Tab content */}
      <Div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <CouponsIndexListing initialCoupons={activeCoupons as any} />
            {activeTab === "coupons" && <AdSlot id="listing-between-rows" />}
          </Div>
        )}

        {/* ── DEALS tab ────────────────────────────────────────────────── */}
        {(activeTab === "deals" || activeTab === "all") && (
          <Div className={activeTab === "all" ? "mb-12" : ""}>
            <PromotionsViewProductSection
              title="Deals"
              subtitle="Top promoted products at special prices"
              hasProducts={promotedProducts.length > 0}
              renderProducts={() => (
                <Div className="space-y-6">
                  <Div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {promotedProducts.map((product) => (
                      <InteractiveProductCard
                        key={product.id}
                        product={product as never}
                        href={String(
                          ROUTES.PUBLIC.PRODUCT_DETAIL(
                            (product as any).slug ?? product.id,
                          ),
                        )}
                      />
                    ))}
                  </Div>
                  <AdSlot id="search-inline" />
                </Div>
              )}
            />
            {promotedProducts.length === 0 && (
              <Div className="py-12 text-center">
                <Text className="text-zinc-400 dark:text-zinc-500">
                  No deals available right now. Check back soon!
                </Text>
              </Div>
            )}
          </Div>
        )}

        {/* ── FEATURED tab ─────────────────────────────────────────────── */}
        {(activeTab === "featured" || activeTab === "all") && (
          <Div>
            <PromotionsViewProductSection
              title="Featured"
              subtitle="Hand-picked products from top sellers"
              hasProducts={featuredProducts.length > 0}
              renderProducts={() => (
                <Div className="space-y-6">
                  <Div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {featuredProducts.map((product) => (
                      <InteractiveProductCard
                        key={product.id}
                        product={product as never}
                        href={String(
                          ROUTES.PUBLIC.PRODUCT_DETAIL(
                            (product as any).slug ?? product.id,
                          ),
                        )}
                      />
                    ))}
                  </Div>
                  <AdSlot id="listing-between-rows" />
                </Div>
              )}
            />
            {featuredProducts.length === 0 && activeTab === "featured" && (
              <Div className="py-12 text-center">
                <Text className="text-zinc-400 dark:text-zinc-500">
                  No featured products right now. Check back soon!
                </Text>
              </Div>
            )}
          </Div>
        )}
      </Div>
    </Div>
  );
}
