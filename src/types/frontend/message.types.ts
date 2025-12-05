/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/message.types
 * @description This file contains TypeScript type definitions for message
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Message Frontend Types
 * Epic: E023 - Messaging System
 */

/**
 * Conversation Type type definition
 * @typedef {ConversationType}
 */
export type ConversationType = "buyer_seller" | "order" | "support";
/**
 * ParticipantType type
 * 
 * @typedef {Object} ParticipantType
 * @description Type definition for ParticipantType
 */
export type ParticipantType = "user" | "seller" | "admin";
/**
 * ConversationStatus type
 * 
 * @typedef {Object} ConversationStatus
 * @description Type definition for ConversationStatus
 */
export type ConversationStatus = "active" | "archived" | "resolved";

/**
 * ConversationParticipantFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationParticipantFE
 */
export interface ConversationParticipantFE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: ParticipantType;
  /** Avatar */
  avatar?: string;
}

/**
 * ConversationContextFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationContextFE
 */
export interface ConversationContextFE {
  /** Order Id */
  orderId?: string;
  /** Product Id */
  productId?: string;
  /** Product Name */
  productName?: string;
  /** Shop Id */
  shopId?: string;
  /** Shop Name */
  shopName?: string;
  /** Auction Id */
  auctionId?: string;
}

/**
 * ConversationFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationFE
 */
export interface ConversationFE {
  /** Id */
  id: string;
  /** Type */
  type: ConversationType;
  /** Other Participant */
  otherParticipant: ConversationParticipantFE;
  /** Subject */
  subject?: string;
  /** Context */
  context?: ConversationContextFE;
  /** Last Message */
  lastMessage: {
    /** Content */
    content: string;
    /** Sender Id */
    senderId: string;
    /** Sent At */
    sentAt: Date;
    /** Is From Me */
    isFromMe: boolean;
  };
  /** Unread Count */
  unreadCount: number;
  /** Status */
  status: ConversationStatus;
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;
  // UI helpers
  /** Time Ago */
  timeAgo: string;
  /** Is Unread */
  isUnread: boolean;
}

/**
 * MessageAttachmentFE interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageAttachmentFE
 */
export interface MessageAttachmentFE {
  /** Id */
  id: string;
  /** Url */
  url: string;
  /** Thumbnail */
  thumbnail?: string;
  /** Filename */
  filename: string;
  /** Mime Type */
  mimeType: string;
  /** Size */
  size: number;
  /** Is Image */
  isImage: boolean;
}

/**
 * MessageFE interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageFE
 */
export interface MessageFE {
  /** Id */
  id: string;
  /** Conversation Id */
  conversationId: string;
  /** Sender Id */
  senderId: string;
  /** Sender Name */
  senderName: string;
  /** Sender Type */
  senderType: ParticipantType;
  /** Content */
  content: string;
  /** Attachments */
  attachments: MessageAttachmentFE[];
  /** Is Read */
  isRead: boolean;
  /** Is From Me */
  isFromMe: boolean;
  /** Is Deleted */
  isDeleted: boolean;
  /** Created At */
  createdAt: Date;
  // UI helpers
  /** Time Ago */
  timeAgo: string;
  /** Formatted Time */
  formattedTime: string;
}

/**
 * ConversationListResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationListResponse
 */
export interface ConversationListResponse {
  /** Conversations */
  conversations: ConversationFE[];
  /** Pagination */
  pagination: {
    /** Page */
    page: number;
    /** Page Size */
    pageSize: number;
    /** Total */
    total: number;
    /** Total Pages */
    totalPages: number;
    /** Has Next */
    hasNext: boolean;
    /** Has Prev */
    hasPrev: boolean;
  };
}

/**
 * MessageListResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageListResponse
 */
export interface MessageListResponse {
  /** Messages */
  messages: MessageFE[];
  /** Conversation */
  conversation: ConversationFE;
  /** Pagination */
  pagination: {
    /** Page */
    page: number;
    /** Page Size */
    pageSize: number;
    /** Total */
    total: number;
    /** Total Pages */
    totalPages: number;
    /** Has Next */
    hasNext: boolean;
    /** Has Prev */
    hasPrev: boolean;
  };
}

/**
 * CreateConversationInputFE interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateConversationInputFE
 */
export interface CreateConversationInputFE {
  /** Type */
  type: ConversationType;
  /** Recipient Id */
  recipientId: string;
  /** Recipient Type */
  recipientType?: ParticipantType;
  /** Subject */
  subject?: string;
  /** Message */
  message: string;
  /** Context */
  context?: ConversationContextFE;
}

/**
 * SendMessageInputFE interface
 * 
 * @interface
 * @description Defines the structure and contract for SendMessageInputFE
 */
export interface SendMessageInputFE {
  /** Content */
  content: string;
  /** Attachments */
  attachments?: File[];
}
