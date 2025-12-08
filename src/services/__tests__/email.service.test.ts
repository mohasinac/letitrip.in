import { apiService } from "../api.service";
import type {
  OrderConfirmationEmailData,
  PasswordResetEmailData,
  ShippingUpdateEmailData,
  VerificationEmailData,
  WelcomeEmailData,
} from "../email.service";
import { emailServiceFrontend as emailService } from "../email.service";

// Mock the api service
jest.mock("../api.service");

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendTemplate", () => {
    it("sends template email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
        message: "Email sent successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: VerificationEmailData = {
        name: "Test User",
        verificationLink: "https://example.com/verify?token=abc123",
      };

      const result = await emailService.sendTemplate(
        "test@example.com",
        "verification",
        data
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "verification",
        data,
        replyTo: undefined,
      });
    });

    it("sends email to multiple recipients", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = {
        name: "Test User",
      };

      await emailService.sendTemplate(
        ["test1@example.com", "test2@example.com"],
        "welcome",
        data
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: ["test1@example.com", "test2@example.com"],
        template: "welcome",
        data,
        replyTo: undefined,
      });
    });

    it("includes replyTo when provided", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = {
        name: "Test User",
      };

      await emailService.sendTemplate(
        "test@example.com",
        "welcome",
        data,
        "reply@example.com"
      );

      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "welcome",
        data,
        replyTo: "reply@example.com",
      });
    });

    it("handles errors gracefully", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const data: VerificationEmailData = {
        name: "Test User",
        verificationLink: "https://example.com/verify?token=abc123",
      };

      const result = await emailService.sendTemplate(
        "test@example.com",
        "verification",
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("handles non-Error exceptions", async () => {
      (apiService.post as jest.Mock).mockRejectedValue("Unknown error");

      const data: VerificationEmailData = {
        name: "Test User",
        verificationLink: "https://example.com/verify?token=abc123",
      };

      const result = await emailService.sendTemplate(
        "test@example.com",
        "verification",
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send email");
    });
  });

  describe("sendVerificationEmail", () => {
    it("sends verification email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: VerificationEmailData = {
        name: "Test User",
        verificationLink: "https://example.com/verify?token=abc123",
      };

      const result = await emailService.sendVerificationEmail(
        "test@example.com",
        data
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "verification",
        data,
        replyTo: undefined,
      });
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("sends password reset email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: PasswordResetEmailData = {
        name: "Test User",
        resetLink: "https://example.com/reset?token=xyz789",
      };

      const result = await emailService.sendPasswordResetEmail(
        "test@example.com",
        data
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "password_reset",
        data,
        replyTo: undefined,
      });
    });
  });

  describe("sendWelcomeEmail", () => {
    it("sends welcome email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: WelcomeEmailData = {
        name: "Test User",
      };

      const result = await emailService.sendWelcomeEmail(
        "test@example.com",
        data
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "welcome",
        data,
        replyTo: undefined,
      });
    });
  });

  describe("sendOrderConfirmationEmail", () => {
    it("sends order confirmation email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: OrderConfirmationEmailData = {
        customerName: "Test User",
        orderNumber: "ORD-12345",
        orderDate: "2024-01-15",
        items: [
          { name: "Product 1", quantity: 2, price: 100 },
          { name: "Product 2", quantity: 1, price: 50 },
        ],
        subtotal: 250,
        shipping: 10,
        total: 260,
        shippingAddress: "123 Test St, Test City, 12345",
      };

      const result = await emailService.sendOrderConfirmationEmail(
        "test@example.com",
        data
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "order_confirmation",
        data,
        replyTo: undefined,
      });
    });
  });

  describe("sendShippingUpdateEmail", () => {
    it("sends shipping update email successfully", async () => {
      const mockResponse = {
        success: true,
        messageId: "msg-123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data: ShippingUpdateEmailData = {
        customerName: "Test User",
        orderNumber: "ORD-12345",
        trackingNumber: "TRK-67890",
        carrier: "FedEx",
        estimatedDelivery: "2024-01-20",
        trackingUrl: "https://tracking.example.com/TRK-67890",
      };

      const result = await emailService.sendShippingUpdateEmail(
        "test@example.com",
        data
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        template: "shipping_update",
        data,
        replyTo: undefined,
      });
    });
  });
});
