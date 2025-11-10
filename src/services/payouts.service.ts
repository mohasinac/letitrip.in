import { apiService } from "./api.service";

/**
 * Payout interface
 */
export interface Payout {
  id: string;
  sellerId: string;
  sellerName: string;
  shopId: string;
  shopName: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod: "bank_transfer" | "upi" | "paypal" | "other";
  transactionId?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  orderCount: number;
  totalSales: number;
  platformFee: number;
  netAmount: number;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutFilters {
  sellerId?: string;
  shopId?: string;
  status?: Payout["status"];
  paymentMethod?: Payout["paymentMethod"];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PayoutFormData {
  sellerId: string;
  shopId: string;
  amount: number;
  paymentMethod: Payout["paymentMethod"];
  bankDetails?: Payout["bankDetails"];
  upiId?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  notes?: string;
}

export interface PayoutStats {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  pendingAmount: number;
  completedAmount: number;
  thisMonthAmount: number;
  lastMonthAmount: number;
}

/**
 * Payouts Service
 * Manages seller payouts and transactions
 */
class PayoutsService {
  private readonly BASE_PATH = "/admin/payouts";

  /**
   * Get all payouts with filters
   */
  async getPayouts(filters?: PayoutFilters): Promise<{
    payouts: Payout[];
    total: number;
    page: number;
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
      ? `${this.BASE_PATH}?${params}`
      : this.BASE_PATH;

    const response = await apiService.get<{
      payouts: Payout[];
      total: number;
      page: number;
      limit: number;
    }>(url);

    return response;
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(): Promise<PayoutStats> {
    const response = await apiService.get<{ stats: PayoutStats }>(
      `${this.BASE_PATH}/stats`
    );
    return response.stats;
  }

  /**
   * Get a single payout by ID
   */
  async getPayoutById(id: string): Promise<Payout> {
    const response = await apiService.get<{ payout: Payout }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.payout;
  }

  /**
   * Create a new payout
   */
  async createPayout(data: PayoutFormData): Promise<Payout> {
    const response = await apiService.post<{ payout: Payout }>(
      this.BASE_PATH,
      data
    );
    return response.payout;
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(
    id: string,
    status: Payout["status"],
    transactionId?: string,
    failureReason?: string
  ): Promise<Payout> {
    const response = await apiService.patch<{ payout: Payout }>(
      `${this.BASE_PATH}/${id}/status`,
      { status, transactionId, failureReason }
    );
    return response.payout;
  }

  /**
   * Process a pending payout
   */
  async processPayout(id: string, transactionId: string): Promise<Payout> {
    const response = await apiService.post<{ payout: Payout }>(
      `${this.BASE_PATH}/${id}/process`,
      { transactionId }
    );
    return response.payout;
  }

  /**
   * Cancel a payout
   */
  async cancelPayout(id: string, reason: string): Promise<Payout> {
    const response = await apiService.post<{ payout: Payout }>(
      `${this.BASE_PATH}/${id}/cancel`,
      { reason }
    );
    return response.payout;
  }

  /**
   * Bulk process payouts
   */
  async bulkProcess(ids: string[]): Promise<{
    success: number;
    failed: number;
    errors: { id: string; error: string }[];
  }> {
    const response = await apiService.post<{
      success: number;
      failed: number;
      errors: { id: string; error: string }[];
    }>(`${this.BASE_PATH}/bulk-process`, { ids });
    return response;
  }

  /**
   * Calculate payout for a seller
   */
  async calculatePayout(
    sellerId: string,
    shopId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalSales: number;
    orderCount: number;
    platformFee: number;
    netAmount: number;
  }> {
    const response = await apiService.post<{
      totalSales: number;
      orderCount: number;
      platformFee: number;
      netAmount: number;
    }>(`${this.BASE_PATH}/calculate`, {
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
      ? `${this.BASE_PATH}/export?${params}`
      : `${this.BASE_PATH}/export`;

    const response = await apiService.get<Blob>(url, {
      responseType: "blob",
    } as any);

    return response as any;
  }
}

export const payoutsService = new PayoutsService();
