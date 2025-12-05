/**
 * @fileoverview Service Module
 * @module src/services/payouts.service
 * @description This file contains service functions for payouts operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { apiService } from "./api.service";
import { PAYOUT_ROUTES } from "@/constants/api-routes";

/**
 * Payout interface
 */
export interface Payout {
  /** Id */
  id: string;
  /** Seller Id */
  sellerId: string;
  /** Seller Name */
  sellerName: string;
  /** Shop Id */
  shopId: string;
  /** Shop Name */
  shopName: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Status */
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  /** Payment Method */
  paymentMethod: "bank_transfer" | "upi" | "paypal" | "other";
  /** Transaction Id */
  transactionId?: string;
  /** Bank Details */
  bankDetails?: {
    /** Account Name */
    accountName: string;
    /** Account Number */
    accountNumber: string;
    /** Ifsc Code */
    ifscCode: string;
    /** Bank Name */
    bankName: string;
  };
  /** Upi Id */
  upiId?: string;
  /** Period */
  period: {
    /** Start Date */
    startDate: string;
    /** End Date */
    endDate: string;
  };
  /** Order Count */
  orderCount: number;
  /** Total Sales */
  totalSales: number;
  /** Platform Fee */
  platformFee: number;
  /** Net Amount */
  netAmount: number;
  /** Notes */
  notes?: string;
  /** Processed By */
  processedBy?: string;
  /** Processed At */
  processedAt?: string;
  /** Failure Reason */
  failureReason?: string;
  /** Created At */
  createdAt: string;
  /** Updated At */
  updatedAt: string;
}

/**
 * PayoutFilters interface
 * 
 * @interface
 * @description Defines the structure and contract for PayoutFilters
 */
export interface PayoutFilters {
  /** Seller Id */
  sellerId?: string;
  /** Shop Id */
  shopId?: string;
  /** Status */
  status?: Payout["status"];
  /** Payment Method */
  paymentMethod?: Payout["paymentMethod"];
  /** Start Date */
  startDate?: string;
  /** End Date */
  endDate?: string;
  /** Search */
  search?: string;
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}

/**
 * PayoutFormData interface
 * 
 * @interface
 * @description Defines the structure and contract for PayoutFormData
 */
export interface PayoutFormData {
  /** Seller Id */
  sellerId: string;
  /** Shop Id */
  shopId: string;
  /** Amount */
  amount: number;
  /** Payment Method */
  paymentMethod: Payout["paymentMethod"];
  /** Bank Details */
  bankDetails?: Payout["bankDetails"];
  /** Upi Id */
  upiId?: string;
  /** Period */
  period: {
    /** Start Date */
    startDate: string;
    /** End Date */
    endDate: string;
  };
  /** Notes */
  notes?: string;
}

/**
 * PayoutStats interface
 * 
 * @interface
 * @description Defines the structure and contract for PayoutStats
 */
export interface PayoutStats {
  /** Total Pending */
  totalPending: number;
  /** Total Processing */
  totalProcessing: number;
  /** Total Completed */
  totalCompleted: number;
  /** Total Failed */
  totalFailed: number;
  /** Pending Amount */
  pendingAmount: number;
  /** Completed Amount */
  completedAmount: number;
  /** This Month Amount */
  thisMonthAmount: number;
  /** Last Month Amount */
  lastMonthAmount: number;
}

/**
 * Payouts Service
 * Manages seller payouts and transactions
 */
class PayoutsService {
  /**
   * Get all payouts with filters
   */
  async getPayouts(filters?: PayoutFilters): Promise<{
    /** Payouts */
    payouts: Payout[];
    /** Total */
    total: number;
    /** Page */
    page: number;
    /** Limit */
    limit: number;
  }> {
    const params = new URLSearchParams();

    if (filters?.sellerId) params.set("sellerId", filters.sellerId);
    if (filters?.shopId) params.set("shopId", filters.shopId);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.paymentMethod)
      params.set("paymentMethod", filters.paymentMethod);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const url = params.toString()
      ? `${PAYOUT_ROUTES.LIST}?${params}`
      : PAYOUT_ROUTES.LIST;

    const response = await apiService.get<{
      /** Payouts */
      payouts: Payout[];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
    }>(url);

    return response;
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(): Promise<PayoutStats> {
    const response = await apiService.get<{ stats: PayoutStats }>(
      `${PAYOUT_ROUTES.LIST}/stats`,
    );
    return response.stats;
  }

  /**
   * Get a single payout by ID
   */
  async getPayoutById(id: string): Promise<Payout> {
    const response = await apiService.get<{ payout: Payout }>(
      PAYOUT_ROUTES.BY_ID(id),
    );
    return response.payout;
  }

  /**
   * Create a new payout
   */
  async createPayout(data: PayoutFormData): Promise<Payout> {
    const response = await apiService.post<{ payout: Payout }>(
      PAYOUT_ROUTES.LIST,
      data,
    );
    return response.payout;
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(
    /** Id */
    id: string,
    /** Status */
    status: Payout["status"],
    /** Transaction Id */
    transactionId?: string,
    /** Failure Reason */
    failureReason?: string,
  ): Promise<Payout> {
    const response = await apiService.patch<{ payout: Payout }>(
      `${PAYOUT_ROUTES.BY_ID(id)}/status`,
      { status, transactionId, failureReason },
    );
    return response.payout;
  }

  /**
   * Process a pending payout
   */
  async processPayout(id: string, transactionId: string): Promise<Payout> {
    const response = await apiService.post<{ payout: Payout }>(
      `${PAYOUT_ROUTES.BY_ID(id)}/process`,
      { transactionId },
    );
    return response.payout;
  }

  /**
   * Cancel a payout
   */
  async cancelPayout(id: string, reason: string): Promise<Payout> {
    const response = await apiService.post<{ payout: Payout }>(
      `${PAYOUT_ROUTES.BY_ID(id)}/cancel`,
      { reason },
    );
    return response.payout;
  }

  /**
   * Bulk process payouts
   */
  async bulkProcess(ids: string[]): Promise<{
    /** Success */
    success: number;
    /** Failed */
    failed: number;
    /** Errors */
    errors: { id: string; error: string }[];
  }> {
    const response = await apiService.post<{
      /** Success */
      success: number;
      /** Failed */
      failed: number;
      /** Errors */
      errors: { id: string; error: string }[];
    }>(`${PAYOUT_ROUTES.LIST}/bulk-process`, { ids });
    return response;
  }

  /**
   * Calculate payout for a seller
   */
  async calculatePayout(
    /** Seller Id */
    sellerId: string,
    /** Shop Id */
    shopId: string,
    /** Start Date */
    startDate: string,
    /** End Date */
    endDate: string,
  ): Promise<{
    /** Total Sales */
    totalSales: number;
    /** Order Count */
    orderCount: number;
    /** Platform Fee */
    platformFee: number;
    /** Net Amount */
    netAmount: number;
  }> {
    const response = await apiService.post<{
      /** Total Sales */
      totalSales: number;
      /** Order Count */
      orderCount: number;
      /** Platform Fee */
      platformFee: number;
      /** Net Amount */
      netAmount: number;
    }>(`${PAYOUT_ROUTES.LIST}/calculate`, {
      sellerId,
      shopId,
      startDate,
      endDate,
    });
    return response;
  }

  /**
   * Export payouts to CSV
   */
  async exportPayouts(filters?: PayoutFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.sellerId) params.set("sellerId", filters.sellerId);
    if (filters?.shopId) params.set("shopId", filters.shopId);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);

    const url = params.toString()
      ? `${PAYOUT_ROUTES.LIST}/export?${params}`
      : `${PAYOUT_ROUTES.LIST}/export`;

    const response = await apiService.get<Blob>(url, {
      /** Response Type */
      responseType: "blob",
    } as any);

    return response as any;
  }

  // Bulk operations (admin only)
  private async bulkAction(
    /** Action */
    action: string,
    /** Ids */
    ids: string[],
    /** Data */
    data?: Record<string, any>,
  ): Promise<{
    /** Success */
    success: boolean;
    /** Results */
    results: {
      /** Success */
      success: string[];
      /** Failed */
      failed: { id: string; error: string }[];
    };
    /** Summary */
    summary: { total: number; succeeded: number; failed: number };
  }> {
    return apiService.post(PAYOUT_ROUTES.BULK, { action, ids, data });
  }

  async bulkApprove(ids: string[]): Promise<any> {
    return this.bulkAction("approve", ids);
  }

  async bulkProcessPayouts(ids: string[]): Promise<any> {
    return this.bulkAction("process", ids);
  }

  async bulkComplete(ids: string[]): Promise<any> {
    return this.bulkAction("complete", ids);
  }

  async bulkReject(ids: string[], reason?: string): Promise<any> {
    return this.bulkAction("reject", ids, { reason });
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return this.bulkAction("delete", ids);
  }

  async bulkUpdate(ids: string[], updates: Record<string, any>): Promise<any> {
    return this.bulkAction("update", ids, updates);
  }
}

export const payoutsService = new PayoutsService();
