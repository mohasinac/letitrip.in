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
import { Card, Button, Spinner, Heading, Text } from "@/components";
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

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  colorClass: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, colorClass, loading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <Text
            size="sm"
            className={`${themed.textSecondary} font-medium uppercase tracking-wide`}
          >
            {label}
          </Text>
          {loading ? (
            <div className="mt-2">
              <Spinner size="sm" variant="primary" />
            </div>
          ) : (
            <p className={`mt-1 text-3xl font-bold ${colorClass}`}>{value}</p>
          )}
        </div>
        <span className="text-3xl" aria-hidden>
          {icon}
        </span>
      </div>
    </Card>
  );
}

interface QuickActionButtonProps {
  label: string;
  href: string;
  icon: string;
  variant?: "primary" | "secondary" | "outline";
}

function QuickActionButton({
  label,
  href,
  icon,
  variant = "outline",
}: QuickActionButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant={variant}
      onClick={() => router.push(href)}
      className="flex items-center gap-2"
    >
      <span>{icon}</span>
      {label}
    </Button>
  );
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  // Fetch all seller products (large pageSize for stat counting)
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

  // Compute stats from fetched products
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
        <StatCard
          label={UI_LABELS.SELLER_PAGE.TOTAL_PRODUCTS}
          value={stats.total}
          icon="📦"
          colorClass="text-indigo-600 dark:text-indigo-400"
          loading={productsLoading}
        />
        <StatCard
          label={UI_LABELS.SELLER_PAGE.ACTIVE_LISTINGS}
          value={stats.activeListings}
          icon="🏪"
          colorClass="text-green-600 dark:text-green-400"
          loading={productsLoading}
        />
        <StatCard
          label={UI_LABELS.SELLER_PAGE.ACTIVE_AUCTIONS}
          value={stats.activeAuctions}
          icon="🔨"
          colorClass="text-purple-600 dark:text-purple-400"
          loading={productsLoading}
        />
        <StatCard
          label={UI_LABELS.SELLER_PAGE.DRAFT_PRODUCTS}
          value={stats.drafts}
          icon="📝"
          colorClass="text-yellow-600 dark:text-yellow-400"
          loading={productsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-5">
        <Heading level={4} variant="primary" className="mb-4">
          {UI_LABELS.SELLER_PAGE.QUICK_ACTIONS}
        </Heading>
        <div className="flex flex-wrap gap-3">
          <QuickActionButton
            label={UI_LABELS.SELLER_PAGE.ADD_PRODUCT}
            href={ROUTES.SELLER.PRODUCTS_NEW}
            icon="➕"
            variant="primary"
          />
          <QuickActionButton
            label={UI_LABELS.SELLER_PAGE.VIEW_PRODUCTS}
            href={ROUTES.SELLER.PRODUCTS}
            icon="📋"
          />
          <QuickActionButton
            label={UI_LABELS.SELLER_PAGE.VIEW_AUCTIONS}
            href={ROUTES.SELLER.AUCTIONS}
            icon="🔨"
          />
          <QuickActionButton
            label={UI_LABELS.SELLER_PAGE.VIEW_SALES}
            href={ROUTES.SELLER.ORDERS}
            icon="💰"
          />
        </div>
      </Card>

      {/* Recent Products Preview */}
      {!productsLoading && (productsData?.data?.length ?? 0) > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Heading level={4} variant="primary">
              Recent Listings
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}
            >
              View all
            </Button>
          </div>
          <div className={spacing.stack}>
            {productsData!.data.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between py-2 border-b last:border-0 ${themed.borderColor}`}
              >
                <Text className={themed.textPrimary}>{product.title}</Text>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    product.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : product.status === "draft"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {product.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

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
