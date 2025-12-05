/**
 * @fileoverview Service Module
 * @module src/services/messages.service
 * @description This file contains service functions for messages operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Messages Service
 * Epic: E023 - Messaging System
 *
 * Frontend service for interacting with the messages API
 */

import { apiService } from "./api.service";
import {
  ConversationFE,
  MessageFE,
  ConversationListResponse,
  MessageListResponse,
  CreateConversationInputFE,
  SendMessageInputFE,
  ConversationType,
  ParticipantType,
} from "@/types/frontend/message.types";
import { formatDistanceToNow, format } from "date-fns";

/**
 * ConversationBEResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for ConversationBEResponse
 */
interface ConversationBEResponse {
  /** Id */
  id: string;
  /** Type */
  type: ConversationType;
  /** Participants */
  participants: {
    /** Sender */
    sender: {
      /** Id */
      id: string;
      /** Name */
      name: string;
      /** Type */
      type: ParticipantType;
      /** Avatar */
      avatar?: string;
    };
    /** Recipient */
    recipient: {
      /** Id */
      id: string;
      /** Name */
      name: string;
      /** Type */
      type: ParticipantType;
      /** Avatar */
      avatar?: string;
    };
  };
  /** Participant Ids */
  participantIds: string[];
  /** Subject */
  subject?: string;
  /** Context */
  context?: {
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
  };
  /** Last Message */
  lastMessage: {
    /** Content */
    content: string;
    /** Sender Id */
    senderId: string;
    /** Sent At */
    sentAt: string;
  };
  /** Unread Count */
  unreadCount: Record<string, number>;
  /** Status */
  status: "active" | "archived" | "resolved";
  /** Created At */
  createdAt: string;
  /** Updated At */
  updatedAt: string;
}

/**
 * MessageBEResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageBEResponse
 */
interface MessageBEResponse {
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
  attachments: Array<{
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
  }>;
  /** Read By */
  readBy: Record<string, string>;
  /** Is Deleted */
  isDeleted: boolean;
  /** Created At */
  createdAt: string;
}

/**
 * MessagesService class
 * 
 * @class
 * @description Description of MessagesService class functionality
 */
class MessagesService {
  private currentUserId: string | null = null;

  /**
   * Set current user ID for FE transformations
   */
  setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  /**
   * Transform BE conversation to FE format
   */
  private transformConversation(
    /** Conv */
    conv: ConversationBEResponse,
    /** User Id */
    userId: string,
  ): ConversationFE {
    const isFromSender = conv.participants.sender.id === userId;
    const otherParticipant = isFromSender
      ? conv.participants.recipient
      : conv.participants.sender;
    const unreadCount = conv.unreadCount?.[userId] || 0;

    return {
      /** Id */
      id: conv.id,
      /** Type */
      type: conv.type,
      /** Other Participant */
      otherParticipant: {
        /** Id */
        id: otherParticipant.id,
        /** Name */
        name: otherParticipant.name,
        /** Type */
        type: otherParticipant.type,
        /** Avatar */
        avatar: otherParticipant.avatar,
      },
      /** Subject */
      subject: conv.subject,
      /** Context */
      context: conv.context,
      /** Last Message */
      lastMessage: {
        /** Content */
        content: conv.lastMessage.content,
        /** Sender Id */
        senderId: conv.lastMessage.senderId,
        /** Sent At */
        sentAt: new Date(conv.lastMessage.sentAt),
        /** Is From Me */
        isFromMe: conv.lastMessage.senderId === userId,
      },
      unreadCount,
      /** Status */
      status: conv.status,
      /** Created At */
      createdAt: new Date(conv.createdAt),
      /** Updated At */
      updatedAt: new Date(conv.updatedAt),
      /** Time Ago */
      timeAgo: formatDistanceToNow(new Date(conv.lastMessage.sentAt), {
        /** Add Suffix */
        addSuffix: true,
      }),
      /** Is Unread */
      isUnread: unreadCount > 0,
    };
  }

  /**
   * Transform BE message to FE format
   */
  private transformMessage(msg: MessageBEResponse, userId: string): MessageFE {
    const createdAt = new Date(msg.createdAt);
    const isFromMe = msg.senderId === userId;
    const isRead = !!msg.readBy?.[userId] || isFromMe;

    return {
      /** Id */
      id: msg.id,
      /** Conversation Id */
      conversationId: msg.conversationId,
      /** Sender Id */
      senderId: msg.senderId,
      /** Sender Name */
      senderName: msg.senderName,
      /** Sender Type */
      senderType: msg.senderType,
      /** Content */
      content: msg.content,
      /** Attachments */
      attachments: msg.attachments.map((att) => ({
        ...att,
        /** Is Image */
        isImage: att.mimeType.startsWith("image/"),
      })),
      isRead,
      isFromMe,
      /** Is Deleted */
      isDeleted: msg.isDeleted,
      createdAt,
      /** Time Ago */
      timeAgo: formatDistanceToNow(createdAt, { addSuffix: true }),
      /** Formatted Time */
      formattedTime: format(createdAt, "h:mm a"),
    };
  }

  /**
   * Get list of conversations
   */
  async getConversations(
    /** Params */
    params: {
      /** Page */
      page?: number;
      /** Page Size */
      pageSize?: number;
      /** Status */
      status?: "active" | "archived" | "all";
    } = {},
  ): Promise<ConversationListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());
    if (params.status) searchParams.set("status", params.status);

    const queryString = searchParams.toString();
    const url = `/messages${queryString ? `?${queryString}` : ""}`;

    const response = await apiService.get<{
      /** Data */
      data: {
        /** Conversations */
        conversations: ConversationBEResponse[];
        /** Pagination */
        pagination: ConversationListResponse["pagination"];
      };
    }>(url);

    const userId = this.currentUserId || "";
    const conversations = response.data.conversations.map((c) =>
      this.transformConversation(c, userId),
    );

    return {
      conversations,
      /** Pagination */
      pagination: response.data.pagination,
    };
  }

  /**
   * Get messages in a conversation
   */
  async getConversation(
    /** Conversation Id */
    conversationId: string,
    /** Params */
    params: {
      /** Page */
      page?: number;
      /** Page Size */
      pageSize?: number;
    } = {},
  ): Promise<MessageListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    const queryString = searchParams.toString();
    const url = `/messages/${conversationId}${queryString ? `?${queryString}` : ""}`;

    const response = await apiService.get<{
      /** Data */
      data: {
        /** Conversation */
        conversation: ConversationBEResponse;
        /** Messages */
        messages: MessageBEResponse[];
        /** Pagination */
        pagination: MessageListResponse["pagination"];
      };
    }>(url);

    const userId = this.currentUserId || "";

    return {
      /** Conversation */
      conversation: this.transformConversation(
        response.data.conversation,
        userId,
      ),
      /** Messages */
      messages: response.data.messages.map((m) =>
        this.transformMessage(m, userId),
      ),
      /** Pagination */
      pagination: response.data.pagination,
    };
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ data: { count: number } }>(
      "/messages/unread-count",
    );
    return response.data.count;
  }

  /**
   * Start a new conversation
   */
  async createConversation(input: CreateConversationInputFE): Promise<{
    /** Conversation Id */
    conversationId: string;
    /** Message Id */
    messageId: string;
    /** Is New Conversation */
    isNewConversation: boolean;
  }> {
    const response = await apiService.post<{
      /** Data */
      data: {
        /** Conversation Id */
        conversationId: string;
        /** Message Id */
        messageId: string;
        /** Is New Conversation */
        isNewConversation: boolean;
      };
    }>("/messages", {
      /** Recipient Id */
      recipientId: input.recipientId,
      /** Type */
      type: input.type,
      /** Subject */
      subject: input.subject,
      /** Message */
      message: input.message,
      /** Context */
      context: input.context,
    });

    return response.data;
  }

  /**
   * Send message in existing conversation
   */
  async sendMessage(
    /** Conversation Id */
    conversationId: string,
    /** Input */
    input: SendMessageInputFE,
  ): Promise<{
    /** Message Id */
    messageId: string;
    /** Conversation Id */
    conversationId: string;
  }> {
    const response = await apiService.post<{
      /** Data */
      data: {
        /** Message Id */
        messageId: string;
        /** Conversation Id */
        conversationId: string;
      };
    }>("/messages", {
      conversationId,
      /** Message */
      message: input.content,
    });

    return response.data;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await apiService.patch(`/messages/${conversationId}`, {
      /** Action */
      action: "markRead",
    });
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await apiService.patch(`/messages/${conversationId}`, {
      /** Action */
      action: "archive",
    });
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(conversationId: string): Promise<void> {
    await apiService.patch(`/messages/${conversationId}`, {
      /** Action */
      action: "unarchive",
    });
  }

  /**
   * Delete (archive) conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiService.delete(`/messages/${conversationId}`);
  }

  /**
   * Get conversation type label
   */
  getTypeLabel(type: ConversationType): string {
    const labels: Record<ConversationType, string> = {
      buyer_seller: "Seller",
      /** Order */
      order: "Order",
      /** Support */
      support: "Support",
    };
    return labels[type] || type;
  }

  /**
   * Get participant type icon name
   */
  getParticipantIcon(type: ParticipantType): string {
    const icons: Record<ParticipantType, string> = {
      /** User */
      user: "User",
      /** Seller */
      seller: "Store",
      /** Admin */
      admin: "Shield",
    };
    return icons[type] || "User";
  }
}

export const messagesService = new MessagesService();
