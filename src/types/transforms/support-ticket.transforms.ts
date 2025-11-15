/**
 * Support Ticket Transformation Functions
 *
 * Convert between backend and frontend support ticket types
 */

import type {
  SupportTicketBE,
  SupportTicketMessageBE,
  CreateSupportTicketRequestBE,
  UpdateSupportTicketRequestBE,
  ReplyToTicketRequestBE,
  AssignTicketRequestBE,
  EscalateTicketRequestBE,
} from "../backend/support-ticket.types";
import type {
  SupportTicketFE,
  SupportTicketCardFE,
  SupportTicketMessageFE,
  SupportTicketFormFE,
  UpdateTicketFormFE,
  ReplyToTicketFormFE,
  AssignTicketFormFE,
  EscalateTicketFormFE,
} from "../frontend/support-ticket.types";
import {
  TicketStatus,
  TicketCategory,
  TicketPriority,
  UserRole,
} from "../shared/common.types";

/**
 * Format date and time
 */
const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date only
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get time ago string
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return formatDate(date);
};

/**
 * Get category label
 */
const getCategoryLabel = (category: TicketCategory): string => {
  const labels: Record<TicketCategory, string> = {
    [TicketCategory.ORDER_ISSUE]: "Order Issue",
    [TicketCategory.RETURN_REFUND]: "Return & Refund",
    [TicketCategory.PRODUCT_QUESTION]: "Product Question",
    [TicketCategory.ACCOUNT]: "Account",
    [TicketCategory.PAYMENT]: "Payment",
    [TicketCategory.OTHER]: "Other",
  };
  return labels[category] || category;
};

/**
 * Get priority label
 */
const getPriorityLabel = (priority: TicketPriority): string => {
  const labels: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: "Low",
    [TicketPriority.MEDIUM]: "Medium",
    [TicketPriority.HIGH]: "High",
    [TicketPriority.URGENT]: "Urgent",
  };
  return labels[priority] || priority;
};

/**
 * Get status badge
 */
const getStatusBadge = (
  status: TicketStatus
): {
  text: string;
  variant: "success" | "warning" | "error" | "info" | "default";
} => {
  const badges: Record<
    TicketStatus,
    {
      text: string;
      variant: "success" | "warning" | "error" | "info" | "default";
    }
  > = {
    [TicketStatus.OPEN]: { text: "Open", variant: "info" },
    [TicketStatus.IN_PROGRESS]: { text: "In Progress", variant: "warning" },
    [TicketStatus.RESOLVED]: { text: "Resolved", variant: "success" },
    [TicketStatus.CLOSED]: { text: "Closed", variant: "default" },
    [TicketStatus.ESCALATED]: { text: "Escalated", variant: "error" },
  };
  return badges[status] || { text: status, variant: "default" };
};

/**
 * Get priority badge
 */
const getPriorityBadge = (
  priority: TicketPriority
): { text: string; variant: "success" | "warning" | "error" | "info" } => {
  const badges: Record<
    TicketPriority,
    { text: string; variant: "success" | "warning" | "error" | "info" }
  > = {
    [TicketPriority.LOW]: { text: "Low", variant: "success" },
    [TicketPriority.MEDIUM]: { text: "Medium", variant: "info" },
    [TicketPriority.HIGH]: { text: "High", variant: "warning" },
    [TicketPriority.URGENT]: { text: "Urgent", variant: "error" },
  };
  return badges[priority] || { text: priority, variant: "info" };
};

/**
 * Calculate response/resolution time
 */
const calculateDuration = (start: Date, end: Date): string => {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${days} day${days > 1 ? "s" : ""}`;
};

/**
 * Get role label
 */
const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Support Agent",
    [UserRole.SELLER]: "Seller",
    [UserRole.USER]: "Customer",
    [UserRole.GUEST]: "Guest",
  };
  return labels[role] || role;
};

/**
 * Transform Support Ticket BE to FE
 */
export const toFESupportTicket = (
  ticketBE: SupportTicketBE
): SupportTicketFE => {
  const createdAt = ticketBE.createdAt.toDate();
  const updatedAt = ticketBE.updatedAt.toDate();
  const resolvedAt = ticketBE.resolvedAt?.toDate();

  const isOpen = ticketBE.status === TicketStatus.OPEN;
  const isResolved = ticketBE.status === TicketStatus.RESOLVED;
  const isClosed = ticketBE.status === TicketStatus.CLOSED;
  const isEscalated = ticketBE.status === TicketStatus.ESCALATED;

  const canReply = !isClosed;
  const canClose =
    isOpen || ticketBE.status === TicketStatus.IN_PROGRESS || isResolved;

  const responseTime =
    ticketBE.status !== TicketStatus.OPEN && updatedAt > createdAt
      ? `Responded in ${calculateDuration(createdAt, updatedAt)}`
      : undefined;

  const resolutionTime = resolvedAt
    ? `Resolved in ${calculateDuration(createdAt, resolvedAt)}`
    : undefined;

  return {
    id: ticketBE.id,
    userId: ticketBE.userId,
    shopId: ticketBE.shopId,
    orderId: ticketBE.orderId,
    category: ticketBE.category,
    priority: ticketBE.priority,
    subject: ticketBE.subject,
    description: ticketBE.description,
    attachments: ticketBE.attachments,
    status: ticketBE.status,
    assignedTo: ticketBE.assignedTo,
    createdAt,
    updatedAt,
    resolvedAt,
    isOpen,
    isResolved,
    isClosed,
    isEscalated,
    canReply,
    canClose,
    formattedCreatedAt: formatDateTime(createdAt),
    formattedUpdatedAt: getTimeAgo(updatedAt),
    formattedResolvedAt: resolvedAt ? formatDateTime(resolvedAt) : undefined,
    categoryLabel: getCategoryLabel(ticketBE.category),
    priorityLabel: getPriorityLabel(ticketBE.priority),
    statusBadge: getStatusBadge(ticketBE.status),
    priorityBadge: getPriorityBadge(ticketBE.priority),
    responseTime,
    resolutionTime,
  };
};

/**
 * Transform array of Support Ticket BE to FE
 */
export const toFESupportTickets = (
  ticketsBE: SupportTicketBE[]
): SupportTicketFE[] => {
  return ticketsBE.map(toFESupportTicket);
};

/**
 * Transform Support Ticket BE to Card FE (for list views)
 */
export const toFESupportTicketCard = (
  ticketBE: SupportTicketBE
): SupportTicketCardFE => {
  const createdAt = ticketBE.createdAt.toDate();
  const updatedAt = ticketBE.updatedAt.toDate();

  return {
    id: ticketBE.id,
    subject: ticketBE.subject,
    category: ticketBE.category,
    priority: ticketBE.priority,
    status: ticketBE.status,
    createdAt,
    updatedAt,
    categoryLabel: getCategoryLabel(ticketBE.category),
    priorityLabel: getPriorityLabel(ticketBE.priority),
    formattedCreatedAt: formatDate(createdAt),
    formattedUpdatedAt: getTimeAgo(updatedAt),
    statusBadge: getStatusBadge(ticketBE.status),
    priorityBadge: getPriorityBadge(ticketBE.priority),
  };
};

/**
 * Transform array of Support Ticket BE to Card FE
 */
export const toFESupportTicketCards = (
  ticketsBE: SupportTicketBE[]
): SupportTicketCardFE[] => {
  return ticketsBE.map(toFESupportTicketCard);
};

/**
 * Transform Support Ticket Message BE to FE
 */
export const toFESupportTicketMessage = (
  messageBE: SupportTicketMessageBE
): SupportTicketMessageFE => {
  const createdAt = messageBE.createdAt.toDate();
  const isStaff = messageBE.senderRole === UserRole.ADMIN;
  const isCustomer =
    messageBE.senderRole === UserRole.USER ||
    messageBE.senderRole === UserRole.SELLER;

  return {
    id: messageBE.id,
    ticketId: messageBE.ticketId,
    senderId: messageBE.senderId,
    senderRole: messageBE.senderRole,
    message: messageBE.message,
    attachments: messageBE.attachments,
    isInternal: messageBE.isInternal,
    createdAt,
    formattedCreatedAt: formatDateTime(createdAt),
    timeAgo: getTimeAgo(createdAt),
    isStaff,
    isCustomer,
    roleLabel: getRoleLabel(messageBE.senderRole),
  };
};

/**
 * Transform array of Support Ticket Message BE to FE
 */
export const toFESupportTicketMessages = (
  messagesBE: SupportTicketMessageBE[]
): SupportTicketMessageFE[] => {
  return messagesBE.map(toFESupportTicketMessage);
};

/**
 * Transform Support Ticket Form FE to Create Request BE
 */
export const toBECreateSupportTicketRequest = (
  formData: SupportTicketFormFE
): CreateSupportTicketRequestBE => {
  return {
    category: formData.category,
    priority: formData.priority,
    subject: formData.subject,
    description: formData.description,
    attachments: formData.attachments,
    shopId: formData.shopId,
    orderId: formData.orderId,
  };
};

/**
 * Transform Update Ticket Form FE to Update Request BE
 */
export const toBEUpdateSupportTicketRequest = (
  formData: UpdateTicketFormFE
): UpdateSupportTicketRequestBE => {
  return {
    status: formData.status,
    priority: formData.priority,
    subject: formData.subject,
  };
};

/**
 * Transform Reply Form FE to Request BE
 */
export const toBEReplyToTicketRequest = (
  formData: ReplyToTicketFormFE
): ReplyToTicketRequestBE => {
  return {
    message: formData.message,
    attachments: formData.attachments,
    isInternal: formData.isInternal,
  };
};

/**
 * Transform Assign Form FE to Request BE
 */
export const toBEAssignTicketRequest = (
  formData: AssignTicketFormFE
): AssignTicketRequestBE => {
  return {
    assignedTo: formData.assignedTo,
    notes: formData.notes,
  };
};

/**
 * Transform Escalate Form FE to Request BE
 */
export const toBEEscalateTicketRequest = (
  formData: EscalateTicketFormFE
): EscalateTicketRequestBE => {
  return {
    reason: formData.reason,
    notes: formData.notes,
  };
};
