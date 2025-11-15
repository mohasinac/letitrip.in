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
  id: string;
  userId: string;
  shopId?: string; // If related to specific shop
  orderId?: string; // If related to specific order

  category: TicketCategory;
  priority: TicketPriority;

  subject: string;
  description: string;
  attachments?: string[];

  status: TicketStatus;

  assignedTo?: string; // Support staff/admin ID

  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

/**
 * Backend Support Ticket Message Document (from Firestore)
 */
export interface SupportTicketMessageBE {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;

  message: string;
  attachments?: string[];

  isInternal: boolean; // Internal note visible only to staff

  createdAt: Timestamp;
}

/**
 * Filters for querying support tickets from backend
 */
export interface SupportTicketFiltersBE {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  shopId?: string;
  orderId?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Create Support Ticket Request (to backend)
 */
export interface CreateSupportTicketRequestBE {
  category: TicketCategory;
  priority?: TicketPriority;
  subject: string;
  description: string;
  attachments?: string[];
  shopId?: string;
  orderId?: string;
}

/**
 * Update Support Ticket Request (to backend)
 */
export interface UpdateSupportTicketRequestBE {
  status?: TicketStatus;
  priority?: TicketPriority;
  subject?: string;
}

/**
 * Reply to Ticket Request (to backend)
 */
export interface ReplyToTicketRequestBE {
  message: string;
  attachments?: string[];
  isInternal?: boolean;
}

/**
 * Assign Ticket Request (to backend)
 */
export interface AssignTicketRequestBE {
  assignedTo: string;
  notes?: string;
}

/**
 * Escalate Ticket Request (to backend)
 */
export interface EscalateTicketRequestBE {
  reason: string;
  notes?: string;
}
