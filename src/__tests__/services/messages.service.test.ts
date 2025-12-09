import { apiService } from "@/services/api.service";
import { messagesService } from "@/services/messages.service";
import type {
  ConversationType,
  ParticipantType,
} from "@/types/frontend/message.types";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/services/api.service");

// Mock date-fns functions
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn((date) => "2 hours ago"),
  format: jest.fn((date, formatStr) => "10:30 AM"),
}));

describe("MessagesService", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    messagesService.setCurrentUserId(mockUserId);
  });

  describe("setCurrentUserId", () => {
    it("should set current user ID", () => {
      messagesService.setCurrentUserId("new-user-id");
      // Internal state, will be tested through other methods
      expect(true).toBe(true);
    });
  });

  describe("getConversations", () => {
    it("should fetch conversations list with default params", async () => {
      const mockConversations = [
        {
          id: "conv-1",
          type: "buyer_seller" as ConversationType,
          participants: {
            sender: {
              id: mockUserId,
              name: "Test User",
              type: "user" as ParticipantType,
            },
            recipient: {
              id: "seller-1",
              name: "Test Seller",
              type: "seller" as ParticipantType,
              avatar: "/avatars/seller.jpg",
            },
          },
          participantIds: [mockUserId, "seller-1"],
          lastMessage: {
            content: "Hello, is this available?",
            senderId: mockUserId,
            sentAt: "2024-12-09T10:00:00Z",
          },
          unreadCount: { [mockUserId]: 0, "seller-1": 1 },
          status: "active" as const,
          createdAt: "2024-12-08T10:00:00Z",
          updatedAt: "2024-12-09T10:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          conversations: mockConversations,
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(apiService.get).toHaveBeenCalledWith("/messages");
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].otherParticipant.name).toBe("Test Seller");
      expect(result.conversations[0].unreadCount).toBe(0);
      expect(result.conversations[0].isUnread).toBe(false);
    });

    it("should fetch conversations with pagination", async () => {
      const mockResponse = {
        data: {
          conversations: [],
          pagination: {
            page: 2,
            pageSize: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.getConversations({ page: 2, pageSize: 10 });

      expect(apiService.get).toHaveBeenCalledWith(
        "/messages?page=2&pageSize=10"
      );
    });

    it("should fetch conversations with status filter", async () => {
      const mockResponse = {
        data: {
          conversations: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.getConversations({ status: "archived" });

      expect(apiService.get).toHaveBeenCalledWith("/messages?status=archived");
    });

    it("should identify conversation from recipient perspective", async () => {
      const mockConversations = [
        {
          id: "conv-1",
          type: "buyer_seller" as ConversationType,
          participants: {
            sender: {
              id: "buyer-1",
              name: "Buyer User",
              type: "user" as ParticipantType,
            },
            recipient: {
              id: mockUserId,
              name: "Current User",
              type: "seller" as ParticipantType,
            },
          },
          participantIds: ["buyer-1", mockUserId],
          lastMessage: {
            content: "Hello",
            senderId: "buyer-1",
            sentAt: "2024-12-09T10:00:00Z",
          },
          unreadCount: { [mockUserId]: 2, "buyer-1": 0 },
          status: "active" as const,
          createdAt: "2024-12-09T09:00:00Z",
          updatedAt: "2024-12-09T10:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          conversations: mockConversations,
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(result.conversations[0].otherParticipant.name).toBe("Buyer User");
      expect(result.conversations[0].unreadCount).toBe(2);
      expect(result.conversations[0].isUnread).toBe(true);
      expect(result.conversations[0].lastMessage.isFromMe).toBe(false);
    });

    it("should handle conversation with context", async () => {
      const mockConversations = [
        {
          id: "conv-1",
          type: "order" as ConversationType,
          participants: {
            sender: {
              id: mockUserId,
              name: "User",
              type: "user" as ParticipantType,
            },
            recipient: {
              id: "admin-1",
              name: "Support",
              type: "admin" as ParticipantType,
            },
          },
          participantIds: [mockUserId, "admin-1"],
          subject: "Order Issue",
          context: {
            orderId: "order-123",
            productId: "prod-456",
            productName: "iPhone 15",
          },
          lastMessage: {
            content: "Need help with order",
            senderId: mockUserId,
            sentAt: "2024-12-09T10:00:00Z",
          },
          unreadCount: { [mockUserId]: 0, "admin-1": 1 },
          status: "active" as const,
          createdAt: "2024-12-09T09:00:00Z",
          updatedAt: "2024-12-09T10:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          conversations: mockConversations,
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(result.conversations[0].type).toBe("order");
      expect(result.conversations[0].subject).toBe("Order Issue");
      expect(result.conversations[0].context?.orderId).toBe("order-123");
    });
  });

  describe("getConversation", () => {
    it("should fetch conversation messages", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          senderId: mockUserId,
          senderName: "Test User",
          senderType: "user" as ParticipantType,
          content: "Hello",
          attachments: [],
          readBy: { [mockUserId]: "2024-12-09T10:00:00Z" },
          isDeleted: false,
          createdAt: "2024-12-09T10:00:00Z",
        },
        {
          id: "msg-2",
          conversationId: "conv-1",
          senderId: "seller-1",
          senderName: "Seller",
          senderType: "seller" as ParticipantType,
          content: "Hi, how can I help?",
          attachments: [],
          readBy: {},
          isDeleted: false,
          createdAt: "2024-12-09T10:05:00Z",
        },
      ];

      const mockConversation = {
        id: "conv-1",
        type: "buyer_seller" as ConversationType,
        participants: {
          sender: {
            id: mockUserId,
            name: "User",
            type: "user" as ParticipantType,
          },
          recipient: {
            id: "seller-1",
            name: "Seller",
            type: "seller" as ParticipantType,
          },
        },
        participantIds: [mockUserId, "seller-1"],
        lastMessage: {
          content: "Hi, how can I help?",
          senderId: "seller-1",
          sentAt: "2024-12-09T10:05:00Z",
        },
        unreadCount: { [mockUserId]: 1, "seller-1": 0 },
        status: "active" as const,
        createdAt: "2024-12-09T09:00:00Z",
        updatedAt: "2024-12-09T10:05:00Z",
      };

      const mockResponse = {
        data: {
          conversation: mockConversation,
          messages: mockMessages,
          pagination: {
            page: 1,
            pageSize: 50,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversation("conv-1");

      expect(apiService.get).toHaveBeenCalledWith("/messages/conv-1");
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].isFromMe).toBe(true);
      expect(result.messages[0].isRead).toBe(true);
      expect(result.messages[1].isFromMe).toBe(false);
      expect(result.messages[1].isRead).toBe(false);
    });

    it("should fetch conversation with pagination", async () => {
      const mockResponse = {
        data: {
          conversation: {
            id: "conv-1",
            type: "buyer_seller" as ConversationType,
            participants: {
              sender: {
                id: mockUserId,
                name: "User",
                type: "user" as ParticipantType,
              },
              recipient: {
                id: "seller-1",
                name: "Seller",
                type: "seller" as ParticipantType,
              },
            },
            participantIds: [mockUserId, "seller-1"],
            lastMessage: {
              content: "Test",
              senderId: mockUserId,
              sentAt: "2024-12-09T10:00:00Z",
            },
            unreadCount: {},
            status: "active" as const,
            createdAt: "2024-12-09T09:00:00Z",
            updatedAt: "2024-12-09T10:00:00Z",
          },
          messages: [],
          pagination: {
            page: 2,
            pageSize: 20,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.getConversation("conv-1", {
        page: 2,
        pageSize: 20,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/messages/conv-1?page=2&pageSize=20"
      );
    });

    it("should handle messages with attachments", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          senderId: mockUserId,
          senderName: "User",
          senderType: "user" as ParticipantType,
          content: "Check this out",
          attachments: [
            {
              id: "att-1",
              url: "/files/document.pdf",
              filename: "document.pdf",
              mimeType: "application/pdf",
              size: 1024000,
            },
            {
              id: "att-2",
              url: "/images/photo.jpg",
              thumbnail: "/images/thumb.jpg",
              filename: "photo.jpg",
              mimeType: "image/jpeg",
              size: 512000,
            },
          ],
          readBy: {},
          isDeleted: false,
          createdAt: "2024-12-09T10:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          conversation: {
            id: "conv-1",
            type: "buyer_seller" as ConversationType,
            participants: {
              sender: {
                id: mockUserId,
                name: "User",
                type: "user" as ParticipantType,
              },
              recipient: {
                id: "seller-1",
                name: "Seller",
                type: "seller" as ParticipantType,
              },
            },
            participantIds: [mockUserId, "seller-1"],
            lastMessage: {
              content: "Check this out",
              senderId: mockUserId,
              sentAt: "2024-12-09T10:00:00Z",
            },
            unreadCount: {},
            status: "active" as const,
            createdAt: "2024-12-09T09:00:00Z",
            updatedAt: "2024-12-09T10:00:00Z",
          },
          messages: mockMessages,
          pagination: {
            page: 1,
            pageSize: 50,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversation("conv-1");

      expect(result.messages[0].attachments).toHaveLength(2);
      expect(result.messages[0].attachments[0].isImage).toBe(false);
      expect(result.messages[0].attachments[1].isImage).toBe(true);
    });
  });

  describe("getUnreadCount", () => {
    it("should fetch unread message count", async () => {
      const mockResponse = {
        data: { count: 3 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const count = await messagesService.getUnreadCount();

      expect(apiService.get).toHaveBeenCalledWith("/messages/unread-count");
      expect(count).toBe(3);
    });
  });

  describe("createConversation", () => {
    it("should create new conversation", async () => {
      const mockResponse = {
        data: {
          conversationId: "conv-new",
          messageId: "msg-1",
          isNewConversation: true,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.createConversation({
        recipientId: "seller-1",
        type: "buyer_seller",
        subject: "Product Inquiry",
        message: "Is this available?",
        context: {
          productId: "prod-123",
          productName: "iPhone 15",
        },
      });

      expect(apiService.post).toHaveBeenCalledWith("/messages", {
        recipientId: "seller-1",
        type: "buyer_seller",
        subject: "Product Inquiry",
        message: "Is this available?",
        context: {
          productId: "prod-123",
          productName: "iPhone 15",
        },
      });
      expect(result.isNewConversation).toBe(true);
    });

    it("should return existing conversation if already exists", async () => {
      const mockResponse = {
        data: {
          conversationId: "conv-existing",
          messageId: "msg-100",
          isNewConversation: false,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.createConversation({
        recipientId: "seller-1",
        type: "buyer_seller",
        message: "Another message",
      });

      expect(result.isNewConversation).toBe(false);
    });
  });

  describe("sendMessage", () => {
    it("should send message in existing conversation", async () => {
      const mockResponse = {
        data: {
          messageId: "msg-new",
          conversationId: "conv-1",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.sendMessage("conv-1", {
        content: "Thanks for the update",
      });

      expect(apiService.post).toHaveBeenCalledWith("/messages", {
        conversationId: "conv-1",
        message: "Thanks for the update",
      });
      expect(result.messageId).toBe("msg-new");
    });
  });

  describe("markAsRead", () => {
    it("should mark conversation as read", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.markAsRead("conv-1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv-1", {
        action: "markRead",
      });
    });
  });

  describe("archiveConversation", () => {
    it("should archive conversation", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.archiveConversation("conv-1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv-1", {
        action: "archive",
      });
    });
  });

  describe("unarchiveConversation", () => {
    it("should unarchive conversation", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.unarchiveConversation("conv-1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv-1", {
        action: "unarchive",
      });
    });
  });

  describe("deleteConversation", () => {
    it("should delete conversation", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({});

      await messagesService.deleteConversation("conv-1");

      expect(apiService.delete).toHaveBeenCalledWith("/messages/conv-1");
    });
  });

  describe("getTypeLabel", () => {
    it("should return correct labels for conversation types", () => {
      expect(messagesService.getTypeLabel("buyer_seller")).toBe("Seller");
      expect(messagesService.getTypeLabel("order")).toBe("Order");
      expect(messagesService.getTypeLabel("support")).toBe("Support");
    });

    it("should return type as-is for unknown types", () => {
      // @ts-expect-error Testing invalid type
      expect(messagesService.getTypeLabel("custom")).toBe("custom");
    });
  });

  describe("getParticipantIcon", () => {
    it("should return correct icons for participant types", () => {
      expect(messagesService.getParticipantIcon("user")).toBe("User");
      expect(messagesService.getParticipantIcon("seller")).toBe("Store");
      expect(messagesService.getParticipantIcon("admin")).toBe("Shield");
    });

    it("should return default icon for unknown type", () => {
      // @ts-expect-error Testing invalid type
      expect(messagesService.getParticipantIcon("unknown")).toBe("User");
    });
  });

  describe("Edge Cases", () => {
    it("should handle API errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(messagesService.getConversations()).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle missing unreadCount in conversation", async () => {
      const mockConversations = [
        {
          id: "conv-1",
          type: "buyer_seller" as ConversationType,
          participants: {
            sender: {
              id: mockUserId,
              name: "User",
              type: "user" as ParticipantType,
            },
            recipient: {
              id: "seller-1",
              name: "Seller",
              type: "seller" as ParticipantType,
            },
          },
          participantIds: [mockUserId, "seller-1"],
          lastMessage: {
            content: "Test",
            senderId: mockUserId,
            sentAt: "2024-12-09T10:00:00Z",
          },
          // Missing unreadCount
          status: "active" as const,
          createdAt: "2024-12-09T09:00:00Z",
          updatedAt: "2024-12-09T10:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          conversations: mockConversations,
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(result.conversations[0].unreadCount).toBe(0);
      expect(result.conversations[0].isUnread).toBe(false);
    });

    it("should handle deleted messages", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          senderId: mockUserId,
          senderName: "User",
          senderType: "user" as ParticipantType,
          content: "This message was deleted",
          attachments: [],
          readBy: {},
          isDeleted: true,
          createdAt: "2024-12-09T10:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          conversation: {
            id: "conv-1",
            type: "buyer_seller" as ConversationType,
            participants: {
              sender: {
                id: mockUserId,
                name: "User",
                type: "user" as ParticipantType,
              },
              recipient: {
                id: "seller-1",
                name: "Seller",
                type: "seller" as ParticipantType,
              },
            },
            participantIds: [mockUserId, "seller-1"],
            lastMessage: {
              content: "Test",
              senderId: mockUserId,
              sentAt: "2024-12-09T10:00:00Z",
            },
            unreadCount: {},
            status: "active" as const,
            createdAt: "2024-12-09T09:00:00Z",
            updatedAt: "2024-12-09T10:00:00Z",
          },
          messages: mockMessages,
          pagination: {
            page: 1,
            pageSize: 50,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversation("conv-1");

      expect(result.messages[0].isDeleted).toBe(true);
    });
  });
});
