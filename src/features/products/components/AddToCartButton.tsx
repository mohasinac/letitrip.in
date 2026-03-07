"use client";

import { useTranslations } from "next-intl";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { useAddToCart, useMessage } from "@/hooks";
import { Button } from "@/components";

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
  price,
  isAuction = false,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { showSuccess, showError } = useMessage();
  const tProducts = useTranslations("products");
  const tAuctions = useTranslations("auctions");
  const tLoading = useTranslations("loading");

  const { mutate, isLoading } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const handleClick = () => {
    if (isAuction) return;
    mutate({ productId, quantity: 1, productTitle, price });
  };

  const label = isAuction
    ? tAuctions("placeBid")
    : isLoading
      ? tLoading("default")
      : tProducts("addToCart");

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors ${className}`}
    >
      {label}
    </Button>
  );
}
