"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Heading, Main, Text, Button, Row, Stack } from "@mohasinac/appkit/ui";
import { CartView as AppkitCartView } from "@mohasinac/appkit/features/cart";

import { CartItemList } from "./CartItemList";
import { CartSummary } from "./CartSummary";
import { PromoCodeInput } from "./PromoCodeInput";
import { GuestCartItemRow } from "./GuestCartItemRow";
import { useMessage, useAuth, useGuestCart, useBottomActions } from "@/hooks";
import {
  useCart, useUpdateCartItem, useRemoveCartItem, } from "../hooks/useCartMutations";
import { useTranslations } from "next-intl";
import {
  ROUTES, THEME_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES, } from "@/constants";
import { formatCurrency } from "@mohasinac/appkit/utils";
import { setGuestReturnTo } from "@mohasinac/appkit/features/cart";


const { themed, spacing, typography, page } = THEME_CONSTANTS;

function CartPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div
        className={`h-8 w-48 rounded-lg mb-8 ${THEME_CONSTANTS.themed.bgSecondary}`}
      />
      <div className="lg:grid lg:grid-cols-3 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-3">
        <div className={`lg:col-span-2 ${spacing.stack}`}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-28 rounded-xl ${THEME_CONSTANTS.themed.bgSecondary}`}
            />
          ))}
        </div>
        <div
          className={`mt-8 lg:mt-0 h-72 rounded-xl ${THEME_CONSTANTS.themed.bgSecondary}`}
        />
      </div>
    </div>
  );
}

export function CartView() {
  const router = useRouter();
  const t = useTranslations("cart");
  const { showError, showSuccess } = useMessage();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const {
    items: guestItems,
    count: guestCount,
    remove: removeGuestItem,
    updateQuantity: updateGuestQuantity,
  } = useGuestCart();

  const { data, isLoading } = useCart(!!user);

  const { mutate: updateItem } = useUpdateCartItem(
    () => {
      showSuccess(SUCCESS_MESSAGES.CART.ITEM_UPDATED);
      setUpdatingItemId(null);
    },
    () => {
      showError(ERROR_MESSAGES.CART.UPDATE_FAILED);
      setUpdatingItemId(null);
    },
  );

  const { mutate: removeItem } = useRemoveCartItem(
    () => {
      showSuccess(SUCCESS_MESSAGES.CART.ITEM_REMOVED);
      setUpdatingItemId(null);
    },
    () => {
      showError(ERROR_MESSAGES.CART.REMOVE_FAILED);
      setUpdatingItemId(null);
    },
  );

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setUpdatingItemId(itemId);
    updateItem({ itemId, quantity });
  };

  const handleRemove = (itemId: string) => {
    setUpdatingItemId(itemId);
    removeItem({ itemId });
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    router.push(ROUTES.USER.CHECKOUT);
  };

  // ── Mobile checkout action bar ──
  useBottomActions({
    actions:
      user && (data?.itemCount ?? 0) > 0
        ? [
            {
              id: "checkout",
              label: t("guestProceedToCheckout"),
              variant: "primary" as const,
              badge: data?.itemCount,
              loading: isCheckingOut,
              onClick: handleCheckout,
            },
          ]
        : [],
  });

  if (authLoading || (!!user && isLoading)) return <CartPageSkeleton />;

  // Guest user — show items if they added any, otherwise sign-in gate
  if (!user) {
    if (guestCount === 0) {
      return (
        <Main className={`${page.container.xl} py-8`}>
          <Heading level={1} className="mb-8">
            {t("title")}
          </Heading>
          <Stack
            align="center"
            gap="md"
            className="py-16 text-center justify-center"
          >
            <Text className={themed.textSecondary}>{t("guestSubtitle")}</Text>
            <Row wrap justify="center" gap="3" className="mt-2">
              <Button
                onClick={() =>
                  router.push(
                    `${ROUTES.AUTH.LOGIN}?callbackUrl=${ROUTES.USER.CART}`,
                  )
                }
              >
                {t("guestSignIn")}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `${ROUTES.AUTH.REGISTER}?callbackUrl=${ROUTES.USER.CART}`,
                  )
                }
              >
                {t("guestCreateAccount")}
              </Button>
            </Row>
          </Stack>
        </Main>
      );
    }

    const guestSubtotal = guestItems.reduce(
      (sum, i) => sum + (i.price ?? 0) * i.quantity,
      0,
    );
    const hasPrices = guestItems.some((i) => i.price != null);

    return (
      <Main className={`${page.container.xl} py-8`}>
        <Heading level={1} className="mb-8">
          {t("title")}
        </Heading>
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start xl:grid-cols-3 2xl:grid-cols-3">
          {/* Items column */}
          <div className="lg:col-span-2 space-y-3">
            {guestItems.map((item) => (
              <GuestCartItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={updateGuestQuantity}
                onRemove={removeGuestItem}
              />
            ))}
          </div>

          {/* Sign-in CTA panel */}
          <div className={`mt-8 lg:mt-0 ${spacing.stack} lg:sticky lg:top-24`}>
            <Stack
              className={`p-6 rounded-xl border ${themed.bgPrimary} ${themed.border}`}
              gap="md"
            >
              {hasPrices && (
                <Row justify="between" gap="none">
                  <Text size="sm">{t("subtotal")}</Text>
                  <Text size="sm" weight="bold">
                    {formatCurrency(guestSubtotal)}
                  </Text>
                </Row>
              )}
              <Text size="sm" className={themed.textSecondary}>
                {t("guestSubtitle")}
              </Text>
              <Button
                onClick={() => {
                  setGuestReturnTo(ROUTES.USER.CHECKOUT);
                  router.push(
                    `${ROUTES.AUTH.LOGIN}?callbackUrl=${ROUTES.USER.CART}`,
                  );
                }}
                className="w-full"
              >
                {t("guestProceedToCheckout")}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `${ROUTES.AUTH.REGISTER}?callbackUrl=${ROUTES.USER.CART}`,
                  )
                }
                className="w-full"
              >
                {t("guestCreateAccount")}
              </Button>
            </Stack>
          </div>
        </div>
      </Main>
    );
  }

  const items = data?.cart?.items ?? [];
  const subtotal = data?.subtotal ?? 0;
  const itemCount = data?.itemCount ?? 0;

  return (
    <Main className={`${page.container.xl} py-8`}>
      <AppkitCartView
        labels={{ title: t("title") }}
        className={spacing.stack}
        renderItems={() => (
          <CartItemList
            items={items}
            updatingItemId={updatingItemId}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        )}
        renderPromoCode={() =>
          items.length > 0 ? (
            <div
              className={`p-4 rounded-xl border ${themed.bgPrimary} ${themed.border}`}
            >
              <PromoCodeInput
                subtotal={subtotal}
                cartItems={items}
                onApply={(amount, code) => {
                  setDiscount(amount);
                  setCouponCode(code);
                }}
                onRemove={() => {
                  setDiscount(0);
                  setCouponCode(null);
                }}
              />
            </div>
          ) : null
        }
        renderSummary={() =>
          items.length > 0 ? (
            <CartSummary
              subtotal={subtotal}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              discount={discount}
              couponCode={couponCode ?? undefined}
            />
          ) : null
        }
      />
    </Main>
  );
}

