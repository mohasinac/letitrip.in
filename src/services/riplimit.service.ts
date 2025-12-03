/**
 * RipLimit Service
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Frontend service that calls RipLimit API endpoints.
 * All database operations are handled by the API routes, NOT by this service.
 */

import { apiService } from "./api.service";
import { logError } from "@/lib/firebase-error-logger";
import {
  RipLimitBalanceFE,
  RipLimitTransactionHistoryFE,
  RipLimitPurchaseResponseFE,
  RipLimitPurchaseVerifyResponseFE,
} from "@/types/frontend/riplimit.types";
import { RipLimitTransactionBE } from "@/types/backend/riplimit.types";
import {
  toFERipLimitBalance,
  toFERipLimitTransactionHistory,
  createEmptyBalance,
} from "@/types/transforms/riplimit.transforms";

/**
 * RipLimit Service - Frontend service for RipLimit operations
 * All methods call API endpoints and transform BE responses to FE types
 */
class RipLimitService {
  /**
   * Get current user's RipLimit balance
   */
  async getBalance(): Promise<RipLimitBalanceFE> {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: {
          availableBalance: number;
          blockedBalance: number;
          totalBalance: number;
          availableBalanceINR: number;
          blockedBalanceINR: number;
          totalBalanceINR: number;
          hasUnpaidAuctions: boolean;
          unpaidAuctionIds: string[];
          isBlocked: boolean;
          blockedBids: Array<{
            auctionId: string;
            bidId: string;
            amount: number;
            bidAmountINR: number;
          }>;
        };
      }>("/riplimit/balance");

      if (!response.success) {
        throw new Error("Failed to get balance");
      }

      return toFERipLimitBalance(response.data);
    } catch (error) {
      logError(error, { component: "RipLimitService.getBalance" });
      return createEmptyBalance();
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    options: {
      type?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<RipLimitTransactionHistoryFE> {
    const params = new URLSearchParams();
    if (options.type) params.set("type", options.type);
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.offset) params.set("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/riplimit/transactions${queryString ? `?${queryString}` : ""}`;

    const response = await apiService.get<{
      success: boolean;
      data: {
        transactions: RipLimitTransactionBE[];
        total: number;
      };
    }>(endpoint);

    if (!response.success) {
      throw new Error("Failed to get transactions");
    }

    return toFERipLimitTransactionHistory(
      response.data,
      options.limit || 20,
      options.offset || 0,
    );
  }

  /**
   * Initiate RipLimit purchase
   */
  async initiatePurchase(
    ripLimitAmount: number,
  ): Promise<RipLimitPurchaseResponseFE> {
    const response = await apiService.post<{
      success: boolean;
      data: {
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        ripLimitAmount: number;
      };
    }>("/riplimit/purchase", { ripLimitAmount });

    if (!response.success) {
      throw new Error("Failed to initiate purchase");
    }

    return {
      orderId: response.data.orderId,
      razorpayOrderId: response.data.razorpayOrderId,
      amount: response.data.amount,
      currency: response.data.currency,
      ripLimitAmount: response.data.ripLimitAmount,
      formattedAmount: `₹${response.data.amount.toLocaleString("en-IN")}`,
    };
  }

  /**
   * Verify RipLimit purchase after Razorpay payment
   */
  async verifyPurchase(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<RipLimitPurchaseVerifyResponseFE> {
    const response = await apiService.post<{
      success: boolean;
      data: {
        newBalance: number;
        purchasedAmount: number;
      };
      message?: string;
    }>("/riplimit/purchase/verify", data);

    if (!response.success) {
      throw new Error(response.message || "Failed to verify purchase");
    }

    return {
      success: true,
      newBalance: response.data.newBalance,
      formattedNewBalance: `${response.data.newBalance.toLocaleString("en-IN")} RL`,
      purchasedAmount: response.data.purchasedAmount,
      formattedPurchasedAmount: `${response.data.purchasedAmount.toLocaleString("en-IN")} RL`,
      message: response.message || "Purchase successful!",
    };
  }

  /**
   * Request refund of available RipLimit balance
   */
  async requestRefund(
    amount: number,
    reason?: string,
  ): Promise<{
    success: boolean;
    refundId: string;
    message: string;
  }> {
    const response = await apiService.post<{
      success: boolean;
      data: {
        refundId: string;
      };
      message?: string;
    }>("/riplimit/refund", { amount, reason });

    if (!response.success) {
      throw new Error(response.message || "Failed to request refund");
    }

    return {
      success: true,
      refundId: response.data.refundId,
      message: response.message || "Refund request submitted!",
    };
  }

  /**
   * Check if user can bid (has sufficient balance, not blocked)
   */
  async canBid(bidAmountINR: number): Promise<{
    canBid: boolean;
    reason?: string;
    availableBalance: number;
    requiredBalance: number;
  }> {
    const balance = await this.getBalance();
    const requiredRipLimit = bidAmountINR; // 1 INR = 1 RL

    if (balance.isBlocked) {
      return {
        canBid: false,
        reason: "Your RipLimit account is blocked",
        availableBalance: balance.availableBalance,
        requiredBalance: requiredRipLimit,
      };
    }

    if (balance.hasUnpaidAuctions) {
      return {
        canBid: false,
        reason: "You have unpaid won auctions",
        availableBalance: balance.availableBalance,
        requiredBalance: requiredRipLimit,
      };
    }

    if (balance.availableBalance < requiredRipLimit) {
      return {
        canBid: false,
        reason: `Insufficient RipLimit. Required: ${requiredRipLimit} RL, Available: ${balance.availableBalance} RL`,
        availableBalance: balance.availableBalance,
        requiredBalance: requiredRipLimit,
      };
    }

    return {
      canBid: true,
      availableBalance: balance.availableBalance,
      requiredBalance: requiredRipLimit,
    };
  }

  /**
   * Invalidate cache for balance (call after transactions)
   */
  invalidateBalanceCache(): void {
    apiService.invalidateCache("/riplimit/balance");
  }

  /**
   * Invalidate cache for transactions
   */
  invalidateTransactionsCache(): void {
    apiService.invalidateCache("/riplimit/transactions");
  }
}

export const ripLimitService = new RipLimitService();
