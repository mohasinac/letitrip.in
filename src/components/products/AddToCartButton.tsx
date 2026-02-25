"use client";

import { UI_LABELS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { useAddToCart, useMessage } from "@/hooks";

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  price: number;
  isAuction?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  isAuction = false,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { showSuccess, showError } = useMessage();

  const { mutate, isLoading } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const handleClick = () => {
    if (isAuction) return;
    mutate({ productId, quantity: 1 });
  };

  const label = isAuction
    ? UI_LABELS.PRODUCT_DETAIL.PLACE_BID
    : isLoading
      ? UI_LABELS.LOADING.DEFAULT
      : UI_LABELS.PRODUCT_DETAIL.ADD_TO_CART;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors ${className}`}
    >
      {label}
    </button>
  );
}
