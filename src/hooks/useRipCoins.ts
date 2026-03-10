"use client";

/**
 * useRipCoins Hook
 *
 * Provides wallet balance query, coin purchase initiation,
 * purchase verification, refund, and history via the RipCoins API.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { useMessage } from "./useMessage";
import { ripcoinService } from "@/services";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

export function useRipCoinBalance() {
  return useQuery({
    queryKey: ["ripcoins", "balance"],
    queryFn: () => ripcoinService.getBalance(),
  });
}

export function usePurchaseRipCoins() {
  const { showError } = useMessage();

  return useMutation({
    mutationFn: (packageId: string) => ripcoinService.purchaseCoins(packageId),
    onError: () => showError(ERROR_MESSAGES.RIPCOIN.PURCHASE_FAILED),
  });
}

export function useVerifyRipCoinPurchase() {
  const { showSuccess, showError } = useMessage();

  return useMutation({
    mutationFn: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      packageId: string;
    }) => ripcoinService.verifyPurchase(data),
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.RIPCOIN.PURCHASE_COMPLETE),
    onError: () => showError(ERROR_MESSAGES.RIPCOIN.VERIFY_FAILED),
  });
}

export function useRefundRipCoinPurchase() {
  const { showSuccess, showError } = useMessage();

  return useMutation({
    mutationFn: (transactionId: string) =>
      ripcoinService.refundPurchase(transactionId),
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.RIPCOIN.REFUND_COMPLETE),
    onError: () => showError(ERROR_MESSAGES.RIPCOIN.REFUND_FAILED),
  });
}

export function useRipCoinHistory(params?: string) {
  return useQuery({
    queryKey: ["ripcoins", "history", params ?? ""],
    queryFn: () => ripcoinService.getHistory(params),
  });
}
