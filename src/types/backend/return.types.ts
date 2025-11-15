/**
 * BACKEND TYPES - Return
 * Types for return data as received from Firestore API
 * Uses Firestore Timestamp format
 */

import type { Timestamp } from "firebase/firestore";
import type { ReturnStatus, ReturnReason } from "../shared/common.types";

/**
 * Return Backend Type (as stored in Firestore)
 */
export interface ReturnBE {
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
  refundedAt?: Timestamp | null;

  // Admin intervention
  requiresAdminIntervention: boolean;
  adminNotes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Filter options for querying returns
 */
export interface ReturnFiltersBE {
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
