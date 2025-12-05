/**
 * @fileoverview Type Definitions
 * @module src/types/backend/support-ticket.types
 * @description This file contains TypeScript type definitions for support-ticket
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Backend Support Ticket Types
 *
 * Support ticket types as received from the API (Firestore documents)
 * Uses Firestore Timestamps and raw data structures
 */

import type { Timestamp } from "firebase/firestore";
import type {
  TicketStatus,
  TicketCategory,
  TicketPriority,
  UserRole,
} from "../shared/common.types";

/**
 * Backend Support Ticket Document (from Firestore)
 */
export interface SupportTicketBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** ShopId */
  shopId?: string; // If related to specific shop
  /** OrderId */
  orderId?: string; // If related to specific order

  /** Category */
  category: TicketCategory;
  /** Priority */
  priority: TicketPriority;

  /** Subject */
  subject: string;
  /** Description */
  description: string;
  /** Attachments */
  attachments?: string[];

  /** Status */
  status: TicketStatus;

  /** AssignedTo */
  assignedTo?: string; // Support staff/admin ID

  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
  /** Resolved At */
  resolvedAt?: Timestamp;
}

/**
 * Backend Support Ticket Message Document (from Firestore)
 */
export interface SupportTicketMessageBE {
  /** Id */
  id: string;
  /** Ticket Id */
  ticketId: string;
  /** Sender Id */
  senderId: string;
  /** Sender Role */
  senderRole: UserRole;

  /** Message */
  message: string;
  /** Attachments */
  attachments?: string[];

  /** IsInternal */
  isInternal: boolean; // Internal note visible only to staff

  /** Created At */
  createdAt: Timestamp;
}

/**
 * Filters for querying support tickets from backend
 */
export interface SupportTicketFiltersBE {
  /** Status */
  status?: TicketStatus;
  /** Category */
  category?: TicketCategory;
  /** Priority */
  priority?: TicketPriority;
  /** Shop Id */
  shopId?: string;
  /** Order Id */
  orderId?: string;
  /** Assigned To */
  assignedTo?: string;
  /** Search */
  search?: string;
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}

/**
 * Create Support Ticket Request (to backend)
 */
export interface CreateSupportTicketRequestBE {
  /** Category */
  category: TicketCategory;
  /** Priority */
  priority?: TicketPriority;
  /** Subject */
  subject: string;
  /** Description */
  description: string;
  /** Attachments */
  attachments?: string[];
  /** Shop Id */
  shopId?: string;
  /** Order Id */
  orderId?: string;
}

/**
 * Update Support Ticket Request (to backend)
 */
export interface UpdateSupportTicketRequestBE {
  /** Status */
  status?: TicketStatus;
  /** Priority */
  priority?: TicketPriority;
  /** Subject */
  subject?: string;
}

/**
 * Reply to Ticket Request (to backend)
 */
export interface ReplyToTicketRequestBE {
  /** Message */
  message: string;
  /** Attachments */
  attachments?: string[];
  /** Is Internal */
  isInternal?: boolean;
}

/**
 * Assign Ticket Request (to backend)
 */
export interface AssignTicketRequestBE {
  /** Assigned To */
  assignedTo: string;
  /** Notes */
  notes?: string;
}

/**
 * Escalate Ticket Request (to backend)
 */
export interface EscalateTicketRequestBE {
  /** Reason */
  reason: string;
  /** Notes */
  notes?: string;
}
