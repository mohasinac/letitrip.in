/**
 * Seller Dashboard Page
 *
 * Route: /seller
 * Overview of the seller's listings, auctions, and key stats.
 * Fetches all seller products and computes counts by status/type.
 */

"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components";
import {
  SellerStatCard,
  SellerQuickActions,
  SellerRecentListings,
} from "@/components";
import { Card, Button } from "@/components/ui";
import { Heading, Text } from "@/components/typography";
import { useAuth, useApiQuery } from "@/hooks";
import { UI_LABELS, ROUTES, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";

interface ProductsResponse {
  data: Pick<
    ProductDocument,
    "id" | "title" | "status" | "isAuction" | "price" | "mainImage"
  >[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const { themed, spacing } = THEME_CONSTANTS;

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const productsUrl = useMemo(() => {
    if (!user?.uid) return null;
    const filters = encodeURIComponent(`sellerId==${user.uid}`);
    return `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${filters}&pageSize=200`;
  }, [user?.uid]);

  const { data: productsData, isLoading: productsLoading } =
    useApiQuery<ProductsResponse>({
      queryKey: ["seller-products", user?.uid ?? ""],
      queryFn: () => fetch(productsUrl!).then((r) => r.json()),
      enabled: !!productsUrl,
    });

  const stats = useMemo(() => {
    const products = productsData?.data ?? [];
    const total = productsData?.meta?.total ?? products.length;
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
      <div className="flex items-center justify-center py-16">
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
          {UI_LABELS.SELLER_PAGE.WELCOME(
            user.displayName ?? user.email ?? "Seller",
          )}
        </Heading>
        <Text className={`${themed.textSecondary} mt-1`}>
          {UI_LABELS.SELLER_PAGE.SUBTITLE}
        </Text>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SellerStatCard
          label={UI_LABELS.SELLER_PAGE.TOTAL_PRODUCTS}
          value={stats.total}
          icon="📦"
          colorClass="text-indigo-600 dark:text-indigo-400"
          loading={productsLoading}
        />
        <SellerStatCard
          label={UI_LABELS.SELLER_PAGE.ACTIVE_LISTINGS}
          value={stats.activeListings}
          icon="🏪"
          colorClass="text-green-600 dark:text-green-400"
          loading={productsLoading}
        />
        <SellerStatCard
          label={UI_LABELS.SELLER_PAGE.ACTIVE_AUCTIONS}
          value={stats.activeAuctions}
          icon="🔨"
          colorClass="text-purple-600 dark:text-purple-400"
          loading={productsLoading}
        />
        <SellerStatCard
          label={UI_LABELS.SELLER_PAGE.DRAFT_PRODUCTS}
          value={stats.drafts}
          icon="📝"
          colorClass="text-yellow-600 dark:text-yellow-400"
          loading={productsLoading}
        />
      </div>

      <SellerQuickActions />

      <SellerRecentListings
        products={productsData?.data ?? []}
        loading={productsLoading}
      />

      {/* Empty State */}
      {!productsLoading && (productsData?.data?.length ?? 0) === 0 && (
        <Card className="p-10 text-center">
          <p className="text-4xl mb-3">🏪</p>
          <Heading level={4} variant="primary" className="mb-2">
            {UI_LABELS.SELLER_PAGE.NO_PRODUCTS}
          </Heading>
          <Text className={`${themed.textSecondary} mb-4`}>
            {UI_LABELS.SELLER_PAGE.NO_PRODUCTS_SUBTITLE}
          </Text>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.SELLER.PRODUCTS_NEW)}
          >
            {UI_LABELS.SELLER_PAGE.ADD_PRODUCT}
          </Button>
        </Card>
      )}
    </div>
  );
}
