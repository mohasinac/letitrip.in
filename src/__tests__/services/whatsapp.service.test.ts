import { apiService } from "@/services/api.service";
import type {
  MessageStatus,
  OptInStatus,
  SendMediaParams,
  SendMessageParams,
  SendMessageResponse,
} from "@/services/whatsapp.service";
import { whatsappService } from "@/services/whatsapp.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/firebase-error-logger");

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe("WhatsAppService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
  });

  describe("sendTemplate", () => {
    it("should send template message successfully", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-123",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date("2024-12-09T10:00:00Z"),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const params: SendMessageParams = {
        to: "+919876543210",
        templateId: "ORDER_CONFIRMATION",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
        },
        category: "UTILITY",
      };

      const result = await whatsappService.sendTemplate(params);

      expect(apiService.post).toHaveBeenCalledWith(
        "/whatsapp/send-template",
        params
      );
      expect(result.messageId).toBe("wa-msg-123");
      expect(result.status).toBe("sent");
    });

    it("should handle send failure", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      const params: SendMessageParams = {
        to: "+919876543210",
        templateId: "OTP",
        variables: { otp: "123456", validity: "10 minutes" },
      };

      await expect(whatsappService.sendTemplate(params)).rejects.toThrow(
        "Failed to send WhatsApp message"
      );
    });

    it("should handle API errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const params: SendMessageParams = {
        to: "+919876543210",
        templateId: "OTP",
        variables: { otp: "123456", validity: "10 minutes" },
      };

      await expect(whatsappService.sendTemplate(params)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("sendOrderConfirmation", () => {
    it("should send order confirmation message", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-123",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendOrderConfirmation({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        items: "iPhone 15 Pro x1",
        total: "₹1,29,900",
        deliveryDate: "Dec 15, 2024",
        trackingUrl: "https://track.example.com/ORD-123",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "ORDER_CONFIRMATION",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          items: "iPhone 15 Pro x1",
          total: "₹1,29,900",
          deliveryDate: "Dec 15, 2024",
          trackingUrl: "https://track.example.com/ORD-123",
        },
        category: "UTILITY",
      });
      expect(result.status).toBe("sent");
    });
  });

  describe("sendShippingUpdate", () => {
    it("should send shipping update message", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-124",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendShippingUpdate({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        status: "In Transit",
        courier: "BlueDart",
        trackingId: "BD123456789",
        location: "Mumbai",
        estimatedDate: "Dec 12, 2024",
        trackingUrl: "https://track.example.com/BD123456789",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "SHIPPING_UPDATE",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          status: "In Transit",
          courier: "BlueDart",
          trackingId: "BD123456789",
          location: "Mumbai",
          estimatedDate: "Dec 12, 2024",
          trackingUrl: "https://track.example.com/BD123456789",
        },
        category: "UTILITY",
      });
    });
  });

  describe("sendOutForDelivery", () => {
    it("should send out for delivery notification", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-125",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendOutForDelivery({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        time: "2:00 PM - 4:00 PM",
        partner: "BlueDart",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "OUT_FOR_DELIVERY",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          time: "2:00 PM - 4:00 PM",
          partner: "BlueDart",
        },
        category: "UTILITY",
      });
    });
  });

  describe("sendDeliveryConfirmation", () => {
    it("should send delivery confirmation", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-126",
        status: "delivered",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendDeliveryConfirmation({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        time: "3:45 PM",
        receiver: "John Doe",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "DELIVERY_CONFIRMATION",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          time: "3:45 PM",
          receiver: "John Doe",
        },
        category: "UTILITY",
      });
    });
  });

  describe("sendPaymentReminder", () => {
    it("should send payment reminder", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-127",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendPaymentReminder({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        amount: "₹1,29,900",
        items: "iPhone 15 Pro",
        time: "24 hours",
        paymentUrl: "https://pay.example.com/ORD-123",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "PAYMENT_REMINDER",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          amount: "₹1,29,900",
          items: "iPhone 15 Pro",
          time: "24 hours",
          paymentUrl: "https://pay.example.com/ORD-123",
        },
        category: "UTILITY",
      });
    });
  });

  describe("sendAbandonedCart", () => {
    it("should send abandoned cart reminder", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-128",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendAbandonedCart({
        to: "+919876543210",
        customerName: "John Doe",
        itemCount: "3",
        value: "₹50,000",
        discount: "10%",
        validity: "24 hours",
        cartUrl: "https://justforview.in/cart",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "ABANDONED_CART",
        variables: {
          name: "John Doe",
          itemCount: "3",
          value: "₹50,000",
          discount: "10%",
          validity: "24 hours",
          cartUrl: "https://justforview.in/cart",
        },
        category: "MARKETING",
      });
    });
  });

  describe("sendReturnRequest", () => {
    it("should send return request confirmation", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-129",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendReturnRequest({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        returnId: "RET-456",
        reason: "Product damaged",
        pickupDate: "Dec 12, 2024",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "RETURN_REQUEST",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          returnId: "RET-456",
          reason: "Product damaged",
          pickupDate: "Dec 12, 2024",
        },
        category: "SERVICE",
      });
    });
  });

  describe("sendRefundProcessed", () => {
    it("should send refund processed notification", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-130",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendRefundProcessed({
        to: "+919876543210",
        orderId: "ORD-123",
        customerName: "John Doe",
        amount: "₹1,29,900",
        method: "Original Payment Method",
        account: "****1234",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "REFUND_PROCESSED",
        variables: {
          name: "John Doe",
          orderId: "ORD-123",
          amount: "₹1,29,900",
          method: "Original Payment Method",
          account: "****1234",
        },
        category: "UTILITY",
      });
    });
  });

  describe("sendOTP", () => {
    it("should send OTP message", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-131",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendOTP({
        to: "+919876543210",
        otp: "123456",
        validity: "10 minutes",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "OTP",
        variables: {
          otp: "123456",
          validity: "10 minutes",
        },
        category: "AUTHENTICATION",
      });
    });
  });

  describe("sendPriceDrop", () => {
    it("should send price drop alert", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-132",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendPriceDrop({
        to: "+919876543210",
        customerName: "John Doe",
        productName: "iPhone 15 Pro",
        oldPrice: "₹1,49,900",
        newPrice: "₹1,29,900",
        savings: "₹20,000",
        percentage: "13%",
        productUrl: "https://justforview.in/products/iphone-15-pro",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "PRICE_DROP",
        variables: {
          name: "John Doe",
          productName: "iPhone 15 Pro",
          oldPrice: "₹1,49,900",
          newPrice: "₹1,29,900",
          savings: "₹20,000",
          percentage: "13%",
          productUrl: "https://justforview.in/products/iphone-15-pro",
        },
        category: "MARKETING",
      });
    });
  });

  describe("sendMedia", () => {
    it("should send media message successfully", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-133",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const params: SendMediaParams = {
        to: "+919876543210",
        type: "image",
        mediaUrl: "https://example.com/image.jpg",
        caption: "Check this out!",
      };

      const result = await whatsappService.sendMedia(params);

      expect(apiService.post).toHaveBeenCalledWith(
        "/whatsapp/send-media",
        params
      );
      expect(result.messageId).toBe("wa-msg-133");
    });

    it("should send document with filename", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-134",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendMedia({
        to: "+919876543210",
        type: "document",
        mediaUrl: "https://example.com/invoice.pdf",
        filename: "invoice.pdf",
      });

      expect(apiService.post).toHaveBeenCalled();
    });

    it("should handle send failure", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        whatsappService.sendMedia({
          to: "+919876543210",
          type: "image",
          mediaUrl: "https://example.com/image.jpg",
        })
      ).rejects.toThrow("Failed to send media message");
    });
  });

  describe("getMessageStatus", () => {
    it("should fetch message status", async () => {
      const mockStatus: MessageStatus = {
        messageId: "wa-msg-123",
        status: "delivered",
        timestamp: new Date("2024-12-09T10:05:00Z"),
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await whatsappService.getMessageStatus("wa-msg-123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/messages/wa-msg-123/status"
      );
      expect(result?.status).toBe("delivered");
    });

    it("should return null on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await whatsappService.getMessageStatus("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("getOptInStatus", () => {
    it("should fetch opt-in status", async () => {
      const mockStatus: OptInStatus = {
        phone: "+919876543210",
        optedIn: true,
        optedInAt: new Date("2024-01-01T00:00:00Z"),
        categories: ["UTILITY", "SERVICE"],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await whatsappService.getOptInStatus("+919876543210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/opt-in/%2B919876543210"
      );
      expect(result?.optedIn).toBe(true);
    });

    it("should handle opted-out user", async () => {
      const mockStatus: OptInStatus = {
        phone: "+919876543210",
        optedIn: false,
        optedOutAt: new Date("2024-06-01T00:00:00Z"),
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await whatsappService.getOptInStatus("+919876543210");

      expect(result?.optedIn).toBe(false);
    });

    it("should return null on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await whatsappService.getOptInStatus("+919876543210");

      expect(result).toBeNull();
    });
  });

  describe("optIn", () => {
    it("should opt-in user with default categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      const result = await whatsappService.optIn("+919876543210");

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/opt-in", {
        phone: "+919876543210",
        categories: ["UTILITY", "SERVICE"],
      });
      expect(result).toBe(true);
    });

    it("should opt-in user with custom categories", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await whatsappService.optIn("+919876543210", ["UTILITY", "MARKETING"]);

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/opt-in", {
        phone: "+919876543210",
        categories: ["UTILITY", "MARKETING"],
      });
    });

    it("should return false on error", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("Failed"));

      const result = await whatsappService.optIn("+919876543210");

      expect(result).toBe(false);
    });
  });

  describe("optOut", () => {
    it("should opt-out user", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      const result = await whatsappService.optOut("+919876543210");

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/opt-out", {
        phone: "+919876543210",
      });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("Failed"));

      const result = await whatsappService.optOut("+919876543210");

      expect(result).toBe(false);
    });
  });

  describe("getMessageHistory", () => {
    it("should fetch message history with default limit", async () => {
      const mockHistory = [
        {
          messageId: "wa-msg-1",
          templateId: "ORDER_CONFIRMATION",
          status: "delivered",
          sentAt: new Date("2024-12-09T10:00:00Z"),
        },
        {
          messageId: "wa-msg-2",
          templateId: "SHIPPING_UPDATE",
          status: "read",
          sentAt: new Date("2024-12-08T15:00:00Z"),
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockHistory);

      const result = await whatsappService.getMessageHistory("+919876543210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/messages/history/%2B919876543210?limit=50"
      );
      expect(result).toHaveLength(2);
    });

    it("should fetch message history with custom limit", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      await whatsappService.getMessageHistory("+919876543210", 10);

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/messages/history/%2B919876543210?limit=10"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await whatsappService.getMessageHistory("+919876543210");

      expect(result).toEqual([]);
    });
  });

  describe("getDeliveryStats", () => {
    it("should fetch delivery statistics", async () => {
      const mockStats = {
        sent: 1000,
        delivered: 950,
        read: 800,
        failed: 50,
        deliveryRate: 95.0,
        readRate: 84.2,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await whatsappService.getDeliveryStats();

      expect(apiService.get).toHaveBeenCalledWith("/whatsapp/stats?");
      expect(result.deliveryRate).toBe(95.0);
      expect(result.readRate).toBe(84.2);
    });

    it("should fetch stats with date range", async () => {
      const mockStats = {
        sent: 500,
        delivered: 480,
        read: 400,
        failed: 20,
        deliveryRate: 96.0,
        readRate: 83.3,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-09");

      await whatsappService.getDeliveryStats({ startDate, endDate });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/whatsapp/stats?")
      );
    });

    it("should fetch stats for specific template", async () => {
      const mockStats = {
        sent: 100,
        delivered: 98,
        read: 85,
        failed: 2,
        deliveryRate: 98.0,
        readRate: 86.7,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      await whatsappService.getDeliveryStats({
        templateId: "ORDER_CONFIRMATION",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("templateId=ORDER_CONFIRMATION")
      );
    });

    it("should return zero stats on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Failed"));

      const result = await whatsappService.getDeliveryStats();

      expect(result).toEqual({
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle phone numbers with special characters", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-123",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await whatsappService.sendOTP({
        to: "+91 (987) 654-3210",
        otp: "123456",
        validity: "10 minutes",
      });

      expect(apiService.post).toHaveBeenCalled();
    });

    it("should handle concurrent message sends", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "wa-msg-123",
        status: "sent",
        provider: "INTERAKT",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        whatsappService.sendOTP({
          to: "+919876543210",
          otp: "123456",
          validity: "10 minutes",
        }),
        whatsappService.sendOTP({
          to: "+919876543211",
          otp: "654321",
          validity: "10 minutes",
        }),
      ];

      await Promise.all(promises);

      expect(apiService.post).toHaveBeenCalledTimes(2);
    });
  });
});
