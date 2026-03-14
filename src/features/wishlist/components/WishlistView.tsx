"use client";

/**
 * WishlistView
 *
 * User wishlist page with tabs for Products, Auctions, Categories, and Stores.
 * Currently only the Products tab has backend support; others show a placeholder.
 * Uses the unified ListingLayout shell with URL-driven state.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag, Gavel, Grid3X3, Store, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useUrlTable, useMessage, useBottomActions } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  Heading,
  ListingLayout,
  ProductGrid,
  Row,
  Search,
  SortDropdown,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
  ViewToggle,
} from "@/components";
import type { ViewMode } from "@/components";
import { WishlistButton } from "./WishlistButton";
import { ROUTES, ERROR_MESSAGES } from "@/constants";
import { removeFromWishlistAction, addToCartAction } from "@/actions";
import { useWishlist } from "../hooks/useWishlist";
import type { WishlistItem } from "../hooks/useWishlist";
import type { ProductDocument } from "@/db/schema";

const WISHLIST_SORT_OPTIONS_KEYS = [
  { value: "-addedAt", key: "sortNewest" },
  { value: "addedAt", key: "sortOldest" },
  { value: "-price", key: "sortPriceHigh" },
  { value: "price", key: "sortPriceLow" },
] as const;

const TAB_KEYS = ["products", "auctions", "categories", "stores"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
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
  const { showSuccess, showError } = useMessage();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const table = useUrlTable();
  const activeTab = (table.get("tab") || "products") as TabKey;
  const search = table.get("q");
  const sortParam = table.get("sorts") || "-addedAt";
  const viewMode = (table.get("view") || "grid") as ViewMode;

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const { data, isLoading } = useWishlist(!!user);

  const allItems = useMemo(() => data?.items ?? [], [data]);
  const total = allItems.length;

  // Client-side search + sort for products tab
  const displayedProducts = useMemo(() => {
    if (activeTab !== "products") return [];
    let items = allItems.filter((i) => i.product !== null);

    const q = (search || "").trim().toLowerCase();
    if (q) {
      items = items.filter(
        (i) =>
          (i.product?.title ?? "").toLowerCase().includes(q) ||
          (i.product?.description ?? "").toLowerCase().includes(q),
      );
    }

    items.sort((a, b) => {
      const desc = sortParam.startsWith("-");
      const field = desc ? sortParam.slice(1) : sortParam;
      let aVal: number;
      let bVal: number;
      if (field === "price") {
        aVal = a.product?.price ?? 0;
        bVal = b.product?.price ?? 0;
      } else {
        aVal = new Date(a.addedAt).getTime();
        bVal = new Date(b.addedAt).getTime();
      }
      return desc ? bVal - aVal : aVal - bVal;
    });

    return items;
  }, [allItems, activeTab, search, sortParam]);

  const products = useMemo(
    () =>
      displayedProducts
        .map((i) => i.product)
        .filter((p): p is ProductDocument => p !== null),
    [displayedProducts],
  );

  const sortOptions = useMemo(
    () =>
      WISHLIST_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: t(o.key),
      })),
    [t],
  );

  const handleClearFilters = useCallback(() => {
    table.clear(["q", "sorts"]);
  }, [table]);

  // ── Bulk action handlers ─────────────────────────────────────────
  const handleBulkRemoveFromWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => removeFromWishlistAction(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  const handleBulkAddToCart = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => {
        const item = allItems.find((i) => i.productId === id);
        if (!item?.product)
          return Promise.reject(new Error("Product not found"));
        const p = item.product;
        return addToCartAction({
          productId: id,
          productTitle: p.title,
          productImage: p.images?.[0] ?? "",
          price: p.price,
          currency: p.currency || "INR",
          quantity: 1,
          sellerId: p.sellerId,
          sellerName: p.sellerName,
          isAuction: p.isAuction,
        });
      }),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded > 0) queryClient.invalidateQueries({ queryKey: ["cart"] });
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  // Move isProductTab before the early return so hooks are unconditional
  const isProductTab = activeTab === "products";

  // ── Mobile bottom bulk action bar ──
  useBottomActions({
    bulk: isProductTab
      ? {
          selectedCount: selectedIds.length,
          onClearSelection: () => setSelectedIds([]),
          actions:
            selectedIds.length > 0
              ? [
                  {
                    id: "bulk-cart",
                    label: tActions("bulkAddToCart", {
                      count: selectedIds.length,
                    }),
                    variant: "primary" as const,
                    onClick: handleBulkAddToCart,
                  },
                  {
                    id: "bulk-remove",
                    label: tActions("bulkRemove", {
                      count: selectedIds.length,
                    }),
                    variant: "danger" as const,
                    grow: false,
                    onClick: handleBulkRemoveFromWishlist,
                  },
                ]
              : [],
        }
      : undefined,
  });

  if (authLoading || !user) {
    return (
      <Row justify="center" gap="none" className="min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </Row>
    );
  }

  return (
    <ListingLayout
      headerSlot={
        <div>
          <Heading level={3}>{t("title")}</Heading>
          <Text variant="secondary" className="mt-1">
            {total > 0
              ? t("subtitleWithCount", { count: total })
              : t("subtitle")}
          </Text>
        </div>
      }
      statusTabsSlot={
        <Tabs
          variant="line"
          value={activeTab}
          onChange={(v) => table.setMany({ tab: v, q: "", sorts: "" })}
        >
          <TabsList>
            {TAB_KEYS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {TAB_ICONS[tab]}
                {t(
                  `tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as `tabProducts`,
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      searchSlot={
        isProductTab ? (
          <Search
            value={search}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
            onClear={() => table.set("q", "")}
          />
        ) : undefined
      }
      sortSlot={
        isProductTab ? (
          <SortDropdown
            value={sortParam}
            onChange={(v) => table.set("sorts", v)}
            options={sortOptions}
          />
        ) : undefined
      }
      viewToggleSlot={
        isProductTab ? (
          <div className="flex items-center gap-1.5">
            <ViewToggle
              value={viewMode}
              onChange={(m) => table.set("view", m)}
            />
            <Tooltip content={tActions("selectionHint")} placement="bottom">
              <button
                type="button"
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-indigo-500 transition-colors"
                aria-label={tActions("selectionHint")}
              >
                <Info className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        ) : undefined
      }
      loading={isLoading && isProductTab}
      selectedCount={selectedIds.length}
      onClearSelection={() => setSelectedIds([])}
      bulkActionItems={
        isProductTab
          ? [
              {
                id: "bulk-cart",
                label: tActions("bulkAddToCart", { count: selectedIds.length }),
                variant: "primary",
                onClick: handleBulkAddToCart,
              },
              {
                id: "bulk-remove",
                label: tActions("bulkRemove", { count: selectedIds.length }),
                variant: "danger",
                onClick: handleBulkRemoveFromWishlist,
              },
            ]
          : undefined
      }
    >
      {isProductTab ? (
        !isLoading && products.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-16 h-16" />}
            title={search ? t("noResults") : t("empty")}
            description={search ? t("noResultsSubtitle") : t("description")}
            actionLabel={
              search ? tActions("clearAll") : tActions("browseProducts")
            }
            onAction={
              search
                ? handleClearFilters
                : () => router.push(ROUTES.PUBLIC.PRODUCTS)
            }
          />
        ) : (
          <div className="relative">
            <ProductGrid
              products={products}
              loading={isLoading}
              variant={viewMode}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
            {/* Wishlist remove button overlay */}
            {!isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 absolute inset-0 pointer-events-none">
                {displayedProducts.map((item) =>
                  item.product ? (
                    <div key={item.productId} className="relative">
                      <div className="absolute top-2 right-2 pointer-events-auto z-10">
                        <WishlistButton
                          productId={item.productId}
                          initialInWishlist={true}
                        />
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>
        )
      ) : (
        /* Non-product tabs — coming soon */
        <EmptyState
          icon={
            activeTab === "auctions" ? (
              <Gavel className="w-16 h-16" />
            ) : activeTab === "categories" ? (
              <Grid3X3 className="w-16 h-16" />
            ) : (
              <Store className="w-16 h-16" />
            )
          }
          title={t("comingSoon")}
          description={t("comingSoonDescription")}
        />
      )}
    </ListingLayout>
  );
}

export function WishlistView() {
  return (
    <Suspense>
      <WishlistContent />
    </Suspense>
  );
}
