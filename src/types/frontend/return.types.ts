/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/return.types
 * @description This file contains TypeScript type definitions for return
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
  /** Id */
  id: string;
  /** Order Id */
  orderId: string;
  /** Order Item Id */
  orderItemId: string;
  /** Customer Id */
  customerId: string;
  /** Shop Id */
  shopId: string;

  // Reason
  /** Reason */
  reason: ReturnReason;
  /** Description */
  description: string;
  /** Media */
  media?: string[]; // Images/videos

  // Status
  /** Status */
  status: ReturnStatus;

  // Refund
  /** Refund Amount */
  refundAmount?: number;
  /** Refund Method */
  refundMethod?: string;
  /** Refund Transaction Id */
  refundTransactionId?: string;
  /** Refunded At */
  refundedAt?: Date;

  // Admin intervention
  /** Requires Admin Intervention */
  requiresAdminIntervention: boolean;
  /** Admin Notes */
  adminNotes?: string;

  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // UI Helper Methods
  /** Is Open */
  isOpen: () => boolean;
  /** Is Completed */
  isCompleted: () => boolean;
  /** Can Cancel */
  canCancel: () => boolean;
  /** Status Text */
  statusText: string;
  /** Reason Text */
  reasonText: string;
  /** Formatted Refund Amount */
  formattedRefundAmount?: string;
}

/**
 * Return Card (for list views)
 */
export interface ReturnCardFE {
  /** Id */
  id: string;
  /** Order Id */
  orderId: string;
  /** Customer Id */
  customerId: string;
  /** Shop Id */
  shopId: string;
  /** Reason */
  reason: ReturnReason;
  /** Status */
  status: ReturnStatus;
  /** Refund Amount */
  refundAmount?: number;
  /** Created At */
  createdAt: Date;
  /** Status Text */
  statusText: string;
  /** Reason Text */
  reasonText: string;
}

/**
 * Return Form (for creating/updating returns)
 */
export interface ReturnFormFE {
  /** Order Id */
  orderId: string;
  /** Order Item Id */
  orderItemId: string;
  /** Reason */
  reason: ReturnReason;
  /** Description */
  description: string;
  /** Media */
  media?: string[];
}

/**
 * Return Filter options for frontend
 */
export interface ReturnFiltersFE {
  /** Customer Id */
  customerId?: string;
  /** Shop Id */
  shopId?: string;
  /** Order Id */
  orderId?: string;
  /** Status */
  status?: ReturnStatus;
  /** Reason */
  reason?: ReturnReason;
  /** Requires Admin Intervention */
  requiresAdminIntervention?: boolean;
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
  /** Sort By */
  sortBy?: "createdAt" | "updatedAt" | "refundAmount";
  /** Sort Order */
  sortOrder?: "asc" | "desc";
}
