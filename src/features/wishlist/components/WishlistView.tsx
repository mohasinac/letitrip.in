"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Heart, ShoppingBag, Gavel, Grid3X3, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useMessage } from "@/hooks";
import {
  WishlistView as AppkitWishlistView,
  type WishlistTab,
} from "@mohasinac/appkit/features/wishlist";
import { EmptyState, Search } from "@/components";
import {
  ProductGrid as AppkitProductGrid,
  type ProductItem,
} from "@mohasinac/appkit/features/products";
import { Row, ViewToggle, SortDropdown, Spinner, SectionTabs } from "@mohasinac/appkit/ui";
import { ROUTES, ERROR_MESSAGES } from "@/constants";

const WISHLIST_SORT_OPTIONS_KEYS = [
  { value: "-addedAt", key: "sortNewest" },
  { value: "addedAt", key: "sortOldest" },
  { value: "-price", key: "sortPriceHigh" },
  { value: "price", key: "sortPriceLow" },
] as const;

const TAB_KEYS = ["products", "auctions", "categories", "stores"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_ICONS: Record<TabKey, ReactNode> = {
  products: <ShoppingBag className="w-4 h-4 mr-1.5 inline" />,
  auctions: <Gavel className="w-4 h-4 mr-1.5 inline" />,
  categories: <Grid3X3 className="w-4 h-4 mr-1.5 inline" />,
  stores: <Store className="w-4 h-4 mr-1.5 inline" />,
};

function WishlistContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("wishlist");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const { showError } = useMessage();
  const [viewMode, setViewMode] = useState<"card" | "fluid" | "list">("card");

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const sortOptions = useMemo(
    () =>
      WISHLIST_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: t(o.key),
      })),
    [t],
  );

  if (authLoading || !user) {
    return (
      <Row justify="center" gap="none" className="min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </Row>
    );
  }

  return (
    <AppkitWishlistView
      userId={user.uid}
      labels={{
        title: t("title"),
        subtitle: t("subtitle"),
        emptyTitle: t("empty"),
        emptyDescription: t("description"),
      }}
      renderTabs={(activeTab, onTabChange) => (
        <SectionTabs
          inline
          value={activeTab}
          onChange={(v) => onTabChange(v as WishlistTab)}
          tabs={TAB_KEYS.map((tab) => ({
            value: tab,
            label: t(
              `tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as `tabProducts`,
            ),
            icon: TAB_ICONS[tab],
          }))}
        />
      )}
      renderSearch={(value, onChange) => (
        <Search
          value={value}
          onChange={onChange}
          placeholder={t("searchPlaceholder")}
          onClear={() => onChange("")}
        />
      )}
      renderSort={(value, onChange) => (
        <SortDropdown value={value} onChange={onChange} options={sortOptions} />
      )}
      renderViewToggle={(_mode, onToggle) => (
        <ViewToggle
          value={viewMode}
          onChange={(m) => {
            const nextMode = m as "card" | "fluid" | "list";
            setViewMode(nextMode);
            onToggle(nextMode);
          }}
        />
      )}
      renderProducts={(items, isLoading) => {
        const products = items.map((item) => ({
          id: item.productId,
          title: item.productTitle ?? "",
          slug: item.productSlug,
          price: item.productPrice ?? 0,
          currency: item.productCurrency ?? "INR",
          images: item.productImage ? [item.productImage] : [],
          status: item.productStatus ?? "published",
        })) as unknown as ProductItem[];

        if (!isLoading && products.length === 0) {
          return (
            <EmptyState
              icon={<Heart className="w-16 h-16" />}
              title={t("empty")}
              description={t("description")}
              actionLabel={tActions("browseProducts")}
              onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
            />
          );
        }

        return (
          <>
            {isLoading ? (
              <div
                className={
                  viewMode === "list"
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : (
              <AppkitProductGrid
                products={products}
                view={viewMode}
                emptyLabel={t("noProductsFound")}
              />
            )}
          </>
        );
      }}
      renderTabPlaceholder={(tab) => (
        <EmptyState
          icon={
            tab === "auctions" ? (
              <Gavel className="w-16 h-16" />
            ) : tab === "categories" ? (
              <Grid3X3 className="w-16 h-16" />
            ) : (
              <Store className="w-16 h-16" />
            )
          }
          title={t("comingSoon")}
          description={t("comingSoonDescription")}
        />
      )}
    />
  );
}

export function WishlistView() {
  return (
    <Suspense>
      <WishlistContent />
    </Suspense>
  );
}

