import { apiService } from './api.service';
import type { Return, ReturnStatus, ReturnReason, PaginatedResponse } from '@/types';

interface ReturnFilters {
  orderId?: string;
  customerId?: string;
  shopId?: string;
  status?: ReturnStatus;
  reason?: ReturnReason;
  requiresAdminIntervention?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface InitiateReturnData {
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  description: string;
  media?: string[]; // Images/videos
}

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
  async list(filters?: ReturnFilters): Promise<PaginatedResponse<Return>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/returns?${queryString}` : '/returns';
    
    return apiService.get<PaginatedResponse<Return>>(endpoint);
  }

  // Get return by ID
  async getById(id: string): Promise<Return> {
    return apiService.get<Return>(`/returns/${id}`);
  }

  // Initiate return (customer)
  async initiate(data: InitiateReturnData): Promise<Return> {
    return apiService.post<Return>('/returns', data);
  }

  // Update return (seller/admin)
  async update(id: string, data: UpdateReturnData): Promise<Return> {
    return apiService.patch<Return>(`/returns/${id}`, data);
  }

  // Approve/reject return (seller/admin)
  async approve(id: string, data: ApproveReturnData): Promise<Return> {
    return apiService.post<Return>(`/returns/${id}/approve`, data);
  }

  // Process refund (seller/admin)
  async processRefund(id: string, data: ProcessRefundData): Promise<Return> {
    return apiService.post<Return>(`/returns/${id}/refund`, data);
  }

  // Resolve dispute (admin only)
  async resolveDispute(id: string, data: ResolveDisputeData): Promise<Return> {
    return apiService.post<Return>(`/returns/${id}/resolve`, data);
  }

  // Upload media for return
  async uploadMedia(id: string, files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`/api/returns/${id}/media`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload media');
    }
    
    return response.json();
  }

  // Get return statistics
  async getStats(filters?: { shopId?: string; startDate?: string; endDate?: string }): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/returns/stats?${queryString}` : '/returns/stats';
    
    return apiService.get<any>(endpoint);
  }
}

export const returnsService = new ReturnsService();
export type {
  ReturnFilters,
  InitiateReturnData,
  UpdateReturnData,
  ApproveReturnData,
  ProcessRefundData,
  ResolveDisputeData,
};
