"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { Package, Store, Gavel, FileText } from "lucide-react";
import { Grid, Text, Spinner } from "@mohasinac/appkit/ui";
import { SellerDashboardView as AppkitSellerDashboardView } from "@mohasinac/appkit/features/seller";
import { EmptyState } from "@/components";
import { useAuth } from "@/contexts/SessionContext";
import { useMessage } from "@mohasinac/appkit/react";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerDashboard } from "../hooks/useSellerDashboard";
import { SellerStatCard } from "./SellerStatCard";
import { SellerQuickActions } from "./SellerQuickActions";
import { SellerRecentListings } from "./SellerRecentListings";

const { themed, enhancedCard, flex } = THEME_CONSTANTS;

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

  const { productsData, isLoading: productsLoading } = useSellerDashboard(
    user?.uid,
  );

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
    <AppkitSellerDashboardView
      labels={{
        title: t("welcome", {
          name: user.displayName ?? user.email ?? "Seller",
        }),
      }}
      isLoading={productsLoading}
      renderStats={(loading) => (
        <Grid className={THEME_CONSTANTS.grid.productCards} gap="md">
          <SellerStatCard
            label={t("totalProducts")}
            value={stats.total}
            icon={<Package className="w-5 h-5" />}
            cardClass={enhancedCard.stat.indigo}
            iconClass="text-primary"
            loading={loading}
          />
          <SellerStatCard
            label={t("activeListings")}
            value={stats.activeListings}
            icon={<Store className="w-5 h-5" />}
            cardClass={enhancedCard.stat.emerald}
            iconClass="text-emerald-600 dark:text-emerald-400"
            loading={loading}
          />
          <SellerStatCard
            label={t("activeAuctions")}
            value={stats.activeAuctions}
            icon={<Gavel className="w-5 h-5" />}
            cardClass={enhancedCard.stat.teal}
            iconClass="text-teal-600 dark:text-teal-400"
            loading={loading}
          />
          <SellerStatCard
            label={t("draftProducts")}
            value={stats.drafts}
            icon={<FileText className="w-5 h-5" />}
            cardClass={enhancedCard.stat.amber}
            iconClass="text-amber-600 dark:text-amber-400"
            loading={loading}
          />
        </Grid>
      )}
      renderQuickActions={() => (
        <>
          <Text className={`${themed.textSecondary} mb-4`}>
            {t("subtitle")}
          </Text>
          <SellerQuickActions />
        </>
      )}
      renderRecentListings={() => (
        <>
          <SellerRecentListings
            products={productsData?.items ?? []}
            loading={productsLoading}
          />
          {!productsLoading && (productsData?.items?.length ?? 0) === 0 && (
            <EmptyState
              icon={<Store className="w-10 h-10 text-zinc-400" />}
              title={t("noProducts")}
              description={t("noProductsSubtitle")}
              actionLabel={t("addProduct")}
              onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
            />
          )}
        </>
      )}
    />
  );
}

