import { apiService } from "../api.service";
import { notificationService } from "../notification.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("gets list of notifications without params", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif1",
              userId: "user1",
              type: "order" as const,
              title: "Order Confirmed",
              message: "Your order has been confirmed",
              read: false,
              createdAt: "2024-01-15T10:00:00Z",
            },
            {
              id: "notif2",
              userId: "user1",
              type: "payment" as const,
              title: "Payment Successful",
              message: "Payment received",
              read: true,
              createdAt: "2024-01-14T10:00:00Z",
              readAt: "2024-01-14T11:00:00Z",
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.list();

      expect(apiService.get).toHaveBeenCalledWith("/notifications");
      expect(result.notifications).toHaveLength(2);
      expect(result.notifications[0].createdAt).toBeInstanceOf(Date);
      expect(result.pagination.total).toBe(2);
    });

    it("gets list with pagination params", async () => {
      const mockResponse = {
        data: {
          notifications: [],
          pagination: {
            page: 2,
            pageSize: 10,
            total: 15,
            totalPages: 2,
            hasNext: false,
            hasPrev: true,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await notificationService.list({ page: 2, pageSize: 10 });

      expect(apiService.get).toHaveBeenCalledWith(
        "/notifications?page=2&pageSize=10"
      );
    });

    it("gets only unread notifications", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif1",
              userId: "user1",
              type: "order" as const,
              title: "Order Confirmed",
              message: "Your order has been confirmed",
              read: false,
              createdAt: "2024-01-15T10:00:00Z",
            },
          ],
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

      const result = await notificationService.list({ unreadOnly: true });

      expect(apiService.get).toHaveBeenCalledWith(
        "/notifications?unreadOnly=true"
      );
      expect(result.notifications[0].read).toBe(false);
    });

    it("transforms dates correctly", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif1",
              userId: "user1",
              type: "message" as const,
              title: "New Message",
              message: "You have a new message",
              read: true,
              createdAt: "2024-01-15T10:00:00Z",
              readAt: "2024-01-15T11:00:00Z",
            },
          ],
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

      const result = await notificationService.list();

      expect(result.notifications[0].createdAt).toBeInstanceOf(Date);
      expect(result.notifications[0].readAt).toBeInstanceOf(Date);
    });

    it("handles notifications with metadata and link", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif1",
              userId: "user1",
              type: "auction" as const,
              title: "Auction Won",
              message: "Congratulations! You won the auction",
              read: false,
              link: "/auctions/auction1",
              metadata: { auctionId: "auction1", amount: 5000 },
              createdAt: "2024-01-15T10:00:00Z",
            },
          ],
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

      const result = await notificationService.list();

      expect(result.notifications[0].link).toBe("/auctions/auction1");
      expect(result.notifications[0].metadata).toEqual({
        auctionId: "auction1",
        amount: 5000,
      });
    });
  });

  describe("getUnreadCount", () => {
    it("gets unread notification count", async () => {
      const mockResponse = {
        data: { count: 5 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.getUnreadCount();

      expect(apiService.get).toHaveBeenCalledWith(
        "/notifications/unread-count"
      );
      expect(result).toBe(5);
    });

    it("returns zero when no unread notifications", async () => {
      const mockResponse = {
        data: { count: 0 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.getUnreadCount();

      expect(result).toBe(0);
    });
  });

  describe("markAsRead", () => {
    it("marks specific notifications as read", async () => {
      const mockResponse = {
        data: { marked: 2 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead(["notif1", "notif2"]);

      expect(apiService.patch).toHaveBeenCalledWith("/notifications", {
        notificationIds: ["notif1", "notif2"],
      });
      expect(result.marked).toBe(2);
    });

    it("marks single notification as read", async () => {
      const mockResponse = {
        data: { marked: 1 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead(["notif1"]);

      expect(result.marked).toBe(1);
    });

    it("handles empty array", async () => {
      const mockResponse = {
        data: { marked: 0 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead([]);

      expect(result.marked).toBe(0);
    });
  });

  describe("markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      const mockResponse = {
        data: { marked: 10 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAllAsRead();

      expect(apiService.patch).toHaveBeenCalledWith("/notifications", {
        markAll: true,
      });
      expect(result.marked).toBe(10);
    });

    it("returns zero when no unread notifications to mark", async () => {
      const mockResponse = {
        data: { marked: 0 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAllAsRead();

      expect(result.marked).toBe(0);
    });
  });

  describe("delete", () => {
    it("deletes a specific notification", async () => {
      const mockResponse = {
        data: { deleted: 1 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.delete("notif1");

      expect(apiService.delete).toHaveBeenCalledWith(
        "/notifications?id=notif1"
      );
      expect(result.deleted).toBe(1);
    });

    it("handles non-existent notification", async () => {
      const mockResponse = {
        data: { deleted: 0 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.delete("invalid");

      expect(result.deleted).toBe(0);
    });
  });

  describe("deleteRead", () => {
    it("deletes all read notifications", async () => {
      const mockResponse = {
        data: { deleted: 5 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteRead();

      expect(apiService.delete).toHaveBeenCalledWith(
        "/notifications?deleteRead=true"
      );
      expect(result.deleted).toBe(5);
    });

    it("returns zero when no read notifications to delete", async () => {
      const mockResponse = {
        data: { deleted: 0 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteRead();

      expect(result.deleted).toBe(0);
    });
  });

  describe("deleteAll", () => {
    it("deletes all notifications", async () => {
      const mockResponse = {
        data: { deleted: 15 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteAll();

      expect(apiService.delete).toHaveBeenCalledWith(
        "/notifications?deleteAll=true"
      );
      expect(result.deleted).toBe(15);
    });
  });

  describe("getTypeIcon", () => {
    it("returns correct icon for each notification type", () => {
      expect(notificationService.getTypeIcon("order")).toBe("Package");
      expect(notificationService.getTypeIcon("auction")).toBe("Gavel");
      expect(notificationService.getTypeIcon("bid")).toBe("TrendingUp");
      expect(notificationService.getTypeIcon("message")).toBe("MessageSquare");
      expect(notificationService.getTypeIcon("system")).toBe("Bell");
      expect(notificationService.getTypeIcon("payment")).toBe("CreditCard");
      expect(notificationService.getTypeIcon("shipping")).toBe("Truck");
      expect(notificationService.getTypeIcon("review")).toBe("Star");
    });

    it("returns default icon for unknown type", () => {
      expect(notificationService.getTypeIcon("unknown" as any)).toBe("Bell");
    });
  });

  describe("getTypeColor", () => {
    it("returns correct color for each notification type", () => {
      expect(notificationService.getTypeColor("order")).toBe("text-blue-600");
      expect(notificationService.getTypeColor("auction")).toBe(
        "text-purple-600"
      );
      expect(notificationService.getTypeColor("bid")).toBe("text-green-600");
      expect(notificationService.getTypeColor("message")).toBe(
        "text-indigo-600"
      );
      expect(notificationService.getTypeColor("system")).toBe("text-gray-600");
      expect(notificationService.getTypeColor("payment")).toBe(
        "text-yellow-600"
      );
      expect(notificationService.getTypeColor("shipping")).toBe(
        "text-orange-600"
      );
      expect(notificationService.getTypeColor("review")).toBe("text-pink-600");
    });

    it("returns default color for unknown type", () => {
      expect(notificationService.getTypeColor("unknown" as any)).toBe(
        "text-gray-600"
      );
    });
  });

  describe("error handling", () => {
    it("handles API errors in list", async () => {
      const error = new Error("Network error");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(notificationService.list()).rejects.toThrow("Network error");
    });

    it("handles API errors in getUnreadCount", async () => {
      const error = new Error("Unauthorized");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(notificationService.getUnreadCount()).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("handles API errors in markAsRead", async () => {
      const error = new Error("Bad request");
      (apiService.patch as jest.Mock).mockRejectedValue(error);

      await expect(notificationService.markAsRead(["notif1"])).rejects.toThrow(
        "Bad request"
      );
    });

    it("handles API errors in delete", async () => {
      const error = new Error("Not found");
      (apiService.delete as jest.Mock).mockRejectedValue(error);

      await expect(notificationService.delete("notif1")).rejects.toThrow(
        "Not found"
      );
    });
  });
});
