"use client";

/**
 * useRC Hook
 *
 * Provides wallet balance query, coin purchase initiation,
 * purchase verification, refund, and history via the RC API.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { useMessage } from "./useMessage";
import { apiClient } from "@/lib/api-client";
import { getRCBalanceAction, getRCHistoryAction } from "@/actions";
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

export function useRCBalance() {
  return useQuery({
    queryKey: ["rc", "balance"],
    queryFn: () => getRCBalanceAction(),
  });
}

export function usePurchaseRC() {
  const { showError } = useMessage();

  return useMutation({
    mutationFn: (packageId: string) =>
      apiClient.post(API_ENDPOINTS.RC.PURCHASE, { packageId }),
    onError: () => showError(ERROR_MESSAGES.RC.PURCHASE_FAILED),
  });
}

export function useVerifyRCPurchase() {
  const { showSuccess, showError } = useMessage();

  return useMutation({
    mutationFn: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      packageId: string;
    }) => apiClient.post(API_ENDPOINTS.RC.VERIFY, data),
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.RC.PURCHASE_COMPLETE),
    onError: () => showError(ERROR_MESSAGES.RC.VERIFY_FAILED),
  });
}

export function useRefundRCPurchase() {
  const { showSuccess, showError } = useMessage();

  return useMutation({
    mutationFn: (transactionId: string) =>
      apiClient.post(API_ENDPOINTS.RC.REFUND, { transactionId }),
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.RC.REFUND_COMPLETE),
    onError: () => showError(ERROR_MESSAGES.RC.REFUND_FAILED),
  });
}

export function useRCHistory(params?: string) {
  return useQuery({
    queryKey: ["rc", "history", params ?? ""],
    queryFn: () => {
      const sp = params ? new URLSearchParams(params) : null;
      return getRCHistoryAction({
        filters: sp?.get("filters") ?? undefined,
        sorts: sp?.get("sorts") ?? undefined,
        page: sp?.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp?.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
    },
  });
}
