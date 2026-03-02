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
  coinsToBuy: number;
  packs: number;
  currency: string;
  razorpayKeyId: string;
}

export interface RipCoinVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  packs: number;
}

export interface RipCoinVerifyResponse {
  coinsCredited: number;
  newBalance: number;
}

export const ripcoinService = {
  /** GET wallet balance (ripcoinBalance + engagedRipcoins) */
  getBalance: () =>
    apiClient.get<RipCoinBalance>(API_ENDPOINTS.RIPCOINS.BALANCE),

  /** POST: create a Razorpay order for coin purchase */
  purchaseCoins: (packs: number) =>
    apiClient.post<RipCoinPurchaseInitResponse>(
      API_ENDPOINTS.RIPCOINS.PURCHASE,
      { packs },
    ),

  /** POST: verify Razorpay signature and credit coins */
  verifyPurchase: (data: RipCoinVerifyRequest) =>
    apiClient.post<RipCoinVerifyResponse>(API_ENDPOINTS.RIPCOINS.VERIFY, data),

  /** GET paginated transaction history */
  getHistory: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.RIPCOINS.HISTORY}${params ? `?${params}` : ""}`,
    ),
};
