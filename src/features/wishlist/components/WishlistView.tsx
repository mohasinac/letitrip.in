"use client";

/**
 * WishlistView
 *
 * User wishlist page with tabs for Products, Auctions, Categories, and Stores.
 * Currently only the Products tab has backend support; others show a placeholder.
 * Uses the unified ListingLayout shell with URL-driven state.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag, Gavel, Grid3X3, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  useAuth,
  useApiQuery,
  useUrlTable,
  useMessage,
  invalidateQueries,
} from "@/hooks";
import {
  Button,
  EmptyState,
  Heading,
  ListingLayout,
  ProductGrid,
  Search,
  SortDropdown,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@/components";
import { WishlistButton } from "./WishlistButton";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { wishlistService, cartService } from "@/services";
import type { ProductDocument } from "@/db/schema";

const WISHLIST_SORT_OPTIONS_KEYS = [
  { value: "-addedAt", key: "sortNewest" },
  { value: "addedAt", key: "sortOldest" },
  { value: "-price", key: "sortPriceHigh" },
  { value: "price", key: "sortPriceLow" },
] as const;

interface WishlistItem {
  productId: string;
  addedAt: string;
  product: ProductDocument | null;
}

interface WishlistResponse {
  items: WishlistItem[];
  meta: { total: number };
}

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const table = useUrlTable();
  const activeTab = (table.get("tab") || "products") as TabKey;
  const search = table.get("q");
  const sortParam = table.get("sorts") || "-addedAt";

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const { data, isLoading } = useApiQuery<WishlistResponse>({
    queryKey: ["user", "wishlist"],
    queryFn: () => wishlistService.list(),
    enabled: !!user,
  });

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
      selectedIds.map((id) => wishlistService.remove(id)),
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
      selectedIds.map((id) =>
        cartService.addItem({ productId: id, quantity: 1 }),
      ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded > 0) invalidateQueries(["cart"]);
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

  if (authLoading || !user) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  const isProductTab = activeTab === "products";

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
      loading={isLoading && isProductTab}
      selectedCount={selectedIds.length}
      onClearSelection={() => setSelectedIds([])}
      bulkActions={
        isProductTab ? (
          <>
            <Button variant="primary" size="sm" onClick={handleBulkAddToCart}>
              {tActions("bulkAddToCart", { count: selectedIds.length })}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkRemoveFromWishlist}
            >
              {tActions("bulkRemove", { count: selectedIds.length })}
            </Button>
          </>
        ) : undefined
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
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
            {/* Wishlist remove button overlay */}
            {!isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 absolute inset-0 pointer-events-none">
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
