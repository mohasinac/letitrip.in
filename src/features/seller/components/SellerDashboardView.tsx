/**
 * SellerDashboardView
 *
 * Feature view for the seller dashboard.
 * Fetches all seller products, computes counts by status/type,
 * and renders stat cards, quick actions, and recent listings.
 */

"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { Package, Store, Gavel, FileText } from "lucide-react";
import { Spinner, EmptyState } from "@/components";
import { Heading, Text } from "@/components";
import { useAuth, useApiQuery, useMessage } from "@/hooks";
import { sellerService } from "@/services";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import type { ProductDocument } from "@/db/schema";
import { SellerStatCard } from "./SellerStatCard";
import { SellerQuickActions } from "./SellerQuickActions";
import { SellerRecentListings } from "./SellerRecentListings";

interface ProductsResponse {
  items: Pick<
    ProductDocument,
    "id" | "title" | "status" | "isAuction" | "price" | "mainImage"
  >[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

const { themed, spacing, enhancedCard, flex } = THEME_CONSTANTS;

export function SellerDashboardView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showError } = useMessage();
  const t = useTranslations("sellerDashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const { data: productsData, isLoading: productsLoading } =
    useApiQuery<ProductsResponse>({
      queryKey: ["seller-products", user?.uid ?? ""],
      queryFn: () => sellerService.listProducts(user!.uid),
      enabled: !!user?.uid,
    });

  const stats = useMemo(() => {
    const products = productsData?.items ?? [];
    const total = productsData?.total ?? products.length;
    const activeListings = products.filter(
      (p) => p.status === "published" && !p.isAuction,
    ).length;
    const activeAuctions = products.filter(
      (p) => p.status === "published" && p.isAuction,
    ).length;
    const drafts = products.filter((p) => p.status === "draft").length;
    return { total, activeListings, activeAuctions, drafts };
  }, [productsData]);

  if (authLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={spacing.stack}>
      {/* Welcome Banner */}
      <div>
        <Heading level={2} variant="primary">
          {t("welcome", { name: user.displayName ?? user.email ?? "Seller" })}
        </Heading>
        <Text className={`${themed.textSecondary} mt-1`}>{t("subtitle")}</Text>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <SellerStatCard
          label={t("totalProducts")}
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          cardClass={enhancedCard.stat.indigo}
          iconClass="text-indigo-600 dark:text-indigo-400"
          loading={productsLoading}
        />
        <SellerStatCard
          label={t("activeListings")}
          value={stats.activeListings}
          icon={<Store className="w-5 h-5" />}
          cardClass={enhancedCard.stat.emerald}
          iconClass="text-emerald-600 dark:text-emerald-400"
          loading={productsLoading}
        />
        <SellerStatCard
          label={t("activeAuctions")}
          value={stats.activeAuctions}
          icon={<Gavel className="w-5 h-5" />}
          cardClass={enhancedCard.stat.teal}
          iconClass="text-teal-600 dark:text-teal-400"
          loading={productsLoading}
        />
        <SellerStatCard
          label={t("draftProducts")}
          value={stats.drafts}
          icon={<FileText className="w-5 h-5" />}
          cardClass={enhancedCard.stat.amber}
          iconClass="text-amber-600 dark:text-amber-400"
          loading={productsLoading}
        />
      </div>

      <SellerQuickActions />

      <SellerRecentListings
        products={productsData?.items ?? []}
        loading={productsLoading}
      />

      {/* Empty State */}
      {!productsLoading && (productsData?.items?.length ?? 0) === 0 && (
        <EmptyState
          icon={<Store className="w-10 h-10 text-gray-400" />}
          title={t("noProducts")}
          description={t("noProductsSubtitle")}
          actionLabel={t("addProduct")}
          onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
        />
      )}
    </div>
  );
}
