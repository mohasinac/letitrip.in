/**
 * FRONTEND TYPES - Return
 * Types for return data optimized for UI display
 * Uses JavaScript Date objects and includes helper methods
 */

import type { ReturnStatus, ReturnReason } from "../shared/common.types";

/**
 * Return Frontend Type (for UI display)
 */
export interface ReturnFE {
  id: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  shopId: string;

  // Reason
  reason: ReturnReason;
  description: string;
  media?: string[]; // Images/videos

  // Status
  status: ReturnStatus;

  // Refund
  refundAmount?: number;
  refundMethod?: string;
  refundTransactionId?: string;
  refundedAt?: Date;

  // Admin intervention
  requiresAdminIntervention: boolean;
  adminNotes?: string;

  createdAt: Date;
  updatedAt: Date;

  // UI Helper Methods
  isOpen: () => boolean;
  isCompleted: () => boolean;
  canCancel: () => boolean;
  statusText: string;
  reasonText: string;
  formattedRefundAmount?: string;
}

/**
 * Return Card (for list views)
 */
export interface ReturnCardFE {
  id: string;
  orderId: string;
  customerId: string;
  shopId: string;
  reason: ReturnReason;
  status: ReturnStatus;
  refundAmount?: number;
  createdAt: Date;
  statusText: string;
  reasonText: string;
}

/**
 * Return Form (for creating/updating returns)
 */
export interface ReturnFormFE {
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  description: string;
  media?: string[];
}

/**
 * Return Filter options for frontend
 */
export interface ReturnFiltersFE {
  customerId?: string;
  shopId?: string;
  orderId?: string;
  status?: ReturnStatus;
  reason?: ReturnReason;
  requiresAdminIntervention?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "refundAmount";
  sortOrder?: "asc" | "desc";
}
