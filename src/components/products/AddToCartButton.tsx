"use client";

import { UI_LABELS } from "@/constants";
import { useMessage } from "@/hooks";

/**
 * AddToCartButton - Stub component
 *
 * TODO (Task 1.4): Wire to cart API once cart schema/repo/API is implemented.
 * Currently shows a message that cart is coming soon.
 */
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
  productTitle,
  isAuction = false,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { showSuccess } = useMessage();

  const handleClick = () => {
    // TODO (Task 1.4): Replace with real cart mutation
    showSuccess("Cart coming soon! Check back after Task 1.4.");
  };

  const label = isAuction
    ? UI_LABELS.PRODUCT_DETAIL.PLACE_BID
    : UI_LABELS.PRODUCT_DETAIL.ADD_TO_CART;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors ${className}`}
    >
      {label}
    </button>
  );
}
