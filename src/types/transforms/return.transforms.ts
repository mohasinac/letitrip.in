/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/return.transforms
 * @description This file contains functionality related to return.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * TRANSFORMS - Return
 * Functions to convert between Backend and Frontend Return types
 */

import type { ReturnBE } from "../backend/return.types";
import type {
  ReturnFE,
  ReturnCardFE,
  ReturnFormFE,
} from "../frontend/return.types";
import type { Timestamp } from "firebase/firestore";
import { ReturnStatus, ReturnReason } from "../shared/common.types";

/**
 * Convert Firestore Timestamp to Date
 */
/**
 * Performs timestamp to date operation
 *
 * @param {Timestamp | null | undefined} timestamp - The timestamp
 *
 * @returns {any} The timestamptodate result
 */

/**
 * Performs timestamp to date operation
 *
 * @param {Timestamp | null | undefined} /** Timestamp */
  timestamp - The /**  timestamp */
  timestamp
 *
 * @returns {any} The timestamptodate result
 */

function timestampToDate(
  /** Timestamp */
  timestamp: Timestamp | null | undefined,
): Date | undefined {
  if (!timestamp) return undefined;
  if ("_seconds" in timestamp) {
    const ts = timestamp as any;
    return new Date(ts._seconds * 1000 + (ts._nanoseconds || 0) / 1000000);
  }
  if ("seconds" in timestamp) {
    return new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000,
    );
  }
  return undefined;
}

/**
 * Convert Date to Firestore Timestamp structure
 */
/**
 * Performs date to timestamp operation
 *
 * @param {Date | undefined} date - The date
 *
 * @returns {number} The datetotimestamp result
 */

/**
 * Performs date to timestamp operation
 *
 * @param {Date | undefined} /** Date */
  date - The /**  date */
  date
 *
 * @returns {number} The datetotimestamp result
 */

function dateToTimestamp(
  /** Date */
  date: Date | undefined,
): { _seconds: number; _nanoseconds: number } | undefined {
  if (!date) return undefined;
  const ms = date.getTime();
  return {
    _seconds: Math.floor(ms / 1000),
    _nanoseconds: (ms % 1000) * 1000000,
  };
}

/**
 * Get status display text
 */
/**
 * Retrieves status text
 *
 * @param {ReturnStatus} status - The status
 *
 * @returns {string} The statustext result
 */

/**
 * Retrieves status text
 *
 * @param {ReturnStatus} status - The status
 *
 * @returns {string} The statustext result
 */

function getStatusText(status: ReturnStatus): string {
  const statusMap: Record<ReturnStatus, string> = {
    [ReturnStatus.REQUESTED]: "Requested",
    [ReturnStatus.APPROVED]: "Approved",
    [ReturnStatus.REJECTED]: "Rejected",
    [ReturnStatus.ITEM_RECEIVED]: "Item Received",
    [ReturnStatus.REFUND_PROCESSED]: "Refund Processed",
    [ReturnStatus.COMPLETED]: "Completed",
    [ReturnStatus.ESCALATED]: "Escalated",
  };
  return statusMap[status] || status;
}

/**
 * Get reason display text
 */
/**
 * Retrieves reason text
 *
 * @param {ReturnReason} reason - The reason
 *
 * @returns {string} The reasontext result
 */

/**
 * Retrieves reason text
 *
 * @param {ReturnReason} reason - The reason
 *
 * @returns {string} The reasontext result
 */

function getReasonText(reason: ReturnReason): string {
  const reasonMap: Record<ReturnReason, string> = {
    [ReturnReason.DEFECTIVE]: "Defective Product",
    [ReturnReason.WRONG_ITEM]: "Wrong Item",
    [ReturnReason.NOT_AS_DESCRIBED]: "Not as Described",
    [ReturnReason.DAMAGED]: "Damaged",
    [ReturnReason.CHANGED_MIND]: "Changed Mind",
    [ReturnReason.OTHER]: "Other",
  };
  return reasonMap[reason] || reason;
}

/**
 * Format currency amount
 */
/**
 * Formats refund amount
 *
 * @param {number | undefined} amount - The amount
 *
 * @returns {string} The formatrefundamount result
 */

/**
 * Formats refund amount
 *
 * @param {number | undefined} amount - The amount
 *
 * @returns {string} The formatrefundamount result
 */

function formatRefundAmount(amount: number | undefined): string | undefined {
  if (amount === undefined) return undefined;
  return new Intl.NumberFormat("en-IN", {
    /** Style */
    style: "currency",
    /** Currency */
    currency: "INR",
  }).format(amount);
}

/**
 * Transform Backend Return to Frontend Return
 */
/**
 * Performs return b eto f e operation
 *
 * @param {ReturnBE} be - The be
 *
 * @returns {any} The returnbetofe result
 *
 * @example
 * returnBEtoFE(be);
 */

/**
 * Performs return b eto f e operation
 *
 * @param {ReturnBE} be - The be
 *
 * @returns {any} The returnbetofe result
 *
 * @example
 * returnBEtoFE(be);
 */

export function returnBEtoFE(be: ReturnBE): ReturnFE {
  const createdAt = timestampToDate(be.createdAt) || new Date();
  const updatedAt = timestampToDate(be.updatedAt) || new Date();
  const refundedAt = be.refundedAt ? timestampToDate(be.refundedAt) : undefined;

  return {
    /** Id */
    id: be.id,
    /** Order Id */
    orderId: be.orderId,
    /** Order Item Id */
    orderItemId: be.orderItemId,
    /** Customer Id */
    customerId: be.customerId,
    /** Shop Id */
    shopId: be.shopId,
    /** Reason */
    reason: be.reason,
    /** Description */
    description: be.description,
    /** Media */
    media: be.media,
    /** Status */
    status: be.status,
    /** Refund Amount */
    refundAmount: be.refundAmount,
    /** Refund Method */
    refundMethod: be.refundMethod,
    /** Refund Transaction Id */
    refundTransactionId: be.refundTransactionId,
    refundedAt,
    /** Requires Admin Intervention */
    requiresAdminIntervention: be.requiresAdminIntervention,
    /** Admin Notes */
    adminNotes: be.adminNotes,
    createdAt,
    updatedAt,

    // Helper methods
    /** Is Open */
    isOpen: () =>
      be.status === ReturnStatus.REQUESTED ||
      be.status === ReturnStatus.APPROVED,
    /** Is Completed */
    isCompleted: () => be.status === ReturnStatus.COMPLETED,
    /** Can Cancel */
    canCancel: () => be.status === ReturnStatus.REQUESTED,

    // Formatted strings
    /** Status Text */
    statusText: getStatusText(be.status),
    /** Reason Text */
    reasonText: getReasonText(be.reason),
    /** Formatted Refund Amount */
    formattedRefundAmount: formatRefundAmount(be.refundAmount),
  };
}

/**
 * Transform Frontend Return to Backend Return
 */
/**
 * Performs return f eto b e operation
 *
 * @param {ReturnFE} fe - The fe
 *
 * @returns {any} The returnfetobe result
 *
 * @example
 * returnFEtoBE(fe);
 */

/**
 * Performs return f eto b e operation
 *
 * @param {ReturnFE} fe - The fe
 *
 * @returns {any} The returnfetobe result
 *
 * @example
 * returnFEtoBE(fe);
 */

export function returnFEtoBE(fe: ReturnFE): ReturnBE {
  return {
    /** Id */
    id: fe.id,
    /** Order Id */
    orderId: fe.orderId,
    /** Order Item Id */
    orderItemId: fe.orderItemId,
    /** Customer Id */
    customerId: fe.customerId,
    /** Shop Id */
    shopId: fe.shopId,
    /** Reason */
    reason: fe.reason,
    /** Description */
    description: fe.description,
    /** Media */
    media: fe.media,
    /** Status */
    status: fe.status,
    /** Refund Amount */
    refundAmount: fe.refundAmount,
    /** Refund Method */
    refundMethod: fe.refundMethod,
    /** Refund Transaction Id */
    refundTransactionId: fe.refundTransactionId,
    /** Refunded At */
    refundedAt: dateToTimestamp(fe.refundedAt) as any,
    /** Requires Admin Intervention */
    requiresAdminIntervention: fe.requiresAdminIntervention,
    /** Admin Notes */
    adminNotes: fe.adminNotes,
    /** Created At */
    createdAt: dateToTimestamp(fe.createdAt) as any,
    /** Updated At */
    updatedAt: dateToTimestamp(fe.updatedAt) as any,
  };
}

/**
 * Transform Backend Return to Card view
 */
/**
 * Performs return b eto card operation
 *
 * @param {ReturnBE} be - The be
 *
 * @returns {any} The returnbetocard result
 *
 * @example
 * returnBEtoCard(be);
 */

/**
 * Performs return b eto card operation
 *
 * @param {ReturnBE} be - The be
 *
 * @returns {any} The returnbetocard result
 *
 * @example
 * returnBEtoCard(be);
 */

export function returnBEtoCard(be: ReturnBE): ReturnCardFE {
  return {
    /** Id */
    id: be.id,
    /** Order Id */
    orderId: be.orderId,
    /** Customer Id */
    customerId: be.customerId,
    /** Shop Id */
    shopId: be.shopId,
    /** Reason */
    reason: be.reason,
    /** Status */
    status: be.status,
    /** Refund Amount */
    refundAmount: be.refundAmount,
    /** Created At */
    createdAt: timestampToDate(be.createdAt) || new Date(),
    /** Status Text */
    statusText: getStatusText(be.status),
    /** Reason Text */
    reasonText: getReasonText(be.reason),
  };
}

/**
 * Transform Return Form to Backend Request
 */
/**
 * Performs return form f eto request b e operation
 *
 * @param {ReturnFormFE} form - The form
 *
 * @returns {any} The returnformfetorequestbe result
 *
 * @example
 * returnFormFEtoRequestBE(form);
 */

/**
 * Performs return form f eto request b e operation
 *
 * @param {ReturnFormFE} form - The form
 *
 * @returns {any} The returnformfetorequestbe result
 *
 * @example
 * returnFormFEtoRequestBE(form);
 */

export function returnFormFEtoRequestBE(form: ReturnFormFE): Partial<ReturnBE> {
  return {
    /** Order Id */
    orderId: form.orderId,
    /** Order Item Id */
    orderItemId: form.orderItemId,
    /** Reason */
    reason: form.reason,
    /** Description */
    description: form.description,
    /** Media */
    media: form.media,
  };
}
