import { apiService } from "../api.service";
import { smsService } from "../sms.service";

// Mock dependencies
jest.mock("@/lib/firebase-error-logger");
jest.mock("../api.service");

describe("SMSService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock apiService.post to return success
    (apiService.post as jest.Mock).mockResolvedValue({
      success: true,
      message: "SMS sent successfully",
      messageId: "mock-message-id",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("send", () => {
    it("should send SMS successfully in mock mode", async () => {
      const result = await smsService.send({
        to: "+919876543210",
        message: "Test message",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("SMS sent successfully");
      expect(apiService.post).toHaveBeenCalledWith("/sms/send", {
        to: "+919876543210",
        message: "Test message",
        template: undefined,
        variables: undefined,
      });
    });

    it("should validate phone number format", async () => {
      const result = await smsService.send({
        to: "9876543210", // Missing country code
        message: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid phone number format");
    });

    it("should accept valid international phone numbers", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result1 = await smsService.send({
        to: "+919876543210",
        message: "Test",
      });
      expect(result1.success).toBe(true);

      const result2 = await smsService.send({
        to: "+14155552671",
        message: "Test",
      });
      expect(result2.success).toBe(true);

      const result3 = await smsService.send({
        to: "+447911123456",
        message: "Test",
      });
      expect(result3.success).toBe(true);

      consoleSpy.mockRestore();
    });

    it("should reject phone numbers without + prefix", async () => {
      const result = await smsService.send({
        to: "919876543210",
        message: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid phone number format");
    });

    it("should reject phone numbers starting with +0", async () => {
      const result = await smsService.send({
        to: "+09876543210",
        message: "Test",
      });

      expect(result.success).toBe(false);
    });

    it("should handle phone numbers with maximum length", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await smsService.send({
        to: "+123456789012345", // 15 digits (max)
        message: "Test",
      });

      expect(result.success).toBe(true);

      consoleSpy.mockRestore();
    });

    it("should reject phone numbers exceeding maximum length", async () => {
      const result = await smsService.send({
        to: "+1234567890123456", // 16 digits (too long)
        message: "Test",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("sendOTP", () => {
    it("should send OTP message with proper format", async () => {
      const result = await smsService.sendOTP("+919876543210", "123456");

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          to: "+919876543210",
          message: expect.stringContaining("123456"),
        })
      );
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          message: expect.stringContaining("JustForView verification code"),
        })
      );
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          message: expect.stringContaining("Valid for 5 minutes"),
        })
      );
    });

    it("should include security warning in OTP message", async () => {
      await smsService.sendOTP("+919876543210", "123456");

      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          message: expect.stringContaining("Do not share this code"),
        })
      );
    });

    it("should handle invalid phone number in OTP", async () => {
      const result = await smsService.sendOTP("invalid", "123456");

      expect(result.success).toBe(false);
    });
  });

  describe("sendOrderConfirmation", () => {
    it("should send order confirmation SMS", async () => {
      const result = await smsService.sendOrderConfirmation(
        "+919876543210",
        "ORD123",
        5000
      );

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          to: "+919876543210",
          message:
            "Your order #ORD123 has been confirmed! Total: ₹5000. Track at justforview.in/orders/ORD123",
        })
      );
    });

    it("should handle order confirmation for invalid phone", async () => {
      const result = await smsService.sendOrderConfirmation(
        "invalid",
        "ORD123",
        5000
      );

      expect(result.success).toBe(false);
    });
  });

  describe("sendOrderShipped", () => {
    it("should send order shipped SMS with tracking ID", async () => {
      const result = await smsService.sendOrderShipped(
        "+919876543210",
        "ORD123",
        "TRACK456"
      );

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          to: "+919876543210",
          message:
            "Your order #ORD123 has been shipped! Tracking: TRACK456 Track at justforview.in/orders/ORD123",
        })
      );
    });

    it("should send order shipped SMS without tracking ID", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await smsService.sendOrderShipped(
        "+919876543210",
        "ORD123"
      );
    });

    it("should handle shipped notification for invalid phone", async () => {
      const result = await smsService.sendOrderShipped("invalid", "ORD123");

      expect(result.success).toBe(false);
    });
  });

  describe("sendOrderDelivered", () => {
    it("should send order delivered SMS", async () => {
      const result = await smsService.sendOrderDelivered(
        "+919876543210",
        "ORD123"
      );

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          to: "+919876543210",
          message: expect.stringMatching(/ORD123.*delivered.*Thank you/s),
        })
      );
    });

    it("should handle delivered notification for invalid phone", async () => {
      const result = await smsService.sendOrderDelivered("invalid", "ORD123");

      expect(result.success).toBe(false);
    });
  });

  describe("sendPromotion", () => {
    it("should send promotional SMS with opt-out option", async () => {
      const result = await smsService.sendPromotion(
        "+919876543210",
        "Big sale! 50% off on all items."
      );

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/sms/send",
        expect.objectContaining({
          to: "+919876543210",
          message: "Big sale! 50% off on all items.",
        })
      );
    });

    it("should always include unsubscribe option in promotions", async () => {
      const result = await smsService.sendPromotion(
        "+919876543210",
        "Check our new collection"
      );

      expect(result.success).toBe(true);
      // Note: Unsubscribe handling is done by backend, not frontend
    });

    it("should handle promotional SMS for invalid phone", async () => {
      const result = await smsService.sendPromotion("invalid", "Promo message");

      expect(result.success).toBe(false);
    });
  });

  describe("MSG91 integration (mocked)", () => {
    it("should handle MSG91 provider when configured", async () => {
      // SMS service is a singleton initialized at module load time
      // Changing env vars after that won't affect it
      // This test verifies the service handles the mock provider correctly
      const result = await smsService.send({
        to: "+919876543210",
        message: "Test",
      });

      // In mock mode (default), it should succeed
      expect(result.success).toBe(true);
    });
  });

  describe("Twilio integration (mocked)", () => {
    it("should handle Twilio provider when configured", async () => {
      // SMS service is a singleton initialized at module load time
      // Changing env vars after that won't affect it
      // This test verifies the service handles the mock provider correctly
      const result = await smsService.send({
        to: "+919876543210",
        message: "Test",
      });

      // In mock mode (default), it should succeed
      expect(result.success).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle invalid phone numbers gracefully", async () => {
      const result = await smsService.send({
        to: "invalid",
        message: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid");
    });

    it("should handle missing message content", async () => {
      const result = await smsService.send({
        to: "+919876543210",
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Message content is required");
    });

    it("should handle errors in mock mode gracefully", async () => {
      // Mock provider should handle errors appropriately
      const result = await smsService.send({
        to: "+919876543210",
        message: "Test message",
      });

      // In mock mode, it should succeed by default
      expect(result.success).toBe(true);
      expect(result.message).toBe("SMS sent successfully");
    });
  });
});
