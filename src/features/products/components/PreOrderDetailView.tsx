/**
 * PreOrderDetailView
 *
 * Full pre-order detail page. Shows product gallery, pre-order info,
 * and a reservation summary panel.
 */

"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Badge,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Divider,
  Heading,
  Span,
  Text,
  TextLink,
  Accordion,
  AccordionItem,
  Ul,
  Li,
} from "@/components";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductFeatureBadges } from "./ProductFeatureBadges";
import {
  ROUTES,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useWishlistToggle, useMessage, useRazorpay } from "@/hooks";
import { useProductDetail } from "../hooks/useProductDetail";
import { checkoutService, addressService } from "@/services";
import { formatCurrency, formatDate } from "@/utils";
import type { ProductDocument } from "@/db/schema";
import type { Address } from "@/hooks";

const { themed, flex, page, spacing } = THEME_CONSTANTS;

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  in_production: "In Production",
  ready_to_ship: "Ready to Ship",
};

const STATUS_COLORS: Record<
  string,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  upcoming: "info",
  in_production: "warning",
  ready_to_ship: "success",
};

interface PreOrderDetailViewProps {
  id: string;
}

export function PreOrderDetailView({ id }: PreOrderDetailViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("preOrderDetail");
  const { showSuccess, showError } = useMessage();
  const { openRazorpay } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const productQuery = useProductDetail(id);
  const product = productQuery.product;

  const { data: addressesData } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: () => addressService.list(),
    enabled: !!user,
  });

  const createPaymentOrderMutation = useMutation({
    mutationFn: (data: unknown) => checkoutService.createPaymentOrder(data),
  });

  const verifyDepositMutation = useMutation({
    mutationFn: (data: unknown) => checkoutService.verifyPreOrderDeposit(data),
  });

  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product?.id ?? "");

  const handleWishlistToggle = useCallback(async () => {
    const wasInWishlist = inWishlist;
    try {
      await toggleWishlist();
      showSuccess(
        wasInWishlist
          ? SUCCESS_MESSAGES.WISHLIST.REMOVED
          : SUCCESS_MESSAGES.WISHLIST.ADDED,
      );
    } catch {
      showError(
        wasInWishlist
          ? ERROR_MESSAGES.WISHLIST.REMOVE_FAILED
          : ERROR_MESSAGES.WISHLIST.ADD_FAILED,
      );
    }
  }, [inWishlist, toggleWishlist, showSuccess, showError]);

  const spotsLeft =
    product?.preOrderMaxQuantity != null &&
    product?.preOrderCurrentCount != null
      ? product.preOrderMaxQuantity - product.preOrderCurrentCount
      : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;
  const depositAmount =
    product?.preOrderDepositAmount ??
    (product?.preOrderDepositPercent && product?.price
      ? Math.round((product.price * product.preOrderDepositPercent) / 100)
      : null);

  const handleReserve = useCallback(async () => {
    if (!product || !depositAmount) return;
    const addresses = addressesData ?? [];
    const address = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (!address) {
      showError(t("noAddressError"));
      router.push(ROUTES.USER.ADDRESSES);
      return;
    }
    setIsProcessing(true);
    try {
      const rzpOrder = (await createPaymentOrderMutation.mutateAsync({
        amount: depositAmount,
        currency: "INR",
        receipt: `preorder_${product.id}`,
      })) as {
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      const paymentResult = await openRazorpay({
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.razorpayOrderId,
        name: "LetItRip",
        description: `Pre-order deposit for ${product.title}`,
        prefill: { email: user?.email ?? undefined },
        theme: { color: "#7c3aed" },
        handler: () => {},
      });

      const result = (await verifyDepositMutation.mutateAsync({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        productId: product.id,
        addressId: address.id,
      })) as { orderId: string };

      showSuccess(t("reservationSuccess"));
      router.push(ROUTES.USER.ORDER_DETAIL(result.orderId));
    } catch (err: unknown) {
      const isCancelled =
        err instanceof Error && err.message === "Payment cancelled by user";
      if (!isCancelled) showError(t("reservationFailed"));
    } finally {
      setIsProcessing(false);
    }
  }, [
    product,
    depositAmount,
    addressesData,
    user,
    openRazorpay,
    createPaymentOrderMutation,
    verifyDepositMutation,
    showSuccess,
    showError,
    router,
    t,
  ]);

  // Loading skeleton
  if (productQuery.isLoading) {
    return (
      <div className={`min-h-screen ${themed.bgSecondary}`}>
        <div className={`${page.container.xl} py-6 sm:py-8`}>
          <div className="h-4 w-48 bg-zinc-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] gap-6 lg:gap-8">
            <div className="animate-pulse space-y-3">
              <div className="aspect-square bg-zinc-200 dark:bg-slate-700 rounded-2xl" />
            </div>
            <div className={`animate-pulse ${spacing.stack}`}>
              <div className="h-8 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productQuery.error || (!productQuery.isLoading && !product)) {
    return (
      <div
        className={`min-h-screen ${themed.bgSecondary} ${flex.center} flex-col gap-4`}
      >
        <Text variant="secondary">{t("notFound")}</Text>
        <Button
          variant="primary"
          onClick={() => router.push(ROUTES.PUBLIC.PRE_ORDERS)}
        >
          {t("backToPreOrders")}
        </Button>
      </div>
    );
  }

  const productionStatus = product!.preOrderProductionStatus ?? "upcoming";

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className={`${page.container.xl} py-6 sm:py-8`}>
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem href={ROUTES.HOME}>
            {t("breadcrumbHome")}
          </BreadcrumbItem>
          <BreadcrumbItem href={ROUTES.PUBLIC.PRE_ORDERS}>
            {t("breadcrumbPreOrders")}
          </BreadcrumbItem>
          <BreadcrumbItem>{product!.title}</BreadcrumbItem>
        </Breadcrumbs>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px] gap-6 lg:gap-8">
          {/* ── Col 1: Gallery ── */}
          <div>
            <ProductImageGallery
              mainImage={product!.mainImage}
              images={product!.images}
              video={product!.video}
              title={product!.title}
              slug={product!.slug}
            />
          </div>

          {/* ── Col 2: Product Info ── */}
          <div className={`flex flex-col gap-5`}>
            {/* Status badge + PRE-ORDER label */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info">📅 {t("preOrderBadge")}</Badge>
              <Badge variant={STATUS_COLORS[productionStatus] ?? "info"}>
                {STATUS_LABELS[productionStatus] ?? productionStatus}
              </Badge>
            </div>

            {/* Title */}
            <Heading level={1} className="text-2xl sm:text-3xl leading-tight">
              {product!.title}
            </Heading>

            {/* Sold by */}
            <Text size="sm" variant="secondary">
              {t("soldBy")}{" "}
              <TextLink
                href={ROUTES.PUBLIC.STORE_DETAIL(
                  product!.storeId ?? product!.sellerId,
                )}
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                {product!.sellerName}
              </TextLink>
            </Text>

            <Divider />

            {/* Price & deposit */}
            <div className={`flex flex-col gap-1`}>
              <Text size="sm" variant="secondary">
                {t("totalPrice")}
              </Text>
              <Heading
                level={2}
                className="text-2xl font-bold text-purple-600 dark:text-purple-400"
              >
                {formatCurrency(product!.price)}
              </Heading>
              {depositAmount != null && (
                <Text
                  size="sm"
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  {t("depositDue", {
                    amount: formatCurrency(depositAmount),
                    percent: product!.preOrderDepositPercent ?? "",
                  })}
                </Text>
              )}
            </div>

            {/* Delivery date */}
            {product!.preOrderDeliveryDate && (
              <div className={`${flex.rowCenter} gap-2`}>
                <Span className="text-sm text-zinc-500 dark:text-zinc-400">
                  🚚 {t("estimatedDelivery")}:
                </Span>
                <Span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {formatDate(product!.preOrderDeliveryDate)}
                </Span>
              </div>
            )}

            {/* Spots info */}
            {spotsLeft !== null && !isSoldOut && (
              <Text
                size="sm"
                className="text-amber-600 dark:text-amber-400 font-medium"
              >
                🔥 {t("spotsLeft", { count: spotsLeft })}
              </Text>
            )}
            {isSoldOut && (
              <Text
                size="sm"
                className="text-red-600 dark:text-red-400 font-medium"
              >
                {t("soldOut")}
              </Text>
            )}

            {product!.preOrderCancellable && (
              <Text size="sm" variant="secondary">
                ✅ {t("cancellableInfo")}
              </Text>
            )}

            <Divider />

            {/* Feature badges (condition, insurance, etc.) */}
            {product && (
              <ProductFeatureBadges
                featured={product.featured}
                condition={product.condition}
                isAuction={product.isAuction}
              />
            )}

            {/* Description */}
            {product!.description && (
              <div>
                <Heading level={3} className="text-base mb-2">
                  {t("description")}
                </Heading>
                <Text
                  size="sm"
                  variant="secondary"
                  className="whitespace-pre-line"
                >
                  {product!.description}
                </Text>
              </div>
            )}

            {/* Specifications */}
            {product!.specifications && product!.specifications.length > 0 && (
              <Accordion>
                <AccordionItem
                  value="specifications"
                  title={t("specifications")}
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product!.specifications.map((spec, i) => (
                      <div key={i}>
                        <Span className="text-zinc-500 dark:text-zinc-400 block">
                          {spec.name}
                        </Span>
                        <Span className="font-medium">
                          {spec.value}
                          {spec.unit ? ` ${spec.unit}` : ""}
                        </Span>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            )}

            {/* Features */}
            {product!.features && product!.features.length > 0 && (
              <Accordion>
                <AccordionItem value="features" title={t("features")}>
                  <Ul className="space-y-1">
                    {product!.features.map((f, i) => (
                      <Li
                        key={i}
                        className="text-sm text-zinc-600 dark:text-zinc-300"
                      >
                        • {f}
                      </Li>
                    ))}
                  </Ul>
                </AccordionItem>
              </Accordion>
            )}

            {/* Delivery & Returns accordion */}
            <Accordion>
              <AccordionItem
                value="delivery-returns"
                title={t("deliveryReturns")}
              >
                {product!.shippingInfo && (
                  <Text size="sm" variant="secondary">
                    {product!.shippingInfo}
                  </Text>
                )}
                {product!.returnPolicy && (
                  <Text size="sm" variant="secondary" className="mt-2">
                    {product!.returnPolicy}
                  </Text>
                )}
              </AccordionItem>
            </Accordion>
          </div>

          {/* ── Col 3: Reservation Panel (sticky) ── */}
          <div className="lg:sticky lg:top-24 self-start">
            <div
              className={`${themed.bgPrimary} rounded-xl border border-zinc-100 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-lg`}
            >
              {/* Pre-order label */}
              <div className="flex items-center gap-2">
                <Span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                  {t("preOrderBadge")}
                </Span>
              </div>

              {/* Price summary */}
              <div>
                <Text size="sm" variant="secondary">
                  {t("totalPrice")}
                </Text>
                <Text className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(product!.price)}
                </Text>
                {depositAmount != null && (
                  <Text
                    size="sm"
                    className="text-emerald-600 dark:text-emerald-400 mt-1"
                  >
                    {t("payNow", { amount: formatCurrency(depositAmount) })}
                  </Text>
                )}
              </div>

              {/* Delivery */}
              {product!.preOrderDeliveryDate && (
                <div
                  className={`bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 ${flex.rowCenter} gap-2`}
                >
                  <Span className="text-xl">🗓️</Span>
                  <div>
                    <Text size="xs" variant="secondary">
                      {t("estimatedDelivery")}
                    </Text>
                    <Text
                      size="sm"
                      className="font-semibold text-purple-700 dark:text-purple-300"
                    >
                      {formatDate(product!.preOrderDeliveryDate)}
                    </Text>
                  </div>
                </div>
              )}

              {/* Spots */}
              {spotsLeft !== null && !isSoldOut && (
                <Text
                  size="xs"
                  className="text-amber-600 dark:text-amber-400 text-center font-semibold"
                >
                  🔥 {t("onlyNLeft", { count: spotsLeft })}
                </Text>
              )}

              {/* Reserve button */}
              {isSoldOut ? (
                <Button
                  variant="ghost"
                  className="w-full cursor-not-allowed opacity-60"
                  disabled
                >
                  {t("soldOut")}
                </Button>
              ) : user ? (
                <Button
                  variant="primary"
                  className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                  onClick={handleReserve}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  {t("reserveNow")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push(ROUTES.AUTH.LOGIN)}
                >
                  {t("loginToReserve")}
                </Button>
              )}

              {/* Wishlist */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                {inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
              </Button>

              {/* Cancellation note */}
              {product!.preOrderCancellable && (
                <Text size="xs" variant="secondary" className="text-center">
                  ✅ {t("cancellableShort")}
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
