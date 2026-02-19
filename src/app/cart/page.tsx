"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CartDocument } from "@/db/schema";
import { CartItemList, CartSummary, PromoCodeInput } from "@/components";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  ROUTES,
  UI_LABELS,
  THEME_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";

const { themed, spacing, typography } = THEME_CONSTANTS;

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

export default function CartPage() {
  const router = useRouter();
  const { showError, showSuccess } = useMessage();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const { data, isLoading, refetch } = useApiQuery<CartApiResponse>({
    queryKey: ["cart"],
    queryFn: () => apiClient.get(API_ENDPOINTS.CART.GET),
  });

  const { mutate: updateItem } = useApiMutation<
    unknown,
    { itemId: string; quantity: number }
  >({
    mutationFn: ({ itemId, quantity }) =>
      apiClient.patch(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), { quantity }),
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
    mutationFn: ({ itemId }) =>
      apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId)),
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page heading */}
      <h1 className={`${typography.h2} ${themed.textPrimary} mb-8`}>
        {UI_LABELS.CART.TITLE}
      </h1>

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
            {/* Promo code */}
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

            {/* Order summary */}
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
    </main>
  );
}
