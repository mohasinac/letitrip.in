/**
 * @fileoverview Service Module
 * @module src/services/returns.service
 * @description This file contains service functions for returns operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * UpdateReturnData interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateReturnData
 */
interface UpdateReturnData {
  /** Status */
  status?: ReturnStatus;
  /** Admin Notes */
  adminNotes?: string;
}

/**
 * ApproveReturnData interface
 * 
 * @interface
 * @description Defines the structure and contract for ApproveReturnData
 */
interface ApproveReturnData {
  /** Approved */
  approved: boolean;
  /** Notes */
  notes?: string;
}

/**
 * ProcessRefundData interface
 * 
 * @interface
 * @description Defines the structure and contract for ProcessRefundData
 */
interface ProcessRefundData {
  /** Refund Amount */
  refundAmount: number;
  /** Refund Method */
  refundMethod: string;
  /** Refund Transaction Id */
  refundTransactionId?: string;
}

/**
 * ResolveDisputeData interface
 * 
 * @interface
 * @description Defines the structure and contract for ResolveDisputeData
 */
interface ResolveDisputeData {
  /** Resolution */
  resolution: string;
  /** Refund Amount */
  refundAmount?: number;
  /** Notes */
  notes: string;
}

/**
 * ReturnsService class
 * 
 * @class
 * @description Description of ReturnsService class functionality
 */
class ReturnsService {
  // List returns (role-filtered)
  async list(
    /** Filters */
    filters?: Partial<ReturnFiltersBE>,
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

    const response =
      await apiService.get<PaginatedResponseBE<ReturnBE>>(endpoint);

    return {
      /** Data */
      data: response.data.map(returnBEtoFE),
      /** Count */
      count: response.count,
      /** Pagination */
      pagination: response.pagination,
    };
  }

  // Get return by ID
  async getById(id: string): Promise<ReturnFE> {
    const response: any = await apiService.get(`/returns/${id}`);
    return returnBEtoFE(response.data);
  }

  // Initiate return (customer)
  async initiate(data: ReturnFormFE): Promise<ReturnFE> {
    const request = returnFormFEtoRequestBE(data);
    const response: any = await apiService.post("/returns", request);
    return returnBEtoFE(response.data);
  }

  // Update return (seller/admin)
  async update(id: string, data: UpdateReturnData): Promise<ReturnFE> {
    const response: any = await apiService.patch(`/returns/${id}`, data);
    return returnBEtoFE(response.data);
  }

  // Approve/reject return (seller/admin)
  async approve(id: string, data: ApproveReturnData): Promise<ReturnFE> {
    const response: any = await apiService.post(`/returns/${id}/approve`, data);
    return returnBEtoFE(response.data);
  }

  // Process refund (seller/admin)
  async processRefund(id: string, data: ProcessRefundData): Promise<ReturnFE> {
    const response: any = await apiService.post(`/returns/${id}/refund`, data);
    return returnBEtoFE(response.data);
  }

  // Resolve dispute (admin only)
  async resolveDispute(
    /** Id */
    id: string,
    /** Data */
    data: ResolveDisputeData,
  ): Promise<ReturnFE> {
    const response: any = await apiService.post(`/returns/${id}/resolve`, data);
    return returnBEtoFE(response.data);
  }

  // Upload media for return
  async uploadMedia(id: string, files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`/api/returns/${id}/media`, {
      /** Method */
      method: "POST",
      /** Body */
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
    /** Shop Id */
    shopId?: string;
    /** Start Date */
    startDate?: string;
    /** End Date */
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
