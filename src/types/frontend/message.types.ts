/**
 * Message Frontend Types
 * Epic: E023 - Messaging System
 */

export type ConversationType = "buyer_seller" | "order" | "support";
export type ParticipantType = "user" | "seller" | "admin";
export type ConversationStatus = "active" | "archived" | "resolved";

export interface ConversationParticipantFE {
  id: string;
  name: string;
  type: ParticipantType;
  avatar?: string;
}

export interface ConversationContextFE {
  orderId?: string;
  productId?: string;
  productName?: string;
  shopId?: string;
  shopName?: string;
  auctionId?: string;
}

export interface ConversationFE {
  id: string;
  type: ConversationType;
  otherParticipant: ConversationParticipantFE;
  subject?: string;
  context?: ConversationContextFE;
  lastMessage: {
    content: string;
    senderId: string;
    sentAt: Date;
    isFromMe: boolean;
  };
  unreadCount: number;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  // UI helpers
  timeAgo: string;
  isUnread: boolean;
}

export interface MessageAttachmentFE {
  id: string;
  url: string;
  thumbnail?: string;
  filename: string;
  mimeType: string;
  size: number;
  isImage: boolean;
}

export interface MessageFE {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: ParticipantType;
  content: string;
  attachments: MessageAttachmentFE[];
  isRead: boolean;
  isFromMe: boolean;
  isDeleted: boolean;
  createdAt: Date;
  // UI helpers
  timeAgo: string;
  formattedTime: string;
}

export interface ConversationListResponse {
  conversations: ConversationFE[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MessageListResponse {
  messages: MessageFE[];
  conversation: ConversationFE;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateConversationInputFE {
  type: ConversationType;
  recipientId: string;
  recipientType?: ParticipantType;
  subject?: string;
  message: string;
  context?: ConversationContextFE;
}

export interface SendMessageInputFE {
  content: string;
  attachments?: File[];
}
