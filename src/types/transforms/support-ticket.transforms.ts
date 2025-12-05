/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/support-ticket.transforms
 * @description This file contains functionality related to support-ticket.transforms
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * Formats date time
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdatetime result
 */

/**
 * Formats date time
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdatetime result
 */

const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    /** Day */
    day: "numeric",
    /** Month */
    month: "short",
    /** Year */
    year: "numeric",
    /** Hour */
    hour: "2-digit",
    /** Minute */
    minute: "2-digit",
  });
};

/**
 * Format date only
 */
/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    /** Day */
    day: "numeric",
    /** Month */
    month: "short",
    /** Year */
    year: "numeric",
  });
};

/**
 * Get time ago string
 */
/**
 * Retrieves time ago
 *
 * @param {Date} date - The date
 *
 * @returns {string} The timeago result
 */

/**
 * Retrieves time ago
 *
 * @param {Date} date - The date
 *
 * @returns {string} The timeago result
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
/**
 * Retrieves category label
 *
 * @param {TicketCategory} category - The category
 *
 * @returns {string} The categorylabel result
 */

/**
 * Retrieves category label
 *
 * @param {TicketCategory} category - The category
 *
 * @returns {string} The categorylabel result
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
/**
 * Retrieves priority label
 *
 * @param {TicketPriority} priority - The priority
 *
 * @returns {string} The prioritylabel result
 */

/**
 * Retrieves priority label
 *
 * @param {TicketPriority} priority - The priority
 *
 * @returns {string} The prioritylabel result
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
/**
 * Retrieves status badge
 *
 * @param {TicketStatus} status - The status
 *
 * @returns {string} The statusbadge result
 */

/**
 * Retrieves status badge
 *
 * @param {TicketStatus} /** Status */
  status - The /**  status */
  status
 *
 * @returns {any} The statusbadge result
 */

/**
 * Retrieves status badge
 *
 * @param {TicketStatus} status - The status
 *
 * @returns {} The getstatusbadge result
 *
 */
const getStatusBadge = (
  /** Status */
  status: TicketStatus,
): {
  /** Text */
  text: string;
  /** Variant */
  variant: "success" | "warning" | "error" | "info" | "default";
} => {
  const badges: Record<
    TicketStatus,
    {
      /** Text */
      text: string;
      /** Variant */
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
/**
 * Retrieves priority badge
 *
 * @param {TicketPriority} priority - The priority
 *
 * @returns {string} The prioritybadge result
 */

/**
 * Retrieves priority badge
 *
 * @param {Ti/**
 * Retrieves priority badge
 *
 * @param {TicketPriority} priority - The priority
 *
 * @returns {} The getprioritybadge result
 *
 */
cketPriority} /** Priority */
  priority - The /**  priority */
  priority
 *
 * @returns {string} The prioritybadge result
 */

const getPriorityBadge = (
  /** Priority */
  priority: TicketPriority,
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
/**
 * Calculates duration
 *
 * @param {Date} start - The start
 * @param {Date} end - The end
 *
 * @returns {string} The calculateduration result
 */

/**
 * Calculates duration
 *
 * @param {Date} start - The start
 * @param {Date} end - The end
 *
 * @returns {string} The calculateduration result
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
/**
 * Retrieves role label
 *
 * @param {UserRole} role - The role
 *
 * @returns {string} The rolelabel result
 */

/**
 * Retrieves role label
 *
 * @param {UserRole} role - The role
 *
 * @returns {string} The rolelabel result
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
/**
 * Performs to f e support ticket operation
 *
 * @param {SupportTicketBE} ticketBE - The ticket b e
 *
 * @returns {any} The tofesupportticket result
 *
 * @example
 * toFESupportTicket(ticketBE);
 */

/*/**
 * Performs to f e support ticket operation
 *
 * @param {SupportTicketBE} ticketBE - The ticketbe
 *
 * @returns {SupportTicketFE =>} The tofesupportticket result
 *
 * @example
 * toFESupportTicket(ticketBE);
 */
*
 * Performs to f e support ticket operation
 *
 * @param {SupportTicketBE} /** Ticket B E */
  ticketBE - The /**  ticket  b  e */
  ticket b e
 *
 * @returns {any} The tofesupportticket result
 *
 * @example
 * toFESupportTicket(/** Ticket B E */
  ticketBE);
 */

export const toFESupportTicket = (
  /** Ticket B E */
  ticketBE: SupportTicketBE,
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
    /** Id */
    id: ticketBE.id,
    /** User Id */
    userId: ticketBE.userId,
    /** Shop Id */
    shopId: ticketBE.shopId,
    /** Order Id */
    orderId: ticketBE.orderId,
    /** Category */
    category: ticketBE.category,
    /** Priority */
    priority: ticketBE.priority,
    /** Subject */
    subject: ticketBE.subject,
    /** Description */
    description: ticketBE.description,
    /** Attachments */
    attachments: ticketBE.attachments,
    /** Status */
    status: ticketBE.status,
    /** Assigned To */
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
    /** Formatted Created At */
    formattedCreatedAt: formatDateTime(createdAt),
    /** Formatted Updated At */
    formattedUpdatedAt: getTimeAgo(updatedAt),
    /** Formatted Resolved At */
    formattedResolvedAt: resolvedAt ? formatDateTime(resolvedAt) : undefined,
    /** Category Label */
    categoryLabel: getCategoryLabel(ticketBE.category),
    /** Priority Label */
    priorityLabel: getPriorityLabel(ticketBE.priority),
    /** Status Badge */
    statusBadge: getStatusBadge(ticketBE.status),
    /** Priority Badge */
    priorityBadge: getPriorityBadge(ticketBE.priority),
    responseTime,
    resolutionTime,
  };
};

/**
 * Transform array of Support Ticket BE to FE
 */
/**
 * Pe/**
 * Performs to f e support tickets operation
 *
 * @param {SupportTicketBE[]} ticketsBE - The ticketsbe
 *
 * @returns {SupportTicketFE[] =>} The tofesupporttickets result
 *
 * @example
 * toFESupportTickets([]);
 */
rforms to f e support tickets operation
 *
 * @param {SupportTicketBE[]} ticketsBE - The tickets b e
 *
 * @returns {any} The tofesupporttickets result
 *
 * @example
 * toFESupportTickets(ticketsBE);
 */

/**
 * Performs to f e support tickets operation
 *
 * @param {SupportTicketBE[]} /** Tickets B E */
  ticketsBE - The /**  tickets  b  e */
  tickets b e
 *
 * @returns {any} The tofesupporttickets result
 *
 * @example
 * toFESupportTickets(/** Tickets B E */
  ticketsBE);
 */

export const toFESuppor/**
 * Performs to f e support ticket card operation
 *
 * @param {SupportTicketBE} ticketBE - The ticketbe
 *
 * @returns {SupportTicketCardFE =>} The tofesupportticketcard result
 *
 * @example
 * toFESupportTicketCard(ticketBE);
 */
tTickets = (
  /** Tickets B E */
  ticketsBE: SupportTicketBE[],
): SupportTicketFE[] => {
  return ticketsBE.map(toFESupportTicket);
};

/**
 * Transform Support Ticket BE to Card FE (for list views)
 */
/**
 * Performs to f e support ticket card operation
 *
 * @param {SupportTicketBE} ticketBE - The ticket b e
 *
 * @returns {any} The tofesupportticketcard result
 *
 * @example
 * toFESupportTicketCard(ticketBE);
 */

/**
 * Performs to f e support ticket card operation
 *
 * @param {SupportTicketBE} /** Ticket B E */
  ticketBE - The /**  ticket  b  e */
  ticket b e
 *
 * @returns {any} The tofesupportticketcard result
 *
 * @example
 * toFESupportTicketCard(/** Ticket B E */
  ticketBE);
 */

export const toFESupportTicketCard = (
  /** Ticket B E */
  ticketBE: SupportTicketBE,
): SupportTicketCardFE => {
  const createdAt = ticketBE.createdAt.toDate();
  const updatedAt = ticketBE.updatedAt.toDate();

  return {
    /** Id */
    id: ticketBE.id,
    /** Subject */
    subject: ticketBE.subject,
    /** Category */
    category: ticketBE.category,
    /** Priority */
    priority: ticketBE.priority,
    /** Status */
    status: ticketBE.status,
    createdAt,
    updatedAt,
    /** Category Label */
    categoryLabel: getCategoryLabel(ticketBE.category),
    /** Priority Label */
    priorityLab/**
 * Performs to f e support ticket cards operation
 *
 * @param {SupportTicketBE[]} ticketsBE - The ticketsbe
 *
 * @returns {SupportTicketCardFE[] =>} The tofesupportticketcards result
 *
 * @example
 * toFESupportTicketCards([]);
 */
el: getPriorityLabel(ticketBE.priority),
    /** Formatted Created At */
    formattedCreatedAt: formatDate(createdAt),
    /** Formatted Updated At */
    formattedUpdatedAt: getTimeAgo(updatedAt),
    /** Status Badge */
    statusBadge: getStatusBadge(ticketBE.status),
    /** Priority Badge */
    priorityBadge: getPriorityBadge(ticketBE.priority),
  };
};

/**
 * Transform array of Support Ticket BE to Card FE
 */
/**
 * Performs to f e support ticket cards operation
 *
 * @param {SupportTicketBE[]} ticketsBE - The ticket/**
 * Performs to f e support ticket message operation
 *
 * @param {SupportTicketMessageBE} messageBE - The messagebe
 *
 * @returns {SupportTicketMessageFE =>} The tofesupportticketmessage result
 *
 * @example
 * toFESupportTicketMessage(messageBE);
 */
s b e
 *
 * @returns {any} The tofesupportticketcards result
 *
 * @example
 * toFESupportTicketCards(ticketsBE);
 */

/**
 * Performs to f e support ticket cards operation
 *
 * @param {SupportTicketBE[]} /** Tickets B E */
  ticketsBE - The /**  tickets  b  e */
  tickets b e
 *
 * @returns {any} The tofesupportticketcards result
 *
 * @example
 * toFESupportTicketCards(/** Tickets B E */
  ticketsBE);
 */

export const toFESupportTicketCards = (
  /** Tickets B E */
  ticketsBE: SupportTicketBE[],
): SupportTicketCardFE[] => {
  return ticketsBE.map(toFESupportTicketCard);
};

/**
 * Transform Support Ticket Message BE to FE
 */
/**
 * Performs to f e support ticket message operation
 *
 * @param {SupportTicketMessageBE} messageBE - The message b e
 *
 * @returns {any} The tofesupportticketmessage result
 *
 * @example
 * toFESupportTicketMessage(messageBE);
 */

/**
 * Performs to f e support ticket message operation
 *
 * @param {SupportTicketMessageBE} /** Message B E */
  messageBE - The /**  message  b  e */
  message b e
 *
 * @returns {any} The tofesupportticketmessage result
 *
 * @example
 * toFESupportTicketMessage(/** Message B E */
  messageBE);
 */

export const toFESupportTicketMessage = (
  /** Message B E */
  messageBE: SupportTicketMessageBE,
): SupportTicketMessageFE => {
  const createdAt = messageBE.createdAt.toDate();
  const isStaf/**
 * Performs to f e support ticket messages operation
 *
 * @param {SupportTicketMessageBE[]} messagesBE - The messagesbe
 *
 * @returns {SupportTicketMessageFE[] =>} The tofesupportticketmessages result
 *
 * @example
 * toFESupportTicketMessages([]);
 */
f = messageBE.senderRole === UserRole.ADMIN;
  const isCustomer =
    messageBE.senderRole === UserRole.USER ||
    messageBE.senderRole === UserRole.SELLER;

  return {
    /** Id */
    id: messageBE.id,
    /** Ticket Id */
    ticketId: messageBE.ticketId,
    /** Sender Id */
    senderId: messageBE.senderId,
    /** Sender Role */
    senderRole: messageBE.senderRole,
    /** Message */
    message: messageBE.message,
    /** Attachments */
    attachments: messageBE.attachments,
    /** Is Internal */
    isInternal: messageBE.isInternal,
    cre/**
 * Performs to b e create support ticket request operation
 *
 * @param {SupportTicketFormFE} formData - The formdata
 *
 * @returns {CreateSupportTicketRequestBE =>} The tobecreatesupportticketrequest result
 *
 * @example
 * toBECreateSupportTicketRequest(formData);
 */
atedAt,
    /** Formatted Created At */
    formattedCreatedAt: formatDateTime(createdAt),
    /** Time Ago */
    timeAgo: getTimeAgo(createdAt),
    isStaff,
    isCustomer,
    /** Role Label */
    roleLabel: getRoleLabel(messageBE.senderRole),
  };
};

/**
 * Transform array of Support Ticket Message BE to FE
 */
/**
 * Performs to f e support ticket messages operation
 *
 * @param {SupportTicketMessageBE[]} messagesBE - The messages b e
 *
 * @returns {any} The tofesupportticketmessages result
 *
 * @example
 * toFESupportTicketMessages(messagesBE);
 */

/**
 * Performs to f e support ticket messages operation
 *
 * @param {SupportTicketMessageBE[]} /** Messages B E */
  messagesBE - The /**  messages  b  e */
  messages b e
 *
 * @returns {any} The tofesupportticketmessages result
 *
 * @example
 * toFESupportTicketMessages(/** Messages B E */
  messagesBE);
 */
/**
 * Performs to b e update support ticket request operation
 *
 * @param {UpdateTicketFormFE} formData - The formdata
 *
 * @returns {UpdateSupportTicketRequestBE =>} The tobeupdatesupportticketrequest result
 *
 * @example
 * toBEUpdateSupportTicketRequest(formData);
 */

export const toFESupportTicketMessages = (
  /** Messages B E */
  messagesBE: SupportTicketMessageBE[],
): SupportTicketMessageFE[] => {
  return messagesBE.map(toFESupportTicketMessage);
};

/**
 * Transform Support Ticket Form FE to Create Request BE
 */
/**
 * Performs to b e create support ticket request operation
 *
 * @param {SupportTicketFormFE} formData - The form data
 *
 * @returns {any} The tobecreatesupportticketrequest result
 *
 * @example
 * toBECreateSupportTicketRequest(formData);
 */

/**
 * Performs to b e create support ticket request operation
 *
 * @param {SupportTicketForm/**
 * Performs to b e reply to ticket request operation
 *
 * @param {ReplyToTicketFormFE} formData - The formdata
 *
 * @returns {ReplyToTicketRequestBE =>} The tobereplytoticketrequest result
 *
 * @example
 * toBEReplyToTicketRequest(formData);
 */
FE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreatesupportticketrequest result
 *
 * @example
 * toBECreateSupportTicketRequest(/** Form Data */
  formData);
 */

export const toBECreateSupportTicketRequest = (
  /** Form Data */
  formData: SupportTicketFormFE,
): CreateSupportTicketRequestBE => {
  return {
    /** Category */
    category: formData.category,
    /** Priority */
    priority: formData.priority,
    /** Subject */
    subject: formData.subject,
    /** Description */
    description: formData.description,
    /** Attachments */
    attachments: formDat/**
 * Performs to b e assign ticket request operation
 *
 * @param {AssignTicketFormFE} formData - The formdata
 *
 * @returns {AssignTicketRequestBE =>} The tobeassignticketrequest result
 *
 * @example
 * toBEAssignTicketRequest(formData);
 */
a.attachments,
    /** Shop Id */
    shopId: formData.shopId,
    /** Order Id */
    orderId: formData.orderId,
  };
};

/**
 * Transform Update Ticket Form FE to Update Request BE
 */
/**
 * Performs to b e update support ticket request operation
 *
 * @param {UpdateTicketFormFE} formData - The form data
 *
 * @returns {any} The tobeupdatesupportticketrequest result
 *
 * @example
 * toBEUpdateSupportTicketRequest(formData);
 */

/**
 * Performs to b e update support ticket request operation
 *
 * @param {UpdateTicketFormFE} /** Form Data */
  formData - The /**  form  dat/**
 * Performs to b e escalate ticket request operation
 *
 * @param {EscalateTicketFormFE} formData - The formdata
 *
 * @returns {EscalateTicketRequestBE =>} The tobeescalateticketrequest result
 *
 * @example
 * toBEEscalateTicketRequest(formData);
 */
a */
  form data
 *
 * @returns {any} The tobeupdatesupportticketrequest result
 *
 * @example
 * toBEUpdateSupportTicketRequest(/** Form Data */
  formData);
 */

export const toBEUpdateSupportTicketRequest = (
  /** Form Data */
  formData: UpdateTicketFormFE,
): UpdateSupportTicketRequestBE => {
  return {
    /** Status */
    status: formData.status,
    /** Priority */
    priority: formData.priority,
    /** Subject */
    subject: formData.subject,
  };
};

/**
 * Transform Reply Form FE to Request BE
 */
/**
 * Performs to b e reply to ticket request operation
 *
 * @param {ReplyToTicketFormFE} formData - The form data
 *
 * @returns {any} The tobereplytoticketrequest result
 *
 * @example
 * toBEReplyToTicketRequest(formData);
 */

/**
 * Performs to b e reply to ticket request operation
 *
 * @param {ReplyToTicketFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobereplytoticketrequest result
 *
 * @example
 * toBEReplyToTicketRequest(/** Form Data */
  formData);
 */

export const toBEReplyToTicketRequest = (
  /** Form Data */
  formData: ReplyToTicketFormFE,
): ReplyToTicketRequestBE => {
  return {
    /** Message */
    message: formData.message,
    /** Attachments */
    attachments: formData.attachments,
    /** Is Internal */
    isInternal: formData.isInternal,
  };
};

/**
 * Transform Assign Form FE to Request BE
 */
/**
 * Performs to b e assign ticket request operation
 *
 * @param {AssignTicketFormFE} formData - The form data
 *
 * @returns {any} The tobeassignticketrequest result
 *
 * @example
 * toBEAssignTicketRequest(formData);
 */

/**
 * Performs to b e assign ticket request operation
 *
 * @param {AssignTicketFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeassignticketrequest result
 *
 * @example
 * toBEAssignTicketRequest(/** Form Data */
  formData);
 */

export const toBEAssignTicketRequest = (
  /** Form Data */
  formData: AssignTicketFormFE,
): AssignTicketRequestBE => {
  return {
    /** Assigned To */
    assignedTo: formData.assignedTo,
    /** Notes */
    notes: formData.notes,
  };
};

/**
 * Transform Escalate Form FE to Request BE
 */
/**
 * Performs to b e escalate ticket request operation
 *
 * @param {EscalateTicketFormFE} formData - The form data
 *
 * @returns {any} The tobeescalateticketrequest result
 *
 * @example
 * toBEEscalateTicketRequest(formData);
 */

/**
 * Performs to b e escalate ticket request operation
 *
 * @param {EscalateTicketFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeescalateticketrequest result
 *
 * @example
 * toBEEscalateTicketRequest(/** Form Data */
  formData);
 */

export const toBEEscalateTicketRequest = (
  /** Form Data */
  formData: EscalateTicketFormFE,
): EscalateTicketRequestBE => {
  return {
    /** Reason */
    reason: formData.reason,
    /** Notes */
    notes: formData.notes,
  };
};
