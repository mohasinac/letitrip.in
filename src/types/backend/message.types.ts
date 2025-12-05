/**
 * @fileoverview Type Definitions
 * @module src/types/backend/message.types
 * @description This file contains TypeScript type definitions for message
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Message Backend Types
 * Epic: E023 - Messaging System
 */

import { FirebaseTimestamp } from "@/types/shared/common.types";

/**
 * ConversationType type
 * 
 * @typedef {Object} ConversationType
 * @description Type definition for ConversationType
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
 * ConversationParticipant interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationParticipant
 */
export interface ConversationParticipant {
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
 * ConversationContext interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationContext
 */
export interface ConversationContext {
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
 * ConversationBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationBE
 */
export interface ConversationBE {
  /** Id */
  id: string;
  /** Type */
  type: ConversationType;
  /** Participants */
  participants: {
    /** Sender */
    sender: ConversationParticipant;
    /** Recipient */
    recipient: ConversationParticipant;
  };
  /** Subject */
  subject?: string;
  /** Context */
  context?: ConversationContext;
  /** Last Message */
  lastMessage: {
    /** Content */
    content: string;
    /** Sender Id */
    senderId: string;
    /** Sent At */
    sentAt: FirebaseTimestamp;
  };
  /** Unread Count */
  unreadCount: Record<string, number>;
  /** Status */
  status: ConversationStatus;
  /** Created At */
  createdAt: FirebaseTimestamp;
  /** Updated At */
  updatedAt: FirebaseTimestamp;
}

/**
 * MessageAttachment interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageAttachment
 */
export interface MessageAttachment {
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
}

/**
 * MessageBE interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageBE
 */
export interface MessageBE {
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
  attachments: MessageAttachment[];
  /** Read By */
  readBy: Record<string, FirebaseTimestamp>;
  /** Is Deleted */
  isDeleted: boolean;
  /** Created At */
  createdAt: FirebaseTimestamp;
}

/**
 * CreateConversationInput interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateConversationInput
 */
export interface CreateConversationInput {
  /** Type */
  type: ConversationType;
  /** Recipient Id */
  recipientId: string;
  /** Recipient Type */
  recipientType: ParticipantType;
  /** Subject */
  subject?: string;
  /** Message */
  message: string;
  /** Context */
  context?: ConversationContext;
  /** Attachments */
  attachments?: File[];
}

/**
 * SendMessageInput interface
 * 
 * @interface
 * @description Defines the structure and contract for SendMessageInput
 */
export interface SendMessageInput {
  /** Conversation Id */
  conversationId: string;
  /** Content */
  content: string;
  /** Attachments */
  attachments?: File[];
}
