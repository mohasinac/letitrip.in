import { apiService } from "@/services/api.service";
import type { NotificationType } from "@/services/notification.service";
import { notificationService } from "@/services/notification.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/services/api.service");

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should fetch notifications with default params", async () => {
      const mockNotifications = [
        {
          id: "notif-1",
          userId: "user-1",
          type: "order" as NotificationType,
          title: "Order Confirmed",
          message: "Your order #12345 has been confirmed",
          read: false,
          createdAt: "2024-12-09T10:00:00Z",
        },
        {
          id: "notif-2",
          userId: "user-1",
          type: "message" as NotificationType,
          title: "New Message",
          message: "You have a new message from seller",
          read: true,
          link: "/messages/conv-1",
          createdAt: "2024-12-08T15:30:00Z",
          readAt: "2024-12-08T16:00:00Z",
        },
      ];

      const mockResponse = {
        data: {
          notifications: mockNotifications,
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
      expect(result.notifications[1].readAt).toBeInstanceOf(Date);
      expect(result.pagination.total).toBe(2);
    });

    it("should fetch notifications with custom pagination", async () => {
      const mockResponse = {
        data: {
          notifications: [],
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

      await notificationService.list({ page: 2, pageSize: 10 });

      expect(apiService.get).toHaveBeenCalledWith(
        "/notifications?page=2&pageSize=10"
      );
    });

    it("should fetch unread notifications only", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif-1",
              userId: "user-1",
              type: "bid" as NotificationType,
              title: "New Bid",
              message: "Someone bid on your auction",
              read: false,
              createdAt: "2024-12-09T10:00:00Z",
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

    it("should handle notifications with metadata", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif-1",
              userId: "user-1",
              type: "auction" as NotificationType,
              title: "Auction Ending Soon",
              message: "Auction ends in 1 hour",
              read: false,
              link: "/auctions/auction-1",
              metadata: {
                auctionId: "auction-1",
                currentBid: 5000,
                endTime: "2024-12-09T18:00:00Z",
              },
              createdAt: "2024-12-09T17:00:00Z",
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

      expect(result.notifications[0].metadata).toBeDefined();
      expect(result.notifications[0].metadata?.auctionId).toBe("auction-1");
      expect(result.notifications[0].link).toBe("/auctions/auction-1");
    });

    it("should handle all notification types", async () => {
      const types: NotificationType[] = [
        "order",
        "auction",
        "bid",
        "message",
        "system",
        "payment",
        "shipping",
        "review",
      ];

      const mockNotifications = types.map((type, index) => ({
        id: `notif-${index}`,
        userId: "user-1",
        type,
        title: `${type} notification`,
        message: `Test ${type} message`,
        read: false,
        createdAt: "2024-12-09T10:00:00Z",
      }));

      const mockResponse = {
        data: {
          notifications: mockNotifications,
          pagination: {
            page: 1,
            pageSize: 20,
            total: types.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.list();

      expect(result.notifications).toHaveLength(types.length);
      types.forEach((type, index) => {
        expect(result.notifications[index].type).toBe(type);
      });
    });
  });

  describe("getUnreadCount", () => {
    it("should fetch unread notification count", async () => {
      const mockResponse = {
        data: { count: 5 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const count = await notificationService.getUnreadCount();

      expect(apiService.get).toHaveBeenCalledWith(
        "/notifications/unread-count"
      );
      expect(count).toBe(5);
    });

    it("should handle zero unread notifications", async () => {
      const mockResponse = {
        data: { count: 0 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(0);
    });
  });

  describe("markAsRead", () => {
    it("should mark specific notifications as read", async () => {
      const notificationIds = ["notif-1", "notif-2", "notif-3"];
      const mockResponse = {
        data: { marked: 3 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead(notificationIds);

      expect(apiService.patch).toHaveBeenCalledWith("/notifications", {
        notificationIds,
      });
      expect(result.marked).toBe(3);
    });

    it("should handle empty notification list", async () => {
      const mockResponse = {
        data: { marked: 0 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead([]);

      expect(result.marked).toBe(0);
    });

    it("should handle single notification", async () => {
      const mockResponse = {
        data: { marked: 1 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead(["notif-1"]);

      expect(result.marked).toBe(1);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
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

    it("should handle no notifications to mark", async () => {
      const mockResponse = {
        data: { marked: 0 },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.markAllAsRead();

      expect(result.marked).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete specific notification", async () => {
      const mockResponse = {
        data: { deleted: 1 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.delete("notif-1");

      expect(apiService.delete).toHaveBeenCalledWith(
        "/notifications?id=notif-1"
      );
      expect(result.deleted).toBe(1);
    });

    it("should handle notification not found", async () => {
      const mockResponse = {
        data: { deleted: 0 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.delete("non-existent");

      expect(result.deleted).toBe(0);
    });
  });

  describe("deleteRead", () => {
    it("should delete all read notifications", async () => {
      const mockResponse = {
        data: { deleted: 15 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteRead();

      expect(apiService.delete).toHaveBeenCalledWith(
        "/notifications?deleteRead=true"
      );
      expect(result.deleted).toBe(15);
    });

    it("should handle no read notifications", async () => {
      const mockResponse = {
        data: { deleted: 0 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteRead();

      expect(result.deleted).toBe(0);
    });
  });

  describe("deleteAll", () => {
    it("should delete all notifications", async () => {
      const mockResponse = {
        data: { deleted: 25 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteAll();

      expect(apiService.delete).toHaveBeenCalledWith(
        "/notifications?deleteAll=true"
      );
      expect(result.deleted).toBe(25);
    });

    it("should handle empty notification list", async () => {
      const mockResponse = {
        data: { deleted: 0 },
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.deleteAll();

      expect(result.deleted).toBe(0);
    });
  });

  describe("getTypeIcon", () => {
    it("should return correct icon for each notification type", () => {
      const expectedIcons: Record<NotificationType, string> = {
        order: "Package",
        auction: "Gavel",
        bid: "TrendingUp",
        message: "MessageSquare",
        system: "Bell",
        payment: "CreditCard",
        shipping: "Truck",
        review: "Star",
      };

      Object.entries(expectedIcons).forEach(([type, icon]) => {
        expect(notificationService.getTypeIcon(type as NotificationType)).toBe(
          icon
        );
      });
    });

    it("should return default icon for unknown type", () => {
      // @ts-expect-error Testing invalid type
      const icon = notificationService.getTypeIcon("invalid");
      expect(icon).toBe("Bell");
    });
  });

  describe("getTypeColor", () => {
    it("should return correct color for each notification type", () => {
      const expectedColors: Record<NotificationType, string> = {
        order: "text-blue-600",
        auction: "text-purple-600",
        bid: "text-green-600",
        message: "text-indigo-600",
        system: "text-gray-600",
        payment: "text-yellow-600",
        shipping: "text-orange-600",
        review: "text-pink-600",
      };

      Object.entries(expectedColors).forEach(([type, color]) => {
        expect(notificationService.getTypeColor(type as NotificationType)).toBe(
          color
        );
      });
    });

    it("should return default color for unknown type", () => {
      // @ts-expect-error Testing invalid type
      const color = notificationService.getTypeColor("invalid");
      expect(color).toBe("text-gray-600");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(notificationService.list()).rejects.toThrow("Network error");
    });

    it("should handle malformed response data", async () => {
      const mockResponse = {
        data: {
          notifications: null,
          pagination: null,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await expect(notificationService.list()).rejects.toThrow();
    });

    it("should handle notifications without optional fields", async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: "notif-1",
              userId: "user-1",
              type: "system" as NotificationType,
              title: "System Update",
              message: "System maintenance scheduled",
              read: false,
              createdAt: "2024-12-09T10:00:00Z",
              // No link, readAt, or metadata
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

      expect(result.notifications[0].link).toBeUndefined();
      expect(result.notifications[0].readAt).toBeUndefined();
      expect(result.notifications[0].metadata).toBeUndefined();
    });

    it("should handle large pagination values", async () => {
      const mockResponse = {
        data: {
          notifications: [],
          pagination: {
            page: 100,
            pageSize: 100,
            total: 10000,
            totalPages: 100,
            hasNext: false,
            hasPrev: true,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.list({
        page: 100,
        pageSize: 100,
      });

      expect(result.pagination.page).toBe(100);
      expect(result.pagination.total).toBe(10000);
    });

    it("should handle concurrent mark as read operations", async () => {
      const mockResponse = { data: { marked: 5 } };
      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        notificationService.markAsRead(["notif-1"]),
        notificationService.markAsRead(["notif-2"]),
        notificationService.markAllAsRead(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.patch).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent delete operations", async () => {
      const mockResponse = { data: { deleted: 1 } };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        notificationService.delete("notif-1"),
        notificationService.deleteRead(),
        notificationService.deleteAll(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.delete).toHaveBeenCalledTimes(3);
    });
  });
});
