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
  id: string;
  userId: string;
  shopId?: string;
  orderId?: string;

  category: TicketCategory;
  priority: TicketPriority;

  subject: string;
  description: string;
  attachments?: string[];

  status: TicketStatus;

  assignedTo?: string;

  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;

  // UI helpers
  isOpen: boolean;
  isResolved: boolean;
  isClosed: boolean;
  isEscalated: boolean;
  canReply: boolean;
  canClose: boolean;
  formattedCreatedAt: string; // "Jan 15, 2025 10:30 AM"
  formattedUpdatedAt: string; // "2 hours ago"
  formattedResolvedAt?: string;
  categoryLabel: string; // "Order Issue"
  priorityLabel: string; // "High"
  statusBadge: {
    text: string;
    variant: "success" | "warning" | "error" | "info" | "default";
  };
  priorityBadge: {
    text: string;
    variant: "success" | "warning" | "error" | "info";
  };
  responseTime?: string; // "Responded in 2 hours"
  resolutionTime?: string; // "Resolved in 1 day"
}

/**
 * Support Ticket Card (for list views)
 */
export interface SupportTicketCardFE {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;

  // UI helpers
  categoryLabel: string;
  priorityLabel: string;
  formattedCreatedAt: string;
  formattedUpdatedAt: string;
  statusBadge: {
    text: string;
    variant: "success" | "warning" | "error" | "info" | "default";
  };
  priorityBadge: {
    text: string;
    variant: "success" | "warning" | "error" | "info";
  };
}

/**
 * Frontend Support Ticket Message (for display)
 */
export interface SupportTicketMessageFE {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;

  message: string;
  attachments?: string[];

  isInternal: boolean;

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
  category: TicketCategory;
  priority?: TicketPriority;
  subject: string;
  description: string;
  attachments?: string[];
  shopId?: string;
  orderId?: string;
}

/**
 * Reply to Ticket Form
 */
export interface ReplyToTicketFormFE {
  message: string;
  attachments?: string[];
  isInternal?: boolean;
}

/**
 * Update Ticket Form
 */
export interface UpdateTicketFormFE {
  status?: TicketStatus;
  priority?: TicketPriority;
  subject?: string;
}

/**
 * Assign Ticket Form
 */
export interface AssignTicketFormFE {
  assignedTo: string;
  notes?: string;
}

/**
 * Escalate Ticket Form
 */
export interface EscalateTicketFormFE {
  reason: string;
  notes?: string;
}

/**
 * Support Ticket Filters (for frontend filtering)
 */
export interface SupportTicketFiltersFE {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  shopId?: string;
  orderId?: string;
  assignedTo?: string;
  search?: string;
}

/**
 * Support Ticket Stats (for dashboard)
 */
export interface SupportTicketStatsFE {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  escalated: number;
  averageResponseTime: string; // "2 hours"
  averageResolutionTime: string; // "1 day"
  satisfactionRate?: number; // 0-100
}
