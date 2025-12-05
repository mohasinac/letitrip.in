/**
 * @fileoverview Type Definitions
 * @module src/types/backend/return.types
 * @description This file contains TypeScript type definitions for return
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  refundedAt?: Timestamp | null;

  // Admin intervention
  /** Requires Admin Intervention */
  requiresAdminIntervention: boolean;
  /** Admin Notes */
  adminNotes?: string;

  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * Filter options for querying returns
 */
export interface ReturnFiltersBE {
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
