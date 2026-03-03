"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { CartDocument } from "@/db/schema";
import {
  CartItemList,
  CartSummary,
  PromoCodeInput,
  Main,
  Heading,
} from "@/components";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { cartService } from "@/services";
import { useTranslations } from "next-intl";
import {
  ROUTES,
  THEME_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";

const { themed, spacing, typography, page } = THEME_CONSTANTS;

interface CartApiResponse {
  cart: CartDocument;
  itemCount: number;
  subtotal: number;
}

function CartPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div
        className={`h-8 w-48 rounded-lg mb-8 ${THEME_CONSTANTS.themed.bgSecondary}`}
      />
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
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

  const { data, isLoading, refetch } = useApiQuery<CartApiResponse>({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
  });

  const { mutate: updateItem } = useApiMutation<
    unknown,
    { itemId: string; quantity: number }
  >({
    mutationFn: ({ itemId, quantity }) =>
      cartService.updateItem(itemId, { quantity }),
    onSuccess: () => {
      refetch();
      setUpdatingItemId(null);
    },
    onError: () => {
      showError(ERROR_MESSAGES.CART.UPDATE_FAILED);
      setUpdatingItemId(null);
    },
  });

  const { mutate: removeItem } = useApiMutation<unknown, { itemId: string }>({
    mutationFn: ({ itemId }) => cartService.removeItem(itemId),
    onSuccess: () => {
      showSuccess(SUCCESS_MESSAGES.CART.ITEM_REMOVED);
      refetch();
      setUpdatingItemId(null);
    },
    onError: () => {
      showError(ERROR_MESSAGES.CART.REMOVE_FAILED);
      setUpdatingItemId(null);
    },
  });

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

  if (isLoading) return <CartPageSkeleton />;

  const items = data?.cart?.items ?? [];
  const subtotal = data?.subtotal ?? 0;
  const itemCount = data?.itemCount ?? 0;

  return (
    <Main className={`${page.container.xl} py-8`}>
      <Heading level={1} className="mb-8">
        {t("title")}
      </Heading>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        {/* Left column: cart items */}
        <div className="lg:col-span-2">
          <CartItemList
            items={items}
            updatingItemId={updatingItemId}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        </div>

        {/* Right column: promo + summary */}
        {items.length > 0 && (
          <div className={`mt-8 lg:mt-0 ${spacing.stack} lg:sticky lg:top-24`}>
            <div
              className={`p-4 rounded-xl border ${themed.bgPrimary} ${themed.border}`}
            >
              <PromoCodeInput
                subtotal={subtotal}
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

            <CartSummary
              subtotal={subtotal}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              discount={discount}
              couponCode={couponCode ?? undefined}
            />
          </div>
        )}
      </div>
    </Main>
  );
}
