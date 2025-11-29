/**
 * Message Backend Types
 * Epic: E023 - Messaging System
 */

import { FirebaseTimestamp } from "@/types/shared/common.types";

export type ConversationType = "buyer_seller" | "order" | "support";
export type ParticipantType = "user" | "seller" | "admin";
export type ConversationStatus = "active" | "archived" | "resolved";

export interface ConversationParticipant {
  id: string;
  name: string;
  type: ParticipantType;
  avatar?: string;
}

export interface ConversationContext {
  orderId?: string;
  productId?: string;
  productName?: string;
  shopId?: string;
  shopName?: string;
  auctionId?: string;
}

export interface ConversationBE {
  id: string;
  type: ConversationType;
  participants: {
    sender: ConversationParticipant;
    recipient: ConversationParticipant;
  };
  subject?: string;
  context?: ConversationContext;
  lastMessage: {
    content: string;
    senderId: string;
    sentAt: FirebaseTimestamp;
  };
  unreadCount: Record<string, number>;
  status: ConversationStatus;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

export interface MessageAttachment {
  id: string;
  url: string;
  thumbnail?: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface MessageBE {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: ParticipantType;
  content: string;
  attachments: MessageAttachment[];
  readBy: Record<string, FirebaseTimestamp>;
  isDeleted: boolean;
  createdAt: FirebaseTimestamp;
}

export interface CreateConversationInput {
  type: ConversationType;
  recipientId: string;
  recipientType: ParticipantType;
  subject?: string;
  message: string;
  context?: ConversationContext;
  attachments?: File[];
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  attachments?: File[];
}
