"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Tag, Plus } from "lucide-react";
import {
  Caption,
  Grid,
  Heading,
  Text,
  Spinner,
  Span,
  Badge,
  Button,
} from "@mohasinac/appkit/ui";
import { SellerCouponsView as AppkitSellerCouponsView } from "@mohasinac/appkit/features/seller";
import { EmptyState, Card } from "@/components";
import { useAuth, useMessage } from "@/hooks";
import {
  ROUTES,
  THEME_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";
import { formatCurrency, formatDate, resolveDate } from "@/utils";
import { useSellerCoupons } from "../hooks/useSellerCoupons";
import type { CouponDocument } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

function CouponCard({
  coupon,
  onToggle,
  onDelete,
  deleting,
  toggling,
}: {
  coupon: CouponDocument;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
  toggling: boolean;
}) {
  const t = useTranslations("sellerCoupons");
  const isActive = coupon.validity.isActive;

  const discountLabel =
    coupon.type === "percentage"
      ? `${coupon.discount.value}% off`
      : coupon.type === "fixed"
        ? `${formatCurrency(coupon.discount.value)} off`
        : coupon.type === "free_shipping"
          ? t("typeFreeShipping")
          : t("typeBxgy");

  const scopeLabel = coupon.applicableToAuctions
    ? t("scopeAuctions")
    : t("scopeRegular");

  const resolved = coupon.validity.endDate
    ? resolveDate(coupon.validity.endDate)
    : null;
  const endDate = resolved ? formatDate(resolved) : t("noExpiry");

  return (
    <Card
      className={`p-4 border ${themed.border} rounded-xl ${themed.bgPrimary}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Code */}
          <div className={`${flex.row} gap-2 mb-1 flex-wrap`}>
            <Span className="font-mono font-bold text-primary text-sm tracking-wide">
              {coupon.code}
            </Span>
            <Badge
              variant={isActive ? "success" : "default"}
              className="text-xs"
            >
              {isActive ? t("badgeActive") : t("badgeInactive")}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {scopeLabel}
            </Badge>
          </div>

          {/* Name */}
          <Heading
            level={4}
            variant="primary"
            className="text-sm font-medium mb-1 truncate"
          >
            {coupon.name}
          </Heading>

          {/* Discount info grid */}
          <Grid
            gap="none"
            className="grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2"
          >
            <div>
              <Caption className={`text-xs ${themed.textSecondary}`}>
                {t("labelDiscount")}
              </Caption>
              <Span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {discountLabel}
              </Span>
            </div>
            {coupon.discount.minPurchase && (
              <div>
                <Caption className={`text-xs ${themed.textSecondary}`}>
                  {t("labelMinPurchase")}
                </Caption>
                <Span className="text-sm">
                  {formatCurrency(coupon.discount.minPurchase)}
                </Span>
              </div>
            )}
            <div>
              <Caption className={`text-xs ${themed.textSecondary}`}>
                {t("labelExpiry")}
              </Caption>
              <Span className="text-sm">{endDate}</Span>
            </div>
            <div>
              <Caption className={`text-xs ${themed.textSecondary}`}>
                {t("labelUsed")}
              </Caption>
              <Span className="text-sm">
                {coupon.usage.currentUsage}
                {coupon.usage.totalLimit ? ` / ${coupon.usage.totalLimit}` : ""}
              </Span>
            </div>
          </Grid>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            variant="outline"
            className="text-xs px-2 py-1"
            onClick={() => onToggle(coupon.id, !isActive)}
            isLoading={toggling}
            disabled={toggling || deleting}
          >
            {isActive ? t("actionDeactivate") : t("actionActivate")}
          </Button>
          <Button
            variant="danger"
            className="text-xs px-2 py-1"
            onClick={() => onDelete(coupon.id)}
            isLoading={deleting}
            disabled={toggling || deleting}
          >
            {t("actionDelete")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function SellerCouponsView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useMessage();
  const t = useTranslations("sellerCoupons");

  useEffect(() => {
    if (!authLoading && !user) {
      showError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router, showError]);

  const { coupons, isLoading, toggleActive, deleteCoupon } = useSellerCoupons(
    !authLoading && !!user,
  );

  const handleToggle = async (id: string, isActive: boolean) => {
    const result = await toggleActive
      .mutateAsync({ id, isActive })
      .catch((e) => {
        showError((e as Error).message ?? t("errorToggle"));
        return null;
      });
    if (result)
      showSuccess(isActive ? t("successActivated") : t("successDeactivated"));
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCoupon.mutateAsync(id).catch((e) => {
      showError((e as Error).message ?? t("errorDelete"));
      return null;
    });
    if (result !== null) showSuccess(t("successDeleted"));
  };

  if (authLoading || isLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  return (
    <AppkitSellerCouponsView
      labels={{ title: t("pageTitle") }}
      total={coupons.length}
      isLoading={isLoading}
      renderHeader={() => (
        <div className={`${flex.between} flex-wrap gap-3`}>
          <div>
            <Heading level={2} variant="primary">
              {t("pageTitle")}
            </Heading>
            <Text className={`${themed.textSecondary} mt-1`}>
              {t("pageSubtitle")}
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.SELLER.COUPONS_NEW)}
            className={`${flex.row} gap-2 items-center`}
          >
            <Plus className="w-4 h-4" />
            {t("createCoupon")}
          </Button>
        </div>
      )}
      renderFilters={() => (
        <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4">
          <div className={`${flex.row} gap-2 items-start`}>
            <Tag className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <Text className="text-sm text-primary">{t("infoBanner")}</Text>
          </div>
        </div>
      )}
      renderTable={() =>
        coupons.length === 0 ? (
          <EmptyState
            icon={<Tag className="w-10 h-10" />}
            title={t("emptyTitle")}
            description={t("emptySubtitle")}
            actionLabel={t("createCoupon")}
            onAction={() => router.push(ROUTES.SELLER.COUPONS_NEW)}
          />
        ) : (
          <div className={THEME_CONSTANTS.grid.addressCards}>
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onToggle={handleToggle}
                onDelete={handleDelete}
                deleting={
                  deleteCoupon.isPending && deleteCoupon.variables === coupon.id
                }
                toggling={
                  toggleActive.isPending &&
                  (toggleActive.variables as { id: string })?.id === coupon.id
                }
              />
            ))}
          </div>
        )
      }
    />
  );
}

