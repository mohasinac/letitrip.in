/**
 * Messages Service
 * Epic: E023 - Messaging System
 *
 * Frontend service for interacting with the messages API
 */

import {
  ConversationFE,
  ConversationListResponse,
  ConversationType,
  CreateConversationInputFE,
  MessageFE,
  MessageListResponse,
  ParticipantType,
  SendMessageInputFE,
} from "@/types/frontend/message.types";
import { format, formatDistanceToNow } from "date-fns";
import { apiService } from "./api.service";

interface ConversationBEResponse {
  id: string;
  type: ConversationType;
  participants: {
    sender: {
      id: string;
      name: string;
      type: ParticipantType;
      avatar?: string;
    };
    recipient: {
      id: string;
      name: string;
      type: ParticipantType;
      avatar?: string;
    };
  };
  participantIds: string[];
  subject?: string;
  context?: {
    orderId?: string;
    productId?: string;
    productName?: string;
    shopId?: string;
    shopName?: string;
    auctionId?: string;
  };
  lastMessage: {
    content: string;
    senderId: string;
    sentAt: string;
  };
  unreadCount: Record<string, number>;
  status: "active" | "archived" | "resolved";
  createdAt: string;
  updatedAt: string;
}

interface MessageBEResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: ParticipantType;
  content: string;
  attachments: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
  readBy: Record<string, string>;
  isDeleted: boolean;
  createdAt: string;
}

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
    conv: ConversationBEResponse,
    userId: string
  ): ConversationFE {
    const isFromSender = conv.participants.sender.id === userId;
    const otherParticipant = isFromSender
      ? conv.participants.recipient
      : conv.participants.sender;
    // BUG FIX #25: Use nullish coalescing for safer default value
    const unreadCount = conv.unreadCount?.[userId] ?? 0;

    return {
      id: conv.id,
      type: conv.type,
      otherParticipant: {
        id: otherParticipant.id,
        name: otherParticipant.name,
        type: otherParticipant.type,
        avatar: otherParticipant.avatar,
      },
      subject: conv.subject,
      context: conv.context,
      lastMessage: {
        content: conv.lastMessage.content,
        senderId: conv.lastMessage.senderId,
        sentAt: new Date(conv.lastMessage.sentAt),
        isFromMe: conv.lastMessage.senderId === userId,
      },
      unreadCount,
      status: conv.status,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      timeAgo: formatDistanceToNow(new Date(conv.lastMessage.sentAt), {
        addSuffix: true,
      }),
      isUnread: unreadCount > 0,
    };
  }

  /**
   * Transform BE message to FE format
   */
  private transformMessage(msg: MessageBEResponse, userId: string): MessageFE {
    const createdAt = new Date(msg.createdAt);
    const isFromMe = msg.senderId === userId;
    // BUG FIX #25: More explicit null check for readBy status
    const isRead = msg.readBy?.[userId] != null || isFromMe;

    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderType: msg.senderType,
      content: msg.content,
      attachments: msg.attachments.map((att) => ({
        ...att,
        isImage: att.mimeType.startsWith("image/"),
      })),
      isRead,
      isFromMe,
      isDeleted: msg.isDeleted,
      createdAt,
      timeAgo: formatDistanceToNow(createdAt, { addSuffix: true }),
      formattedTime: format(createdAt, "h:mm a"),
    };
  }

  /**
   * Get list of conversations
   */
  async getConversations(
    params: {
      page?: number;
      pageSize?: number;
      status?: "active" | "archived" | "all";
    } = {}
  ): Promise<ConversationListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());
    if (params.status) searchParams.set("status", params.status);

    const queryString = searchParams.toString();
    const url = `/messages${queryString ? `?${queryString}` : ""}`;

    const response = await apiService.get<{
      data: {
        conversations: ConversationBEResponse[];
        pagination: ConversationListResponse["pagination"];
      };
    }>(url);

    const userId = this.currentUserId || "";
    const conversations = response.data.conversations.map((c) =>
      this.transformConversation(c, userId)
    );

    return {
      conversations,
      pagination: response.data.pagination,
    };
  }

  /**
   * Get messages in a conversation
   */
  async getConversation(
    conversationId: string,
    params: {
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<MessageListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    const queryString = searchParams.toString();
    const url = `/messages/${conversationId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiService.get<{
      data: {
        conversation: ConversationBEResponse;
        messages: MessageBEResponse[];
        pagination: MessageListResponse["pagination"];
      };
    }>(url);

    const userId = this.currentUserId || "";

    return {
      conversation: this.transformConversation(
        response.data.conversation,
        userId
      ),
      messages: response.data.messages.map((m) =>
        this.transformMessage(m, userId)
      ),
      pagination: response.data.pagination,
    };
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ data: { count: number } }>(
      "/messages/unread-count"
    );
    return response.data.count;
  }

  /**
   * Start a new conversation
   */
  async createConversation(input: CreateConversationInputFE): Promise<{
    conversationId: string;
    messageId: string;
    isNewConversation: boolean;
  }> {
    const response = await apiService.post<{
      data: {
        conversationId: string;
        messageId: string;
        isNewConversation: boolean;
      };
    }>("/messages", {
      recipientId: input.recipientId,
      type: input.type,
      subject: input.subject,
      message: input.message,
      context: input.context,
    });

    return response.data;
  }

  /**
   * Send message in existing conversation
   */
  async sendMessage(
    conversationId: string,
    input: SendMessageInputFE
  ): Promise<{
    messageId: string;
    conversationId: string;
  }> {
    const response = await apiService.post<{
      data: {
        messageId: string;
        conversationId: string;
      };
    }>("/messages", {
      conversationId,
      message: input.content,
    });

    return response.data;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await apiService.patch(`/messages/${conversationId}`, {
      action: "markRead",
    });
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await apiService.patch(`/messages/${conversationId}`, {
      action: "archive",
    });
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(conversationId: string): Promise<void> {
    await apiService.patch(`/messages/${conversationId}`, {
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
      order: "Order",
      support: "Support",
    };
    return labels[type] || type;
  }

  /**
   * Get participant type icon name
   */
  getParticipantIcon(type: ParticipantType): string {
    const icons: Record<ParticipantType, string> = {
      user: "User",
      seller: "Store",
      admin: "Shield",
    };
    return icons[type] || "User";
  }
}

export const messagesService = new MessagesService();
