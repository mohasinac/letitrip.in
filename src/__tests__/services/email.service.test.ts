import { apiService } from "@/services/api.service";
import type {
  AuctionWonEmailData,
  BidOutbidEmailData,
  OrderConfirmationEmailData,
  PasswordResetEmailData,
  ShippingUpdateEmailData,
  VerificationEmailData,
  WelcomeEmailData,
} from "@/services/email.service";
import { emailServiceFrontend } from "@/services/email.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/services/api.service");

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
    mockApiService.patch = jest.fn();
    mockApiService.delete = jest.fn();
  });

  describe("sendTemplate", () => {
    it("should send template email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
        message: "Email sent",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: VerificationEmailData = {
        name: "John Doe",
        verificationLink: "https://example.com/verify?token=abc123",
      };

      const result = await emailServiceFrontend.sendTemplate(
        "john@example.com",
        "verification",
        data
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "john@example.com",
        template: "verification",
        data,
      });
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-123");
    });

    it("should send to multiple recipients", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-124",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const recipients = ["user1@example.com", "user2@example.com"];
      const data: WelcomeEmailData = { name: "Users" };

      await emailServiceFrontend.sendTemplate(recipients, "welcome", data);

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: recipients,
        template: "welcome",
        data,
      });
    });

    it("should include replyTo when provided", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = { name: "John" };

      await emailServiceFrontend.sendTemplate(
        "john@example.com",
        "welcome",
        data,
        "support@example.com"
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "john@example.com",
        template: "welcome",
        data,
        replyTo: "support@example.com",
      });
    });

    it("should handle API errors gracefully", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const data: WelcomeEmailData = { name: "John" };

      const result = await emailServiceFrontend.sendTemplate(
        "john@example.com",
        "welcome",
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should handle non-Error exceptions", async () => {
      (apiService.post as jest.Mock).mockRejectedValue("String error");

      const data: WelcomeEmailData = { name: "John" };

      const result = await emailServiceFrontend.sendTemplate(
        "john@example.com",
        "welcome",
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send email");
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: VerificationEmailData = {
        name: "John Doe",
        verificationLink: "https://example.com/verify?token=abc123",
      };

      const result = await emailServiceFrontend.sendVerificationEmail(
        "john@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "john@example.com",
        template: "verification",
        data,
      });
      expect(result.success).toBe(true);
    });

    it("should handle long verification links", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const longToken = "a".repeat(500);
      const data: VerificationEmailData = {
        name: "John Doe",
        verificationLink: `https://example.com/verify?token=${longToken}`,
      };

      await emailServiceFrontend.sendVerificationEmail(
        "john@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send password reset email", async () => {
      const mockResponse = { success: true, messageId: "msg-125" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: PasswordResetEmailData = {
        name: "Jane Smith",
        resetLink: "https://example.com/reset?token=xyz789",
      };

      const result = await emailServiceFrontend.sendPasswordResetEmail(
        "jane@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "jane@example.com",
        template: "password_reset",
        data,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = { name: "Alice" };

      await emailServiceFrontend.sendWelcomeEmail("alice@example.com", data);

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "alice@example.com",
        template: "welcome",
        data,
      });
    });

    it("should handle special characters in name", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = { name: "José García" };

      await emailServiceFrontend.sendWelcomeEmail("jose@example.com", data);

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe("sendOrderConfirmationEmail", () => {
    it("should send order confirmation with complete data", async () => {
      const mockResponse = { success: true, messageId: "msg-126" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: OrderConfirmationEmailData = {
        customerName: "Bob Wilson",
        orderNumber: "ORD-12345",
        orderDate: "2024-12-09",
        items: [
          { name: "iPhone 15 Pro", quantity: 1, price: 129900 },
          { name: "AirPods Pro", quantity: 1, price: 24900 },
        ],
        subtotal: 154800,
        shipping: 500,
        total: 155300,
        shippingAddress: "123 Main St, Mumbai, MH 400001",
      };

      const result = await emailServiceFrontend.sendOrderConfirmationEmail(
        "bob@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "bob@example.com",
        template: "order_confirmation",
        data,
      });
      expect(result.success).toBe(true);
    });

    it("should handle orders with no items", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: OrderConfirmationEmailData = {
        customerName: "Bob",
        orderNumber: "ORD-12345",
        orderDate: "2024-12-09",
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
        shippingAddress: "123 Main St",
      };

      await emailServiceFrontend.sendOrderConfirmationEmail(
        "bob@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe("sendShippingUpdateEmail", () => {
    it("should send shipping update email", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: ShippingUpdateEmailData = {
        customerName: "Carol",
        orderNumber: "ORD-12346",
        trackingNumber: "TRACK123456",
        carrier: "BlueDart",
        estimatedDelivery: "2024-12-15",
        trackingUrl: "https://track.example.com/TRACK123456",
      };

      await emailServiceFrontend.sendShippingUpdateEmail(
        "carol@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "carol@example.com",
        template: "shipping_update",
        data,
      });
    });

    it("should handle missing tracking URL", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: ShippingUpdateEmailData = {
        customerName: "Carol",
        orderNumber: "ORD-12346",
        trackingNumber: "TRACK123456",
        carrier: "BlueDart",
        estimatedDelivery: "2024-12-15",
        trackingUrl: "",
      };

      await emailServiceFrontend.sendShippingUpdateEmail(
        "carol@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe("sendAuctionWonEmail", () => {
    it("should send auction won email", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: AuctionWonEmailData = {
        customerName: "David",
        itemName: "Vintage Watch",
        winningBid: 50000,
        auctionEndTime: "2024-12-09T18:00:00Z",
        itemUrl: "https://example.com/auctions/123",
      };

      await emailServiceFrontend.sendAuctionWonEmail("david@example.com", data);

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "david@example.com",
        template: "auction_won",
        data,
      });
    });
  });

  describe("sendBidOutbidEmail", () => {
    it("should send bid outbid email", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: BidOutbidEmailData = {
        customerName: "Eve",
        itemName: "Vintage Camera",
        currentBid: 45000,
        yourBid: 40000,
        itemUrl: "https://example.com/auctions/124",
      };

      await emailServiceFrontend.sendBidOutbidEmail("eve@example.com", data);

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "eve@example.com",
        template: "bid_outbid",
        data,
      });
    });

    it("should handle equal bids", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: BidOutbidEmailData = {
        customerName: "Eve",
        itemName: "Vintage Camera",
        currentBid: 40000,
        yourBid: 40000,
        itemUrl: "https://example.com/auctions/124",
      };

      await emailServiceFrontend.sendBidOutbidEmail("eve@example.com", data);

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe("sendTest", () => {
    it("should send test email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "test-msg-127",
        message: "Test email sent",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await emailServiceFrontend.sendTest("admin@example.com");

      expect(apiService.post).toHaveBeenCalledWith("/admin/email/test", {
        to: "admin@example.com",
      });
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-msg-127");
    });

    it("should handle test email errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Test failed")
      );

      const result = await emailServiceFrontend.sendTest("admin@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Test failed");
    });

    it("should handle non-Error exceptions in test", async () => {
      (apiService.post as jest.Mock).mockRejectedValue({ error: "Unknown" });

      const result = await emailServiceFrontend.sendTest("admin@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send test email");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty recipient string", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = { name: "Test" };

      await emailServiceFrontend.sendTemplate("", "welcome", data);

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "",
        template: "welcome",
        data,
      });
    });

    it("should handle empty recipient array", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = { name: "Test" };

      await emailServiceFrontend.sendTemplate([], "welcome", data);

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: [],
        template: "welcome",
        data,
      });
    });

    it("should handle very long email addresses", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const longEmail = `${"a".repeat(50)}@${"b".repeat(50)}.com`;
      const data: WelcomeEmailData = { name: "Test" };

      await emailServiceFrontend.sendTemplate(longEmail, "welcome", data);

      expect(apiService.post).toHaveBeenCalled();
    });

    it("should handle concurrent email sends", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        emailServiceFrontend.sendWelcomeEmail("user1@example.com", {
          name: "User1",
        }),
        emailServiceFrontend.sendWelcomeEmail("user2@example.com", {
          name: "User2",
        }),
        emailServiceFrontend.sendWelcomeEmail("user3@example.com", {
          name: "User3",
        }),
      ];

      await Promise.all(promises);

      expect(apiService.post).toHaveBeenCalledTimes(3);
    });

    it("should handle null in response", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      const data: WelcomeEmailData = { name: "Test" };

      const result = await emailServiceFrontend.sendTemplate(
        "test@example.com",
        "welcome",
        data
      );

      // Should not throw, returns whatever API returns
      expect(result).toBeNull();
    });
  });

  describe("Template-Specific Data Validation", () => {
    it("should handle order with multiple items", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: OrderConfirmationEmailData = {
        customerName: "Test User",
        orderNumber: "ORD-123",
        orderDate: "2024-12-09",
        items: Array(10)
          .fill(null)
          .map((_, i) => ({
            name: `Product ${i}`,
            quantity: i + 1,
            price: (i + 1) * 1000,
          })),
        subtotal: 55000,
        shipping: 1000,
        total: 56000,
        shippingAddress: "Test Address",
      };

      await emailServiceFrontend.sendOrderConfirmationEmail(
        "test@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalled();
    });

    it("should handle shipping update with special carrier names", async () => {
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: ShippingUpdateEmailData = {
        customerName: "Test",
        orderNumber: "ORD-123",
        trackingNumber: "SPECIAL-123",
        carrier: "Custom Courier & Logistics",
        estimatedDelivery: "2024-12-15",
        trackingUrl: "https://track.example.com/special",
      };

      await emailServiceFrontend.sendShippingUpdateEmail(
        "test@example.com",
        data
      );

      expect(apiService.post).toHaveBeenCalled();
    });
  });
});
