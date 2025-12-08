import { apiService } from "../api.service";
import type {
  MessageStatus,
  OptInStatus,
  SendMessageResponse,
} from "../whatsapp.service";
import { whatsappService } from "../whatsapp.service";

// Mock dependencies
jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("WhatsAppService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendTemplate", () => {
    it("should send template message successfully", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendTemplate({
        to: "+919876543210",
        templateId: "ORDER_CONFIRMATION",
        variables: {
          name: "John",
          orderId: "ORD123",
        },
        category: "UTILITY",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "ORDER_CONFIRMATION",
        variables: {
          name: "John",
          orderId: "ORD123",
        },
        category: "UTILITY",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should send template without optional fields", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendTemplate({
        to: "+919876543210",
        templateId: "OTP",
        variables: { otp: "123456" },
      });

      expect(result.messageId).toBe("msg123");
    });

    it("should throw error when API fails", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(
        whatsappService.sendTemplate({
          to: "+919876543210",
          templateId: "ORDER_CONFIRMATION",
          variables: {},
        })
      ).rejects.toThrow("API Error");
    });

    it("should throw error when response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        whatsappService.sendTemplate({
          to: "+919876543210",
          templateId: "ORDER_CONFIRMATION",
          variables: {},
        })
      ).rejects.toThrow("Failed to send WhatsApp message");
    });
  });

  describe("sendOrderConfirmation", () => {
    it("should send order confirmation with all details", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendOrderConfirmation({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        items: "Product 1, Product 2",
        total: "₹5,000",
        deliveryDate: "Dec 15, 2024",
        trackingUrl: "https://track.com/ORD123",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "ORDER_CONFIRMATION",
        variables: expect.objectContaining({
          orderId: "ORD123",
          name: "John Doe",
        }),
        category: "UTILITY",
      });
      expect(result.status).toBe("sent");
    });
  });

  describe("sendShippingUpdate", () => {
    it("should send shipping update notification", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendShippingUpdate({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        status: "In Transit",
        courier: "FedEx",
        trackingId: "TRACK123",
        location: "Mumbai",
        estimatedDate: "Dec 15",
        trackingUrl: "https://track.com/TRACK123",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "SHIPPING_UPDATE",
        variables: expect.objectContaining({
          status: "In Transit",
          courier: "FedEx",
          trackingId: "TRACK123",
        }),
        category: "UTILITY",
      });
      expect(result.messageId).toBe("msg123");
    });
  });

  describe("sendOutForDelivery", () => {
    it("should send out for delivery notification", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendOutForDelivery({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        time: "10:00 AM",
        partner: "FedEx",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "OUT_FOR_DELIVERY",
        variables: expect.objectContaining({
          time: "10:00 AM",
          partner: "FedEx",
        }),
        category: "UTILITY",
      });
      expect(result.status).toBe("sent");
    });
  });

  describe("sendDeliveryConfirmation", () => {
    it("should send delivery confirmation", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendDeliveryConfirmation({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        time: "2:30 PM",
        receiver: "John Doe",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "DELIVERY_CONFIRMATION",
        variables: expect.objectContaining({
          time: "2:30 PM",
          receiver: "John Doe",
        }),
        category: "UTILITY",
      });
      expect(result.messageId).toBe("msg123");
    });
  });

  describe("sendPaymentReminder", () => {
    it("should send payment reminder", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendPaymentReminder({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        amount: "₹5,000",
        items: "Product 1, Product 2",
        time: "24 hours",
        paymentUrl: "https://pay.com/ORD123",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "PAYMENT_REMINDER",
        variables: expect.objectContaining({
          amount: "₹5,000",
          paymentUrl: "https://pay.com/ORD123",
        }),
        category: "UTILITY",
      });
      expect(result.status).toBe("sent");
    });
  });

  describe("sendAbandonedCart", () => {
    it("should send abandoned cart reminder", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendAbandonedCart({
        to: "+919876543210",
        customerName: "John Doe",
        itemCount: "3",
        value: "₹5,000",
        discount: "10%",
        validity: "24 hours",
        cartUrl: "https://shop.com/cart",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "ABANDONED_CART",
        variables: expect.objectContaining({
          itemCount: "3",
          discount: "10%",
        }),
        category: "MARKETING",
      });
      expect(result.messageId).toBe("msg123");
    });
  });

  describe("sendReturnRequest", () => {
    it("should send return request confirmation", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendReturnRequest({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        returnId: "RET123",
        reason: "Defective",
        pickupDate: "Dec 15",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "RETURN_REQUEST",
        variables: expect.objectContaining({
          returnId: "RET123",
          reason: "Defective",
        }),
        category: "SERVICE",
      });
      expect(result.status).toBe("sent");
    });
  });

  describe("sendRefundProcessed", () => {
    it("should send refund processed notification", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendRefundProcessed({
        to: "+919876543210",
        orderId: "ORD123",
        customerName: "John Doe",
        amount: "₹5,000",
        method: "Original Payment Method",
        account: "****1234",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "REFUND_PROCESSED",
        variables: expect.objectContaining({
          amount: "₹5,000",
          method: "Original Payment Method",
        }),
        category: "UTILITY",
      });
      expect(result.messageId).toBe("msg123");
    });
  });

  describe("sendOTP", () => {
    it("should send OTP message", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendOTP({
        to: "+919876543210",
        otp: "123456",
        validity: "5 minutes",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "OTP",
        variables: {
          otp: "123456",
          validity: "5 minutes",
        },
        category: "AUTHENTICATION",
      });
      expect(result.status).toBe("sent");
    });
  });

  describe("sendPriceDrop", () => {
    it("should send price drop alert", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendPriceDrop({
        to: "+919876543210",
        customerName: "John Doe",
        productName: "Smartphone",
        oldPrice: "₹30,000",
        newPrice: "₹25,000",
        savings: "₹5,000",
        percentage: "17%",
        productUrl: "https://shop.com/smartphone",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-template", {
        to: "+919876543210",
        templateId: "PRICE_DROP",
        variables: expect.objectContaining({
          productName: "Smartphone",
          savings: "₹5,000",
          percentage: "17%",
        }),
        category: "MARKETING",
      });
      expect(result.messageId).toBe("msg123");
    });
  });

  describe("sendMedia", () => {
    it("should send media message successfully", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendMedia({
        to: "+919876543210",
        type: "image",
        mediaUrl: "https://storage.com/image.jpg",
        caption: "Check this out!",
      });

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/send-media", {
        to: "+919876543210",
        type: "image",
        mediaUrl: "https://storage.com/image.jpg",
        caption: "Check this out!",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should send media without caption", async () => {
      const mockResponse: SendMessageResponse = {
        messageId: "msg123",
        status: "sent",
        provider: "twilio",
        timestamp: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await whatsappService.sendMedia({
        to: "+919876543210",
        type: "video",
        mediaUrl: "https://storage.com/video.mp4",
      });

      expect(result.messageId).toBe("msg123");
    });

    it("should throw error when media send fails", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Media send failed")
      );

      await expect(
        whatsappService.sendMedia({
          to: "+919876543210",
          type: "image",
          mediaUrl: "https://storage.com/image.jpg",
        })
      ).rejects.toThrow("Media send failed");
    });

    it("should throw error when response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        whatsappService.sendMedia({
          to: "+919876543210",
          type: "image",
          mediaUrl: "https://storage.com/image.jpg",
        })
      ).rejects.toThrow("Failed to send media message");
    });
  });

  describe("getMessageStatus", () => {
    it("should fetch message status successfully", async () => {
      const mockStatus: MessageStatus = {
        messageId: "msg123",
        status: "delivered",
        timestamp: new Date(),
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await whatsappService.getMessageStatus("msg123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/messages/msg123/status"
      );
      expect(result).toEqual(mockStatus);
    });

    it("should return null when status fetch fails", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await whatsappService.getMessageStatus("invalid");

      expect(result).toBeNull();
    });

    it("should return null when response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await whatsappService.getMessageStatus("msg123");

      expect(result).toBeNull();
    });
  });

  describe("getOptInStatus", () => {
    it("should fetch opt-in status successfully", async () => {
      const mockStatus: OptInStatus = {
        phone: "+919876543210",
        optedIn: true,
        optedInAt: new Date(),
        categories: ["UTILITY", "SERVICE"],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await whatsappService.getOptInStatus("+919876543210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/opt-in/%2B919876543210"
      );
      expect(result).toEqual(mockStatus);
    });

    it("should encode phone number in URL", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        phone: "+919876543210",
        optedIn: false,
        categories: [],
      });

      await whatsappService.getOptInStatus("+919876543210");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("%2B919876543210")
      );
    });

    it("should return null when fetch fails", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await whatsappService.getOptInStatus("+919876543210");

      expect(result).toBeNull();
    });

    it("should return null when response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

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

      const result = await whatsappService.optIn("+919876543210", [
        "MARKETING",
      ]);

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/opt-in", {
        phone: "+919876543210",
        categories: ["MARKETING"],
      });
      expect(result).toBe(true);
    });

    it("should return false when opt-in fails", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await whatsappService.optIn("+919876543210");

      expect(result).toBe(false);
    });
  });

  describe("optOut", () => {
    it("should opt-out user successfully", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      const result = await whatsappService.optOut("+919876543210");

      expect(apiService.post).toHaveBeenCalledWith("/whatsapp/opt-out", {
        phone: "+919876543210",
      });
      expect(result).toBe(true);
    });

    it("should return false when opt-out fails", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await whatsappService.optOut("+919876543210");

      expect(result).toBe(false);
    });
  });

  describe("getMessageHistory", () => {
    it("should fetch message history with default limit", async () => {
      const mockHistory = [
        {
          messageId: "msg1",
          templateId: "ORDER_CONFIRMATION",
          status: "delivered",
          sentAt: new Date(),
        },
        {
          messageId: "msg2",
          templateId: "SHIPPING_UPDATE",
          status: "read",
          sentAt: new Date(),
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockHistory);

      const result = await whatsappService.getMessageHistory("+919876543210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/whatsapp/messages/history/%2B919876543210?limit=50"
      );
      expect(result).toEqual(mockHistory);
    });

    it("should fetch message history with custom limit", async () => {
      const mockHistory = [
        {
          messageId: "msg1",
          templateId: "ORDER_CONFIRMATION",
          status: "delivered",
          sentAt: new Date(),
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockHistory);

      const result = await whatsappService.getMessageHistory(
        "+919876543210",
        10
      );

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=10")
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when fetch fails", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await whatsappService.getMessageHistory("+919876543210");

      expect(result).toEqual([]);
    });

    it("should return empty array when response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await whatsappService.getMessageHistory("+919876543210");

      expect(result).toEqual([]);
    });
  });

  describe("getDeliveryStats", () => {
    it("should fetch delivery stats without filters", async () => {
      const mockStats = {
        sent: 100,
        delivered: 95,
        read: 80,
        failed: 5,
        deliveryRate: 95,
        readRate: 84.2,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await whatsappService.getDeliveryStats();

      expect(apiService.get).toHaveBeenCalledWith("/whatsapp/stats?");
      expect(result).toEqual(mockStats);
    });

    it("should fetch delivery stats with date range", async () => {
      const mockStats = {
        sent: 50,
        delivered: 48,
        read: 40,
        failed: 2,
        deliveryRate: 96,
        readRate: 83.3,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-31");

      const result = await whatsappService.getDeliveryStats({
        startDate,
        endDate,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("endDate=")
      );
      expect(result).toEqual(mockStats);
    });

    it("should fetch delivery stats with template filter", async () => {
      const mockStats = {
        sent: 20,
        delivered: 19,
        read: 15,
        failed: 1,
        deliveryRate: 95,
        readRate: 78.9,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await whatsappService.getDeliveryStats({
        templateId: "ORDER_CONFIRMATION",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("templateId=ORDER_CONFIRMATION")
      );
      expect(result).toEqual(mockStats);
    });

    it("should return default stats when fetch fails", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

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

    it("should return default stats when response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

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
});
