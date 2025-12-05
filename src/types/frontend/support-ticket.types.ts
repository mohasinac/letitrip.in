/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/support-ticket.types
 * @description This file contains TypeScript type definitions for support-ticket
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Frontend Support Ticket Types
 *
 * Support ticket types optimized for UI display and forms
 * Uses JavaScript Date objects and formatted strings
 */

import type {
  TicketStatus,
  TicketCategory,
  TicketPriority,
  UserRole,
} from "../shared/common.types";

/**
 * Frontend Support Ticket (for display in UI)
 */
export interface SupportTicketFE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Shop Id */
  shopId?: string;
  /** Order Id */
  orderId?: string;

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

  /** Assigned To */
  assignedTo?: string;

  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;
  /** Resolved At */
  resolvedAt?: Date;

  // UI helpers
  /** Is Open */
  isOpen: boolean;
  /** Is Resolved */
  isResolved: boolean;
  /** Is Closed */
  isClosed: boolean;
  /** Is Escalated */
  isEscalated: boolean;
  /** Can Reply */
  canReply: boolean;
  /** Can Close */
  canClose: boolean;
  formattedCreatedAt: string; // "Jan 15, 2025 10:30 AM"
  formattedUpdatedAt: string; // "2 hours ago"
  /** Formatted Resolved At */
  formattedResolvedAt?: string;
  categoryLabel: string; // "Order Issue"
  priorityLabel: string; // "High"
  /** Status Badge */
  statusBadge: {
    /** Text */
    text: string;
    /** Variant */
    variant: "success" | "warning" | "error" | "info" | "default";
  };
  /** Priority Badge */
  priorityBadge: {
    /** Text */
    text: string;
    /** Variant */
    variant: "success" | "warning" | "error" | "info";
  };
  responseTime?: string; // "Responded in 2 hours"
  resolutionTime?: string; // "Resolved in 1 day"
}

/**
 * Support Ticket Card (for list views)
 */
export interface SupportTicketCardFE {
  /** Id */
  id: string;
  /** Subject */
  subject: string;
  /** Category */
  category: TicketCategory;
  /** Priority */
  priority: TicketPriority;
  /** Status */
  status: TicketStatus;
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // UI helpers
  /** Category Label */
  categoryLabel: string;
  /** Priority Label */
  priorityLabel: string;
  /** Formatted Created At */
  formattedCreatedAt: string;
  /** Formatted Updated At */
  formattedUpdatedAt: string;
  /** Status Badge */
  statusBadge: {
    /** Text */
    text: string;
    /** Variant */
    variant: "success" | "warning" | "error" | "info" | "default";
  };
  /** Priority Badge */
  priorityBadge: {
    /** Text */
    text: string;
    /** Variant */
    variant: "success" | "warning" | "error" | "info";
  };
}

/**
 * Frontend Support Ticket Message (for display)
 */
export interface SupportTicketMessageFE {
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

  /** Is Internal */
  isInternal: boolean;

  /** Created At */
  createdAt: Date;

  // UI helpers
  formattedCreatedAt: string; // "Jan 15, 2025 10:30 AM"
  timeAgo: string; // "2 hours ago"
  isStaff: boolean; // admin or staff message
  isCustomer: boolean; // user or seller message
  roleLabel: string; // "Support Agent", "Customer", etc.
  senderName?: string; // Populated by service if needed
}

/**
 * Support Ticket Form (for create/edit)
 */
export interface SupportTicketFormFE {
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
 * Reply to Ticket Form
 */
export interface ReplyToTicketFormFE {
  /** Message */
  message: string;
  /** Attachments */
  attachments?: string[];
  /** Is Internal */
  isInternal?: boolean;
}

/**
 * Update Ticket Form
 */
export interface UpdateTicketFormFE {
  /** Status */
  status?: TicketStatus;
  /** Priority */
  priority?: TicketPriority;
  /** Subject */
  subject?: string;
}

/**
 * Assign Ticket Form
 */
export interface AssignTicketFormFE {
  /** Assigned To */
  assignedTo: string;
  /** Notes */
  notes?: string;
}

/**
 * Escalate Ticket Form
 */
export interface EscalateTicketFormFE {
  /** Reason */
  reason: string;
  /** Notes */
  notes?: string;
}

/**
 * Support Ticket Filters (for frontend filtering)
 */
export interface SupportTicketFiltersFE {
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
}

/**
 * Support Ticket Stats (for dashboard)
 */
export interface SupportTicketStatsFE {
  /** Total */
  total: number;
  /** Open */
  open: number;
  /** In Progress */
  inProgress: number;
  /** Resolved */
  resolved: number;
  /** Closed */
  closed: number;
  /** Escalated */
  escalated: number;
  averageResponseTime: string; // "2 hours"
  averageResolutionTime: string; // "1 day"
  satisfactionRate?: number; // 0-100
}
