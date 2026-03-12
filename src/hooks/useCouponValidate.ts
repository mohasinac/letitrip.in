"use client";

import { useMutation } from "@tanstack/react-query";
import { validateCouponAction, validateCouponForCartAction } from "@/actions";
import type {
  ValidateCouponResult,
  ValidateCouponForCartResult,
} from "@/actions";
import type { CartItemDocument } from "@/db/schema";

interface ValidateCouponPayload {
  code: string;
  orderTotal?: number;
  cartItems?: Pick<
    CartItemDocument,
    "productId" | "sellerId" | "price" | "quantity" | "isPreOrder" | "isAuction"
  >[];
}

/**
 * useCouponValidate
 *
 * Wraps coupon validation as a mutation hook for PromoCodeInput.
 * When `cartItems` is provided: calls `validateCouponForCartAction` which
 * enforces seller-scoping, auction-only, and pre-order exclusion rules.
 * Otherwise falls back to the simple `validateCouponAction`.
 */
export function useCouponValidate() {
  return useMutation<
    ValidateCouponResult | ValidateCouponForCartResult,
    Error,
    ValidateCouponPayload
  >({
    mutationFn: (payload) => {
      if (payload.cartItems && payload.cartItems.length > 0) {
        return validateCouponForCartAction({
          code: payload.code,
          cartItems: payload.cartItems,
        });
      }
      return validateCouponAction({
        code: payload.code,
        orderTotal: payload.orderTotal ?? 0,
      });
    },
  });
}
