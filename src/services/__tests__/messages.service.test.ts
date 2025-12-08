import { format, formatDistanceToNow } from "date-fns";
import { apiService } from "../api.service";
import { messagesService } from "../messages.service";

jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(),
  format: jest.fn(),
}));

describe("MessagesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (formatDistanceToNow as jest.Mock).mockReturnValue("2 hours ago");
    (format as jest.Mock).mockReturnValue("10:30 AM");
    messagesService.setCurrentUserId("user123");
  });

  describe("getConversations", () => {
    it("should fetch and transform conversations", async () => {
      const mockResponse = {
        data: {
          conversations: [
            {
              id: "conv_1",
              type: "buyer_seller" as const,
              participants: {
                sender: {
                  id: "user123",
                  name: "John Doe",
                  type: "user" as const,
                  avatar: "/avatar1.jpg",
                },
                recipient: {
                  id: "seller456",
                  name: "Jane Seller",
                  type: "seller" as const,
                  avatar: "/avatar2.jpg",
                },
              },
              participantIds: ["user123", "seller456"],
              subject: "Product Inquiry",
              lastMessage: {
                content: "Is this available?",
                senderId: "user123",
                sentAt: "2024-12-08T08:00:00Z",
              },
              unreadCount: {
                user123: 0,
                seller456: 1,
              },
              status: "active" as const,
              createdAt: "2024-12-08T08:00:00Z",
              updatedAt: "2024-12-08T08:00:00Z",
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(apiService.get).toHaveBeenCalledWith("/messages");
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].id).toBe("conv_1");
      expect(result.conversations[0].otherParticipant.id).toBe("seller456");
      expect(result.conversations[0].otherParticipant.name).toBe("Jane Seller");
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
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.getConversations({ page: 2, pageSize: 10 });

      expect(apiService.get).toHaveBeenCalledWith(
        "/messages?page=2&pageSize=10"
      );
    });

    it("should filter by status", async () => {
      const mockResponse = {
        data: {
          conversations: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.getConversations({ status: "archived" });

      expect(apiService.get).toHaveBeenCalledWith("/messages?status=archived");
    });

    it("should transform conversation with sender as current user", async () => {
      const mockResponse = {
        data: {
          conversations: [
            {
              id: "conv_2",
              type: "buyer_seller" as const,
              participants: {
                sender: {
                  id: "user123",
                  name: "John Doe",
                  type: "user" as const,
                },
                recipient: {
                  id: "seller789",
                  name: "Bob Seller",
                  type: "seller" as const,
                },
              },
              participantIds: ["user123", "seller789"],
              lastMessage: {
                content: "Test message",
                senderId: "user123",
                sentAt: "2024-12-08T08:00:00Z",
              },
              unreadCount: {},
              status: "active" as const,
              createdAt: "2024-12-08T08:00:00Z",
              updatedAt: "2024-12-08T08:00:00Z",
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(result.conversations[0].otherParticipant.id).toBe("seller789");
      expect(result.conversations[0].lastMessage.isFromMe).toBe(true);
    });

    it("should transform conversation with recipient as current user", async () => {
      const mockResponse = {
        data: {
          conversations: [
            {
              id: "conv_3",
              type: "buyer_seller" as const,
              participants: {
                sender: {
                  id: "buyer999",
                  name: "Alice Buyer",
                  type: "user" as const,
                },
                recipient: {
                  id: "user123",
                  name: "John Doe",
                  type: "seller" as const,
                },
              },
              participantIds: ["buyer999", "user123"],
              lastMessage: {
                content: "Test message",
                senderId: "buyer999",
                sentAt: "2024-12-08T08:00:00Z",
              },
              unreadCount: {
                user123: 2,
              },
              status: "active" as const,
              createdAt: "2024-12-08T08:00:00Z",
              updatedAt: "2024-12-08T08:00:00Z",
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversations();

      expect(result.conversations[0].otherParticipant.id).toBe("buyer999");
      expect(result.conversations[0].unreadCount).toBe(2);
      expect(result.conversations[0].isUnread).toBe(true);
    });
  });

  describe("getConversation", () => {
    it("should fetch conversation messages", async () => {
      const mockResponse = {
        data: {
          conversation: {
            id: "conv_1",
            type: "buyer_seller" as const,
            participants: {
              sender: {
                id: "user123",
                name: "John Doe",
                type: "user" as const,
              },
              recipient: {
                id: "seller456",
                name: "Jane Seller",
                type: "seller" as const,
              },
            },
            participantIds: ["user123", "seller456"],
            lastMessage: {
              content: "Latest message",
              senderId: "user123",
              sentAt: "2024-12-08T08:00:00Z",
            },
            unreadCount: {},
            status: "active" as const,
            createdAt: "2024-12-08T08:00:00Z",
            updatedAt: "2024-12-08T08:00:00Z",
          },
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              senderId: "user123",
              senderName: "John Doe",
              senderType: "user" as const,
              content: "Hello",
              attachments: [],
              readBy: {
                seller456: "2024-12-08T08:05:00Z",
              },
              isDeleted: false,
              createdAt: "2024-12-08T08:00:00Z",
            },
            {
              id: "msg_2",
              conversationId: "conv_1",
              senderId: "seller456",
              senderName: "Jane Seller",
              senderType: "seller" as const,
              content: "Hi there!",
              attachments: [
                {
                  id: "att_1",
                  url: "/image.jpg",
                  filename: "image.jpg",
                  mimeType: "image/jpeg",
                  size: 12345,
                },
              ],
              readBy: {},
              isDeleted: false,
              createdAt: "2024-12-08T08:02:00Z",
            },
          ],
          pagination: {
            page: 1,
            pageSize: 50,
            total: 2,
            totalPages: 1,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversation("conv_1");

      expect(apiService.get).toHaveBeenCalledWith("/messages/conv_1");
      expect(result.conversation.id).toBe("conv_1");
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].isFromMe).toBe(true);
      expect(result.messages[0].isRead).toBe(true);
      expect(result.messages[1].isFromMe).toBe(false);
      expect(result.messages[1].isRead).toBe(false);
      expect(result.messages[1].attachments[0].isImage).toBe(true);
    });

    it("should fetch conversation messages with pagination", async () => {
      const mockResponse = {
        data: {
          conversation: {
            id: "conv_1",
            type: "buyer_seller" as const,
            participants: {
              sender: {
                id: "user123",
                name: "John",
                type: "user" as const,
              },
              recipient: {
                id: "seller456",
                name: "Jane",
                type: "seller" as const,
              },
            },
            participantIds: ["user123", "seller456"],
            lastMessage: {
              content: "Test",
              senderId: "user123",
              sentAt: "2024-12-08T08:00:00Z",
            },
            unreadCount: {},
            status: "active" as const,
            createdAt: "2024-12-08T08:00:00Z",
            updatedAt: "2024-12-08T08:00:00Z",
          },
          messages: [],
          pagination: {
            page: 2,
            pageSize: 20,
            total: 50,
            totalPages: 3,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.getConversation("conv_1", {
        page: 2,
        pageSize: 20,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/messages/conv_1?page=2&pageSize=20"
      );
    });

    it("should mark message as read for sender", async () => {
      const mockResponse = {
        data: {
          conversation: {
            id: "conv_1",
            type: "buyer_seller" as const,
            participants: {
              sender: {
                id: "user123",
                name: "John",
                type: "user" as const,
              },
              recipient: {
                id: "seller456",
                name: "Jane",
                type: "seller" as const,
              },
            },
            participantIds: ["user123", "seller456"],
            lastMessage: {
              content: "Test",
              senderId: "user123",
              sentAt: "2024-12-08T08:00:00Z",
            },
            unreadCount: {},
            status: "active" as const,
            createdAt: "2024-12-08T08:00:00Z",
            updatedAt: "2024-12-08T08:00:00Z",
          },
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              senderId: "user123",
              senderName: "John",
              senderType: "user" as const,
              content: "My message",
              attachments: [],
              readBy: {},
              isDeleted: false,
              createdAt: "2024-12-08T08:00:00Z",
            },
          ],
          pagination: {
            page: 1,
            pageSize: 50,
            total: 1,
            totalPages: 1,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.getConversation("conv_1");

      expect(result.messages[0].isFromMe).toBe(true);
      expect(result.messages[0].isRead).toBe(true);
    });
  });

  describe("getUnreadCount", () => {
    it("should fetch unread count", async () => {
      const mockResponse = {
        data: {
          count: 5,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const count = await messagesService.getUnreadCount();

      expect(apiService.get).toHaveBeenCalledWith("/messages/unread-count");
      expect(count).toBe(5);
    });

    it("should handle zero unread messages", async () => {
      const mockResponse = {
        data: {
          count: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const count = await messagesService.getUnreadCount();

      expect(count).toBe(0);
    });
  });

  describe("createConversation", () => {
    it("should create new conversation", async () => {
      const mockResponse = {
        data: {
          conversationId: "conv_new",
          messageId: "msg_1",
          isNewConversation: true,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.createConversation({
        recipientId: "seller456",
        type: "buyer_seller",
        subject: "Product Question",
        message: "Is this in stock?",
        context: {
          productId: "prod_123",
        },
      });

      expect(apiService.post).toHaveBeenCalledWith("/messages", {
        recipientId: "seller456",
        type: "buyer_seller",
        subject: "Product Question",
        message: "Is this in stock?",
        context: {
          productId: "prod_123",
        },
      });
      expect(result.conversationId).toBe("conv_new");
      expect(result.isNewConversation).toBe(true);
    });

    it("should reuse existing conversation", async () => {
      const mockResponse = {
        data: {
          conversationId: "conv_existing",
          messageId: "msg_2",
          isNewConversation: false,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.createConversation({
        recipientId: "seller456",
        type: "order",
        message: "Follow-up question",
        context: {
          orderId: "ord_123",
        },
      });

      expect(result.isNewConversation).toBe(false);
    });
  });

  describe("sendMessage", () => {
    it("should send message in existing conversation", async () => {
      const mockResponse = {
        data: {
          messageId: "msg_new",
          conversationId: "conv_1",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messagesService.sendMessage("conv_1", {
        content: "New message",
      });

      expect(apiService.post).toHaveBeenCalledWith("/messages", {
        conversationId: "conv_1",
        message: "New message",
      });
      expect(result.messageId).toBe("msg_new");
    });

    it("should send message with attachments", async () => {
      const mockResponse = {
        data: {
          messageId: "msg_att",
          conversationId: "conv_1",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await messagesService.sendMessage("conv_1", {
        content: "Check this out",
      });

      expect(apiService.post).toHaveBeenCalledWith("/messages", {
        conversationId: "conv_1",
        message: "Check this out",
      });
    });
  });

  describe("markAsRead", () => {
    it("should mark conversation as read", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.markAsRead("conv_1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv_1", {
        action: "markRead",
      });
    });

    it("should handle errors", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(messagesService.markAsRead("conv_1")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("archiveConversation", () => {
    it("should archive conversation", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.archiveConversation("conv_1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv_1", {
        action: "archive",
      });
    });
  });

  describe("unarchiveConversation", () => {
    it("should unarchive conversation", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({});

      await messagesService.unarchiveConversation("conv_1");

      expect(apiService.patch).toHaveBeenCalledWith("/messages/conv_1", {
        action: "unarchive",
      });
    });
  });

  describe("deleteConversation", () => {
    it("should delete conversation", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({});

      await messagesService.deleteConversation("conv_1");

      expect(apiService.delete).toHaveBeenCalledWith("/messages/conv_1");
    });

    it("should handle errors", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(
        messagesService.deleteConversation("conv_1")
      ).rejects.toThrow("Delete failed");
    });
  });

  describe("getTypeLabel", () => {
    it("should return label for buyer_seller", () => {
      expect(messagesService.getTypeLabel("buyer_seller")).toBe("Seller");
    });

    it("should return label for order", () => {
      expect(messagesService.getTypeLabel("order")).toBe("Order");
    });

    it("should return label for support", () => {
      expect(messagesService.getTypeLabel("support")).toBe("Support");
    });

    it("should return type for unknown", () => {
      expect(messagesService.getTypeLabel("unknown" as any)).toBe("unknown");
    });
  });

  describe("getParticipantIcon", () => {
    it("should return icon for user", () => {
      expect(messagesService.getParticipantIcon("user")).toBe("User");
    });

    it("should return icon for seller", () => {
      expect(messagesService.getParticipantIcon("seller")).toBe("Store");
    });

    it("should return icon for admin", () => {
      expect(messagesService.getParticipantIcon("admin")).toBe("Shield");
    });

    it("should return default icon for unknown", () => {
      expect(messagesService.getParticipantIcon("unknown" as any)).toBe("User");
    });
  });

  describe("setCurrentUserId", () => {
    it("should set current user ID", () => {
      messagesService.setCurrentUserId("new_user_456");

      expect(messagesService["currentUserId"]).toBe("new_user_456");
    });
  });
});
