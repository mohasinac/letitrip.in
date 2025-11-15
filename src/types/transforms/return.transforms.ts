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
function timestampToDate(
  timestamp: Timestamp | null | undefined
): Date | undefined {
  if (!timestamp) return undefined;
  if ("_seconds" in timestamp) {
    const ts = timestamp as any;
    return new Date(ts._seconds * 1000 + (ts._nanoseconds || 0) / 1000000);
  }
  if ("seconds" in timestamp) {
    return new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
    );
  }
  return undefined;
}

/**
 * Convert Date to Firestore Timestamp structure
 */
function dateToTimestamp(
  date: Date | undefined
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
function formatRefundAmount(amount: number | undefined): string | undefined {
  if (amount === undefined) return undefined;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

/**
 * Transform Backend Return to Frontend Return
 */
export function returnBEtoFE(be: ReturnBE): ReturnFE {
  const createdAt = timestampToDate(be.createdAt) || new Date();
  const updatedAt = timestampToDate(be.updatedAt) || new Date();
  const refundedAt = be.refundedAt ? timestampToDate(be.refundedAt) : undefined;

  return {
    id: be.id,
    orderId: be.orderId,
    orderItemId: be.orderItemId,
    customerId: be.customerId,
    shopId: be.shopId,
    reason: be.reason,
    description: be.description,
    media: be.media,
    status: be.status,
    refundAmount: be.refundAmount,
    refundMethod: be.refundMethod,
    refundTransactionId: be.refundTransactionId,
    refundedAt,
    requiresAdminIntervention: be.requiresAdminIntervention,
    adminNotes: be.adminNotes,
    createdAt,
    updatedAt,

    // Helper methods
    isOpen: () =>
      be.status === ReturnStatus.REQUESTED ||
      be.status === ReturnStatus.APPROVED,
    isCompleted: () => be.status === ReturnStatus.COMPLETED,
    canCancel: () => be.status === ReturnStatus.REQUESTED,

    // Formatted strings
    statusText: getStatusText(be.status),
    reasonText: getReasonText(be.reason),
    formattedRefundAmount: formatRefundAmount(be.refundAmount),
  };
}

/**
 * Transform Frontend Return to Backend Return
 */
export function returnFEtoBE(fe: ReturnFE): ReturnBE {
  return {
    id: fe.id,
    orderId: fe.orderId,
    orderItemId: fe.orderItemId,
    customerId: fe.customerId,
    shopId: fe.shopId,
    reason: fe.reason,
    description: fe.description,
    media: fe.media,
    status: fe.status,
    refundAmount: fe.refundAmount,
    refundMethod: fe.refundMethod,
    refundTransactionId: fe.refundTransactionId,
    refundedAt: dateToTimestamp(fe.refundedAt) as any,
    requiresAdminIntervention: fe.requiresAdminIntervention,
    adminNotes: fe.adminNotes,
    createdAt: dateToTimestamp(fe.createdAt) as any,
    updatedAt: dateToTimestamp(fe.updatedAt) as any,
  };
}

/**
 * Transform Backend Return to Card view
 */
export function returnBEtoCard(be: ReturnBE): ReturnCardFE {
  return {
    id: be.id,
    orderId: be.orderId,
    customerId: be.customerId,
    shopId: be.shopId,
    reason: be.reason,
    status: be.status,
    refundAmount: be.refundAmount,
    createdAt: timestampToDate(be.createdAt) || new Date(),
    statusText: getStatusText(be.status),
    reasonText: getReasonText(be.reason),
  };
}

/**
 * Transform Return Form to Backend Request
 */
export function returnFormFEtoRequestBE(form: ReturnFormFE): Partial<ReturnBE> {
  return {
    orderId: form.orderId,
    orderItemId: form.orderItemId,
    reason: form.reason,
    description: form.description,
    media: form.media,
  };
}
