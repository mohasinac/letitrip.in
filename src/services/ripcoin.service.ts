/**
 * RipCoin Service
 *
 * Client-side service functions for RipCoin wallet operations.
 * All calls go through apiClient → API routes → Firebase Admin SDK.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export interface RipCoinBalance {
  ripcoinBalance: number;
  engagedRipcoins: number;
}

export interface RipCoinPurchaseInitResponse {
  razorpayOrderId: string;
  amountRs: number;
  coins: number;
  bonusCoins: number;
  totalCoins: number;
  packageId: string;
  currency: string;
  razorpayKeyId: string;
}

export interface RipCoinVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  packageId: string;
}

export interface RipCoinVerifyResponse {
  coinsCredited: number;
  bonusCoins: number;
  newBalance: number;
}

export interface RipCoinRefundResponse {
  coinsRefunded: number;
  newBalance: number;
  razorpayRefundId?: string;
}

export const ripcoinService = {
  /** GET wallet balance (ripcoinBalance + engagedRipcoins) */
  getBalance: () =>
    apiClient.get<RipCoinBalance>(API_ENDPOINTS.RIPCOINS.BALANCE),

  /** POST: create a Razorpay order for a fixed coin package */
  purchaseCoins: (packageId: string) =>
    apiClient.post<RipCoinPurchaseInitResponse>(
      API_ENDPOINTS.RIPCOINS.PURCHASE,
      { packageId },
    ),

  /** POST: verify Razorpay signature and credit coins */
  verifyPurchase: (data: RipCoinVerifyRequest) =>
    apiClient.post<RipCoinVerifyResponse>(API_ENDPOINTS.RIPCOINS.VERIFY, data),

  /** POST: refund a purchase transaction */
  refundPurchase: (transactionId: string) =>
    apiClient.post<RipCoinRefundResponse>(API_ENDPOINTS.RIPCOINS.REFUND, {
      transactionId,
    }),

  /** GET paginated transaction history */
  getHistory: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.RIPCOINS.HISTORY}${params ? `?${params}` : ""}`,
    ),
};
