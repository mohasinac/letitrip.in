import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AdSlot,
  CouponCard,
  Div,
  getPromotions,
  InteractiveProductCard,
  PromotionsView,
  PromotionsViewProductSection,
  ROUTES,
  Text,
} from "@mohasinac/appkit";

export const revalidate = 120;

const VALID_TABS = ["deals", "coupons", "featured", "all"] as const;
type PromotionsTab = (typeof VALID_TABS)[number];

function normalizeTab(value: string): PromotionsTab {
  return (VALID_TABS as readonly string[]).includes(value) ? (value as PromotionsTab) : "deals";
}

function buildCanonicalPath(locale: string, tab: PromotionsTab): string {
  return `/${locale}/promotions/${tab}`;
}

function tabLabel(tab: PromotionsTab): string {
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tab: string }>;
}): Promise<Metadata> {
  const { locale, tab } = await params;
  const activeTab = normalizeTab(tab);

  return {
    title: `Promotions - ${tabLabel(activeTab)}`,
    description: "Latest offers and campaigns across deals, coupons, and featured promotions.",
    alternates: {
      canonical: buildCanonicalPath(locale, activeTab),
    },
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

  const promotions = await getPromotions().catch(() => null);
  const coupons = promotions?.activeCoupons ?? [];
  const promotedProducts = promotions?.promotedProducts ?? [];
  const featuredProducts = promotions?.featuredProducts ?? [];

  const showCoupons = activeTab === "all" || activeTab === "coupons";
  const showDeals = activeTab === "all" || activeTab === "deals";
  const showFeatured = activeTab === "all" || activeTab === "featured";

  const hasContent =
    (showCoupons && coupons.length > 0) ||
    (showDeals && promotedProducts.length > 0) ||
    (showFeatured && featuredProducts.length > 0);

  return (
    <Div>
      <Div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
        {VALID_TABS.map((tabValue) => {
          const isActive = tabValue === activeTab;
          return (
            <Link
              key={tabValue}
              href={`/${locale}/promotions/${tabValue}`}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-slate-700 dark:text-zinc-300 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              {tabValue[0].toUpperCase() + tabValue.slice(1)}
            </Link>
          );
        })}
      </Div>

      <PromotionsView
        hasContent={hasContent}
        labels={{
          exclusiveOffersBadge: "Exclusive Offers",
          title: "Promotions",
          subtitle: "Latest offers and campaigns",
          emptyDeals: "No active promotions",
          checkBack: "Please check back soon.",
          couponsTitle: "Coupons",
          couponsSubtitle: "Available discounts",
          emptyCoupons: "No coupons available",
          dealsTitle: "Deals",
          dealsSubtitle: "Top deals",
          featuredTitle: "Featured",
          featuredSubtitle: "Featured promotions",
        }}
        couponsCount={showCoupons ? coupons.length : 0}
        renderCoupons={() =>
          showCoupons ? (
            <Div className="space-y-6">
              <Div className="grid gap-3 md:grid-cols-2">
                {coupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon as never} />
                ))}
              </Div>
              <AdSlot id="listing-between-rows" />
            </Div>
          ) : (
            <Text variant="secondary" size="sm">Switch tabs to view coupons.</Text>
          )
        }
        renderDealsSection={() =>
          showDeals ? (
            <PromotionsViewProductSection
              title="Deals"
              subtitle="Top promoted products"
              hasProducts={promotedProducts.length > 0}
              renderProducts={() => (
                <Div className="space-y-6">
                  <Div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {promotedProducts.map((product) => (
                      <InteractiveProductCard
                        key={product.id}
                        product={product as never}
                        href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id))}
                      />
                    ))}
                  </Div>
                  <AdSlot id="search-inline" />
                </Div>
              )}
            />
          ) : null
        }
        renderFeaturedSection={() =>
          showFeatured ? (
            <PromotionsViewProductSection
              title="Featured"
              subtitle="Featured promotions"
              hasProducts={featuredProducts.length > 0}
              renderProducts={() => (
                <Div className="space-y-6">
                  <Div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {featuredProducts.map((product) => (
                      <InteractiveProductCard
                        key={product.id}
                        product={product as never}
                        href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id))}
                      />
                    ))}
                  </Div>
                  <AdSlot id="listing-between-rows" />
                </Div>
              )}
            />
          ) : null
        }
      />
    </Div>
  );
}
