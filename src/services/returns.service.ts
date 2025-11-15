import { apiService } from "./api.service";
import type { ReturnBE, ReturnFiltersBE } from "@/types/backend/return.types";
import type { ReturnFE, ReturnFormFE } from "@/types/frontend/return.types";
import {
  returnBEtoFE,
  returnFormFEtoRequestBE,
} from "@/types/transforms/return.transforms";
import { ReturnStatus, ReturnReason } from "@/types/shared/common.types";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

interface UpdateReturnData {
  status?: ReturnStatus;
  adminNotes?: string;
}

interface ApproveReturnData {
  approved: boolean;
  notes?: string;
}

interface ProcessRefundData {
  refundAmount: number;
  refundMethod: string;
  refundTransactionId?: string;
}

interface ResolveDisputeData {
  resolution: string;
  refundAmount?: number;
  notes: string;
}

class ReturnsService {
  // List returns (role-filtered)
  async list(
    filters?: Partial<ReturnFiltersBE>
  ): Promise<PaginatedResponseFE<ReturnFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/returns?${queryString}` : "/returns";

    const response = await apiService.get<PaginatedResponseBE<ReturnBE>>(
      endpoint
    );

    return {
      data: response.data.map(returnBEtoFE),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get return by ID
  async getById(id: string): Promise<ReturnFE> {
    const returnBE = await apiService.get<ReturnBE>(`/returns/${id}`);
    return returnBEtoFE(returnBE);
  }

  // Initiate return (customer)
  async initiate(data: ReturnFormFE): Promise<ReturnFE> {
    const request = returnFormFEtoRequestBE(data);
    const returnBE = await apiService.post<ReturnBE>("/returns", request);
    return returnBEtoFE(returnBE);
  }

  // Update return (seller/admin)
  async update(id: string, data: UpdateReturnData): Promise<ReturnFE> {
    const returnBE = await apiService.patch<ReturnBE>(`/returns/${id}`, data);
    return returnBEtoFE(returnBE);
  }

  // Approve/reject return (seller/admin)
  async approve(id: string, data: ApproveReturnData): Promise<ReturnFE> {
    const returnBE = await apiService.post<ReturnBE>(
      `/returns/${id}/approve`,
      data
    );
    return returnBEtoFE(returnBE);
  }

  // Process refund (seller/admin)
  async processRefund(id: string, data: ProcessRefundData): Promise<ReturnFE> {
    const returnBE = await apiService.post<ReturnBE>(
      `/returns/${id}/refund`,
      data
    );
    return returnBEtoFE(returnBE);
  }

  // Resolve dispute (admin only)
  async resolveDispute(
    id: string,
    data: ResolveDisputeData
  ): Promise<ReturnFE> {
    const returnBE = await apiService.post<ReturnBE>(
      `/returns/${id}/resolve`,
      data
    );
    return returnBEtoFE(returnBE);
  }

  // Upload media for return
  async uploadMedia(id: string, files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`/api/returns/${id}/media`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload media");
    }

    return response.json();
  }

  // Get return statistics
  async getStats(filters?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/returns/stats?${queryString}`
      : "/returns/stats";

    return apiService.get<any>(endpoint);
  }
}

export const returnsService = new ReturnsService();
export type {
  UpdateReturnData,
  ApproveReturnData,
  ProcessRefundData,
  ResolveDisputeData,
};
