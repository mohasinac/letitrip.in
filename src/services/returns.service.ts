/**
 * @fileoverview Returns Service - Extends BaseService
 * @module src/services/returns.service
 * @description Return management service with CRUD and approval operations
 * 
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { BaseService } from "./base.service";
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

class ReturnsService extends BaseService<
  ReturnBE,
  ReturnFE,
  ReturnFormFE,
  ReturnFiltersBE
> {
  protected endpoint = "/returns";
  protected entityName = "Return";

  protected toBE(form: ReturnFormFE): Partial<ReturnBE> {
    return returnFormFEtoRequestBE(form) as Partial<ReturnBE>;
  }

  protected toFE(be: ReturnBE): ReturnFE {
    return returnBEtoFE(be);
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  async initiate(data: ReturnFormFE): Promise<ReturnFE> {
    return this.create(data);
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
  a/**
 * Performs form data operation
 *
 * @returns {any} The formdata result
 *
 */
sync uploadMedia(id: string, files: File[]): Promise<{ urls: string[] }> {
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
  async getStats(fi/**
 * Performs params operation
 *
 * @returns {any} The params result
 *
 */
lters?: {
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
