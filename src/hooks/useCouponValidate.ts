"use client";

import { useMutation } from "@tanstack/react-query";
import { validateCouponAction } from "@/actions";
import type { ValidateCouponResult } from "@/actions";

interface ValidateCouponPayload {
  code: string;
  orderTotal?: number;
}

/**
 * useCouponValidate
 * Wraps `validateCouponAction` as a mutation hook for PromoCodeInput.
 */
export function useCouponValidate() {
  return useMutation<ValidateCouponResult, Error, ValidateCouponPayload>({
    mutationFn: (payload) =>
      validateCouponAction({
        code: payload.code,
        orderTotal: payload.orderTotal ?? 0,
      }),
  });
}
