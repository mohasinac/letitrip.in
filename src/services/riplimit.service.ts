/**
 * @fileoverview Service Module
 * @module src/services/riplimit.service
 * @description This file contains service functions for riplimit operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
        /** Success */
        success: boolean;
        /** Data */
        data: {
          /** Available Balance */
          availableBalance: number;
          /** Blocked Balance */
          blockedBalance: number;
          /** Total Balance */
          totalBalance: number;
          /** Available Balance I N R */
          availableBalanceINR: number;
          /** Blocked Balance I N R */
          blockedBalanceINR: number;
          /** Total Balance I N R */
          totalBalanceINR: number;
          /** Has Unpaid Auctions */
          hasUnpaidAuctions: boolean;
          /** Unpaid Auction Ids */
          unpaidAuctionIds: string[];
          /** Is Blocked */
          isBlocked: boolean;
          /** Blocked Bids */
          blockedBids: Array<{
            /** Auction Id */
            auctionId: string;
            /** Bid Id */
            bidId: string;
            /** Amount */
            amount: number;
            /** Bid Amount I N R */
            bidAmountINR: number;
          }>;
        };
      }>("/riplimit/balance");

      if (!response.success) {
        throw new Error("Failed to get balance");
      }

      return toFERipLimitBalance(response.data);
    } catch (error: any) {
      logError(error as Error, { component: "RipLimitService.getBalance" });
      return createEmptyBalance();
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    /** Options */
    options: {
      /** Type */
      type?: string;
      /** Limit */
      limit?: number;
      /** Offset */
      offset?: number;
    } = {},
  ): Promise<RipLimitTransactionHistoryFE> {
    const params = new URLSearchParams();
    if (options.type) params.set("type", options.type);
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.offset) params.set("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/riplimit/transactions${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiService.get<{
      /** Success */
      success: boolean;
      /** Data */
      data: {
        /** Transactions */
        transactions: RipLimitTransactionBE[];
        /** Total */
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
    /** Rip Limit Amount */
    ripLimitAmount: number,
  ): Promise<RipLimitPurchaseResponseFE> {
    const response = await apiService.post<{
      /** Success */
      success: boolean;
      /** Data */
      data: {
        /** Order Id */
        orderId: string;
        /** Razorpay Order Id */
        razorpayOrderId: string;
        /** Amount */
        amount: number;
        /** Currency */
        currency: string;
        /** Rip Limit Amount */
        ripLimitAmount: number;
      };
    }>("/riplimit/purchase", { ripLimitAmount });

    if (!response.success) {
      throw new Error("Failed to initiate purchase");
    }

    return {
      /** Order Id */
      orderId: response.data.orderId,
      /** Razorpay Order Id */
      razorpayOrderId: response.data.razorpayOrderId,
      /** Amount */
      amount: response.data.amount,
      /** Currency */
      currency: response.data.currency,
      /** Rip Limit Amount */
      ripLimitAmount: response.data.ripLimitAmount,
      /** Formatted Amount */
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
      /** Success */
      success: boolean;
      /** Data */
      data: {
        /** New Balance */
        newBalance: number;
        /** Purchased Amount */
        purchasedAmount: number;
      };
      /** Message */
      message?: string;
    }>("/riplimit/purchase/verify", data);

    if (!response.success) {
      throw new Error(response.message || "Failed to verify purchase");
    }

    return {
      /** Success */
      success: true,
      /** New Balance */
      newBalance: response.data.newBalance,
      /** Formatted New Balance */
      formattedNewBalance: `${response.data.newBalance.toLocaleString(
        "en-IN",
      )} RL`,
      /** Purchased Amount */
      purchasedAmount: response.data.purchasedAmount,
      /** Formatted Purchased Amount */
      formattedPurchasedAmount: `${response.data.purchasedAmount.toLocaleString(
        "en-IN",
      )} RL`,
      /** Message */
      message: response.message || "Purchase successful!",
    };
  }

  /**
   * Request refund of available RipLimit balance
   */
  async requestRefund(
    /** Amount */
    amount: number,
    /** Reason */
    reason?: string,
  ): Promise<{
    /** Success */
    success: boolean;
    /** Refund Id */
    refundId: string;
    /** Message */
    message: string;
  }> {
    const response = await apiService.post<{
      /** Success */
      success: boolean;
      /** Data */
      data: {
        /** Refund Id */
        refundId: string;
      };
      /** Message */
      message?: string;
    }>("/riplimit/refund", { amount, reason });

    if (!response.success) {
      throw new Error(response.message || "Failed to request refund");
    }

    return {
      /** Success */
      success: true,
      /** Refund Id */
      refundId: response.data.refundId,
      /** Message */
      message: response.message || "Refund request submitted!",
    };
  }

  /**
   * Check if user can bid (has sufficient balance, not blocked)
   */
  async canBid(bidAmountINR: number): Promise<{
    /** Can Bid */
    canBid: boolean;
    /** Reason */
    reason?: string;
    /** Available Balance */
    availableBalance: number;
    /** Required Balance */
    requiredBalance: number;
  }> {
    const balance = await this.getBalance();
    const requiredRipLimit = bidAmountINR; // 1 INR = 1 RL

    if (balance.isBlocked) {
      return {
        /** Can Bid */
        canBid: false,
        /** Reason */
        reason: "Your RipLimit account is blocked",
        /** Available Balance */
        availableBalance: balance.availableBalance,
        /** Required Balance */
        requiredBalance: requiredRipLimit,
      };
    }

    if (balance.hasUnpaidAuctions) {
      return {
        /** Can Bid */
        canBid: false,
        /** Reason */
        reason: "You have unpaid won auctions",
        /** Available Balance */
        availableBalance: balance.availableBalance,
        /** Required Balance */
        requiredBalance: requiredRipLimit,
      };
    }

    if (balance.availableBalance < requiredRipLimit) {
      return {
        /** Can Bid */
        canBid: false,
        /** Reason */
        reason: `Insufficient RipLimit. Required: ${requiredRipLimit} RL, Available: ${balance.availableBalance} RL`,
        /** Available Balance */
        availableBalance: balance.availableBalance,
        /** Required Balance */
        requiredBalance: requiredRipLimit,
      };
    }

    return {
      /** Can Bid */
      canBid: true,
      /** Available Balance */
      availableBalance: balance.availableBalance,
      /** Required Balance */
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
