"use client";

/**
 * useRipCoins Hook
 *
 * Provides wallet balance query, coin purchase initiation,
 * and purchase verification via the RipCoins API.
 *
 * Usage:
 * ```tsx
 * const { balance, purchase, verifyPurchase, history } = useRipCoins();
 * ```
 */

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { useMessage } from "./useMessage";
import { ripcoinService } from "@/services";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

export function useRipCoinBalance() {
  return useApiQuery({
    queryKey: ["ripcoins", "balance"],
    queryFn: () => ripcoinService.getBalance(),
  });
}

export function usePurchaseRipCoins() {
  const { showSuccess, showError } = useMessage();

  return useApiMutation({
    mutationFn: (packs: number) => ripcoinService.purchaseCoins(packs),
    onError: () => showError(ERROR_MESSAGES.RIPCOIN.PURCHASE_FAILED),
  });
}

export function useVerifyRipCoinPurchase() {
  const { showSuccess, showError } = useMessage();

  return useApiMutation({
    mutationFn: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      packs: number;
    }) => ripcoinService.verifyPurchase(data),
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.RIPCOIN.PURCHASE_COMPLETE),
    onError: () => showError(ERROR_MESSAGES.RIPCOIN.VERIFY_FAILED),
  });
}

export function useRipCoinHistory(params?: string) {
  return useApiQuery({
    queryKey: ["ripcoins", "history", params ?? ""],
    queryFn: () => ripcoinService.getHistory(params),
  });
}
