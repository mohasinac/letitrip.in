/**
 * Comprehensive Messages Service Tests
 * Tests for message and conversation management with edge cases
 *
 * Covers:
 * - Conversation transformation with null/undefined handling
 * - Message transformation with read status edge cases
 * - Pagination and filtering
 * - Error handling and API failures
 * - BUG FIX #25: Optional chaining and nullish coalescing
 */

import {
  ConversationType,
  ParticipantType,
} from "@/types/frontend/message.types";
import { apiService } from "../api.service";
import { messagesService } from "../messages.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("MessagesService - Comprehensive Tests", () => {
  const mockUserId = "user123";
  const mockConversation = {
    id: "conv1",
    type: "buyer_seller" as ConversationType,
    participants: {
      sender: {
        id: "user123",
        name: "John Doe",
        type: "user" as ParticipantType,
        avatar: "/avatar.jpg",
      },
      recipient: {
        id: "seller456",
        name: "Jane Shop",
        type: "seller" as ParticipantType,
        avatar: "/shop.jpg",
      },
    },
    participantIds: ["user123", "seller456"],
    subject: "Product Inquiry",
    context: {
      productId: "prod1",
      productName: "Test Product",
      shopId: "shop1",
      shopName: "Test Shop",
    },
    lastMessage: {
      content: "Hello there",
      senderId: "user123",
      sentAt: new Date().toISOString(),
    },
    unreadCount: {
      user123: 0,
      seller456: 5,
    },
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    messagesService.setCurrentUserId(mockUserId);
  });

  describe("BUG FIX #25: Null/Undefined Handling in Transformations", () => {
    it("should handle undefined unreadCount gracefully", async () => {
      const convWithoutUnread = {
        ...mockConversation,
        unreadCount: undefined,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWithoutUnread],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].unreadCount).toBe(0);
      expect(result.conversations[0].isUnread).toBe(false);
    });

    it("should handle null unreadCount gracefully", async () => {
      const convWithNullUnread = {
        ...mockConversation,
        unreadCount: null,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWithNullUnread],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].unreadCount).toBe(0);
      expect(result.conversations[0].isUnread).toBe(false);
    });

    it("should handle empty unreadCount object", async () => {
      const convWithEmptyUnread = {
        ...mockConversation,
        unreadCount: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWithEmptyUnread],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].unreadCount).toBe(0);
      expect(result.conversations[0].isUnread).toBe(false);
    });

    it("should handle unreadCount with missing userId key", async () => {
      const convWithOtherUserUnread = {
        ...mockConversation,
        unreadCount: {
          someOtherUser: 10,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWithOtherUserUnread],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].unreadCount).toBe(0);
      expect(result.conversations[0].isUnread).toBe(false);
    });

    it("should correctly identify unread conversations", async () => {
      const convWithUnread = {
        ...mockConversation,
        unreadCount: {
          user123: 3,
          seller456: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWithUnread],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].unreadCount).toBe(3);
      expect(result.conversations[0].isUnread).toBe(true);
    });
  });

  describe("Message Read Status - BUG FIX #25", () => {
    const mockMessage = {
      id: "msg1",
      conversationId: "conv1",
      senderId: "seller456",
      senderName: "Jane Shop",
      senderType: "seller" as ParticipantType,
      content: "Thank you for your inquiry",
      attachments: [],
      readBy: {
        user123: new Date().toISOString(),
        seller456: new Date().toISOString(),
      },
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    it("should handle undefined readBy gracefully", async () => {
      const msgWithoutReadBy = {
        ...mockMessage,
        readBy: undefined,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [msgWithoutReadBy],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].isRead).toBe(false);
      expect(result.messages[0].isFromMe).toBe(false);
    });

    it("should handle null readBy gracefully", async () => {
      const msgWithNullReadBy = {
        ...mockMessage,
        readBy: null,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [msgWithNullReadBy],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].isRead).toBe(false);
    });

    it("should handle empty readBy object", async () => {
      const msgWithEmptyReadBy = {
        ...mockMessage,
        readBy: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [msgWithEmptyReadBy],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].isRead).toBe(false);
    });

    it("should mark own messages as read automatically", async () => {
      const ownMessage = {
        ...mockMessage,
        senderId: mockUserId,
        readBy: {}, // Even without explicit read status
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [ownMessage],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].isRead).toBe(true);
      expect(result.messages[0].isFromMe).toBe(true);
    });

    it("should correctly identify read messages", async () => {
      const readMessage = {
        ...mockMessage,
        readBy: {
          user123: new Date().toISOString(),
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [readMessage],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].isRead).toBe(true);
    });

    it("should correctly identify unread messages", async () => {
      const unreadMessage = {
        ...mockMessage,
        readBy: {
          seller456: new Date().toISOString(), // Only sender has read
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [unreadMessage],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].isRead).toBe(false);
    });
  });

  describe("Conversation Transformation", () => {
    it("should identify other participant correctly when user is sender", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [mockConversation],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].otherParticipant.id).toBe("seller456");
      expect(result.conversations[0].otherParticipant.name).toBe("Jane Shop");
      expect(result.conversations[0].otherParticipant.type).toBe("seller");
    });

    it("should identify other participant correctly when user is recipient", async () => {
      const convWhereUserIsRecipient = {
        ...mockConversation,
        participants: {
          sender: {
            id: "seller456",
            name: "Jane Shop",
            type: "seller" as ParticipantType,
          },
          recipient: {
            id: "user123",
            name: "John Doe",
            type: "user" as ParticipantType,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWhereUserIsRecipient],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].otherParticipant.id).toBe("seller456");
      expect(result.conversations[0].otherParticipant.name).toBe("Jane Shop");
    });

    it("should correctly identify if last message is from me", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [mockConversation],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].lastMessage.isFromMe).toBe(true);
    });

    it("should include timeAgo for last message", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [mockConversation],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].timeAgo).toBeDefined();
      expect(typeof result.conversations[0].timeAgo).toBe("string");
      expect(result.conversations[0].timeAgo).toContain("ago");
    });

    it("should handle conversations with context", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [mockConversation],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].context).toBeDefined();
      expect(result.conversations[0].context?.productId).toBe("prod1");
      expect(result.conversations[0].context?.shopId).toBe("shop1");
    });

    it("should handle conversations without context", async () => {
      const convWithoutContext = {
        ...mockConversation,
        context: undefined,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [convWithoutContext],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversations();

      expect(result.conversations[0].context).toBeUndefined();
    });
  });

  describe("Message Attachments", () => {
    it("should correctly identify image attachments", async () => {
      const msgWithAttachments = {
        id: "msg1",
        conversationId: "conv1",
        senderId: "seller456",
        senderName: "Jane Shop",
        senderType: "seller" as ParticipantType,
        content: "Check this out",
        attachments: [
          {
            id: "att1",
            url: "/image.jpg",
            filename: "product.jpg",
            mimeType: "image/jpeg",
            size: 102400,
          },
          {
            id: "att2",
            url: "/doc.pdf",
            filename: "invoice.pdf",
            mimeType: "application/pdf",
            size: 51200,
          },
        ],
        readBy: {},
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [msgWithAttachments],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].attachments).toHaveLength(2);
      expect(result.messages[0].attachments[0].isImage).toBe(true);
      expect(result.messages[0].attachments[1].isImage).toBe(false);
    });

    it("should handle messages without attachments", async () => {
      const msgWithoutAttachments = {
        id: "msg1",
        conversationId: "conv1",
        senderId: "seller456",
        senderName: "Jane Shop",
        senderType: "seller" as ParticipantType,
        content: "Hello",
        attachments: [],
        readBy: {},
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [msgWithoutAttachments],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await messagesService.getConversation("conv1");

      expect(result.messages[0].attachments).toHaveLength(0);
    });
  });

  describe("Pagination", () => {
    it("should handle pagination parameters for conversations", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [mockConversation],
          pagination: {
            page: 2,
            pageSize: 10,
            total: 25,
            totalPages: 3,
          },
        },
      });

      const result = await messagesService.getConversations({
        page: 2,
        pageSize: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/messages?page=2&pageSize=10"
      );
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
    });

    it("should handle pagination parameters for messages", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversation: mockConversation,
          messages: [],
          pagination: {
            page: 1,
            pageSize: 50,
            total: 100,
            totalPages: 2,
          },
        },
      });

      await messagesService.getConversation("conv1", {
        page: 1,
        pageSize: 50,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/messages/conv1?page=1&pageSize=50"
      );
    });

    it("should handle default pagination", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        },
      });

      await messagesService.getConversations();

      expect(apiService.get).toHaveBeenCalledWith("/messages");
    });
  });

  describe("Filtering", () => {
    it("should filter by active status", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        },
      });

      await messagesService.getConversations({ status: "active" });

      expect(apiService.get).toHaveBeenCalledWith("/messages?status=active");
    });

    it("should filter by archived status", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        },
      });

      await messagesService.getConversations({ status: "archived" });

      expect(apiService.get).toHaveBeenCalledWith("/messages?status=archived");
    });

    it("should show all conversations", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        },
      });

      await messagesService.getConversations({ status: "all" });

      expect(apiService.get).toHaveBeenCalledWith("/messages?status=all");
    });
  });

  describe("Utility Methods", () => {
    it("should get correct type label for buyer_seller", () => {
      const label = messagesService.getTypeLabel("buyer_seller");
      expect(label).toBe("Seller");
    });

    it("should get correct type label for order", () => {
      const label = messagesService.getTypeLabel("order");
      expect(label).toBe("Order");
    });

    it("should get correct type label for support", () => {
      const label = messagesService.getTypeLabel("support");
      expect(label).toBe("Support");
    });

    it("should get correct icon for user participant", () => {
      const icon = messagesService.getParticipantIcon("user");
      expect(icon).toBe("User");
    });

    it("should get correct icon for seller participant", () => {
      const icon = messagesService.getParticipantIcon("seller");
      expect(icon).toBe("Store");
    });

    it("should get correct icon for admin participant", () => {
      const icon = messagesService.getParticipantIcon("admin");
      expect(icon).toBe("Shield");
    });
  });

  describe("Create and Send Operations", () => {
    it("should create new conversation", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        data: {
          conversationId: "newconv",
          messageId: "newmsg",
          isNewConversation: true,
        },
      });

      const result = await messagesService.createConversation({
        recipientId: "seller789",
        type: "buyer_seller",
        subject: "Product Question",
        message: "Is this available?",
        context: {
          productId: "prod2",
        },
      });

      expect(result.conversationId).toBe("newconv");
      expect(result.isNewConversation).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/messages",
        expect.any(Object)
      );
    });

    it("should send message in existing conversation", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        data: {
          messageId: "msg2",
          conversationId: "conv1",
        },
      });

      const result = await messagesService.sendMessage("conv1", {
        content: "Thank you!",
      });

      expect(result.messageId).toBe("msg2");
      expect(result.conversationId).toBe("conv1");
    });
  });

  describe("Conversation Actions", () => {
    it("should mark conversation as read", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.markAsRead("conv1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv1", {
        action: "markRead",
      });
    });

    it("should archive conversation", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.archiveConversation("conv1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv1", {
        action: "archive",
      });
    });

    it("should unarchive conversation", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.unarchiveConversation("conv1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv1", {
        action: "unarchive",
      });
    });

    it("should delete conversation", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({});

      await messagesService.deleteConversation("conv1");

      expect(apiService.delete).toHaveBeenCalledWith("/messages/conv1");
    });
  });

  describe("Unread Count", () => {
    it("should get unread message count", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: { count: 7 },
      });

      const count = await messagesService.getUnreadCount();

      expect(count).toBe(7);
      expect(apiService.get).toHaveBeenCalledWith("/messages/unread-count");
    });

    it("should handle zero unread messages", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: { count: 0 },
      });

      const count = await messagesService.getUnreadCount();

      expect(count).toBe(0);
    });
  });

  describe("User ID Management", () => {
    it("should allow setting current user ID", () => {
      messagesService.setCurrentUserId("newuser");
      // No error means successful
      expect(true).toBe(true);
    });

    it("should use empty string when user ID not set", async () => {
      const serviceWithoutUserId = new (messagesService.constructor as any)();

      (apiService.get as jest.Mock).mockResolvedValue({
        data: {
          conversations: [mockConversation],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });

      const result = await serviceWithoutUserId.getConversations();

      // Should still work, just with empty userId
      expect(result.conversations).toHaveLength(1);
    });
  });
});
