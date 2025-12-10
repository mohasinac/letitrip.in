/**
 * Unit Tests for Email Service
 * Tests Resend API integration and email sending
 *
 * TESTS COVER:
 * - EmailService constructor with environment validation
 * - send() method with dev/production modes
 * - sendVerificationEmail template generation
 * - sendPasswordResetEmail template generation
 * - sendWelcomeEmail template generation
 * - Error handling and API failures
 * - Dev mode console logging
 *
 * CODE ISSUES FOUND:
 * 1. Production throws error if RESEND_API_KEY missing - should fail gracefully
 * 2. No retry logic for failed API calls
 * 3. No rate limiting protection
 * 4. API key exposed in error messages potentially
 * 5. No email validation before sending
 * 6. No timeout handling for fetch calls
 * 7. Dev mode logs sensitive data (email addresses) - GDPR concern
 * 8. No structured logging - console.log in production
 * 9. Subject lines hardcoded - not configurable
 * 10. No support for attachments
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock email templates
jest.mock("@/app/api/lib/email/templates/verification.template", () => ({
  getVerificationEmailTemplate: jest
    .fn()
    .mockReturnValue("<html>Verification Email</html>"),
  getVerificationEmailText: jest
    .fn()
    .mockReturnValue("Verification Email Text"),
}));

jest.mock("@/app/api/lib/email/templates/password-reset.template", () => ({
  getPasswordResetEmailTemplate: jest
    .fn()
    .mockReturnValue("<html>Reset Email</html>"),
  getPasswordResetEmailText: jest.fn().mockReturnValue("Reset Email Text"),
}));

jest.mock("@/app/api/lib/email/templates/welcome.template", () => ({
  getWelcomeEmailTemplate: jest
    .fn()
    .mockReturnValue("<html>Welcome Email</html>"),
  getWelcomeEmailText: jest.fn().mockReturnValue("Welcome Email Text"),
}));

import {
  getPasswordResetEmailTemplate,
  getPasswordResetEmailText,
} from "@/app/api/lib/email/templates/password-reset.template";
import {
  getVerificationEmailTemplate,
  getVerificationEmailText,
} from "@/app/api/lib/email/templates/verification.template";
import {
  getWelcomeEmailTemplate,
  getWelcomeEmailText,
} from "@/app/api/lib/email/templates/welcome.template";

// Import the class and singleton
import {
  EmailService,
  emailService as defaultEmailService,
} from "@/app/api/lib/email/email.service";

describe("EmailService", () => {
  let emailService: EmailService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "development";
    delete process.env.RESEND_API_KEY;

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();

    // Create new instance for each test
    emailService = new EmailService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Constructor", () => {
    it("should initialize in dev mode without API key", () => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";

      const service = new EmailService();
      expect(service).toBeDefined();
    });

    it("should initialize in production with API key", () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.NODE_ENV = "production";

      const service = new EmailService();
      expect(service).toBeDefined();
    });

    it("should throw error in production without API key", () => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "production";

      expect(() => new EmailService()).toThrow("Email service not configured");
    });

    it("should use default sender email", () => {
      process.env.RESEND_API_KEY = "re_test_key";
      delete process.env.EMAIL_FROM;
      delete process.env.EMAIL_FROM_NAME;

      const service = new EmailService();
      expect(service).toBeDefined();
    });

    it("should use custom sender email from env", () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.EMAIL_FROM = "custom@example.com";
      process.env.EMAIL_FROM_NAME = "Custom Sender";

      const service = new EmailService();
      expect(service).toBeDefined();
    });
  });

  describe("send() - Dev Mode", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";
      emailService = new EmailService();
    });

    it("should log email in dev mode", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test Text",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[EMAIL SERVICE - DEV MODE]")
      );
      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^dev-\d+$/);

      consoleSpy.mockRestore();
    });

    it("should not call Resend API in dev mode", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(global.fetch).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle array of recipients in dev mode", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.send({
        to: ["test1@example.com", "test2@example.com"],
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should log all email fields in dev mode", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.send({
        to: "test@example.com",
        subject: "Subject",
        html: "<p>HTML</p>",
        text: "Text",
      });

      // Check that multiple log calls were made
      expect(consoleSpy).toHaveBeenCalled();
      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("test@example.com");
      expect(allLogs).toContain("Subject");

      consoleSpy.mockRestore();
    });
  });

  describe("send() - Production Mode", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key_123";
      process.env.NODE_ENV = "production";
      emailService = new EmailService();
    });

    it("should call Resend API with correct data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_123" }),
      });

      await emailService.send({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test</p>",
        text: "Test",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer re_test_key_123",
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should include correct email payload", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_123" }),
      });

      await emailService.send({
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>HTML Content</p>",
        text: "Text Content",
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);

      // API converts string to to array
      expect(body.to).toEqual(["recipient@example.com"]);
      expect(body.subject).toBe("Test Subject");
      expect(body.html).toBe("<p>HTML Content</p>");
      expect(body.text).toBe("Text Content");
    });

    it("should return success with messageId", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_abc123" }),
      });

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg_abc123");
      expect(result.error).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Email sent successfully:"),
        "msg_abc123"
      );

      consoleSpy.mockRestore();
    });

    it("should handle API error responses", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Bad Request",
        json: async () => ({ message: "Invalid email address" }),
      });

      const result = await emailService.send({
        to: "invalid-email",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");

      consoleSpy.mockRestore();
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    it("should handle array of recipients", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_123" }),
      });

      await emailService.send({
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test",
        html: "<p>Test</p>",
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);

      expect(body.to).toEqual(["user1@example.com", "user2@example.com"]);
    });

    it("should handle missing response body", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
        json: async () => ({}),
      });

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      // Code returns "Failed to send email" when message is missing
      expect(result.error).toBe("Failed to send email");
    });

    it("should log errors on API failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

      await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Email service error:"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("sendVerificationEmail()", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";
      emailService = new EmailService();
    });

    it("should generate verification email template", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendVerificationEmail(
        "user@example.com",
        "John Doe",
        "https://example.com/verify?token=abc123"
      );

      // Template mocks are called
      expect(getVerificationEmailTemplate).toHaveBeenCalledWith(
        "John Doe",
        "https://example.com/verify?token=abc123"
      );
      expect(getVerificationEmailText).toHaveBeenCalledWith(
        "John Doe",
        "https://example.com/verify?token=abc123"
      );

      consoleSpy.mockRestore();
    });

    it("should use correct subject", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendVerificationEmail(
        "user@example.com",
        "Jane",
        "https://example.com/verify"
      );

      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("Verify your email address");

      consoleSpy.mockRestore();
    });

    it("should send to correct recipient", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendVerificationEmail(
        "specific@example.com",
        "User",
        "https://example.com/verify"
      );

      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("specific@example.com");

      consoleSpy.mockRestore();
    });
  });

  describe("sendPasswordResetEmail()", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";
      emailService = new EmailService();
    });

    it("should generate password reset email template", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendPasswordResetEmail(
        "user@example.com",
        "John Smith",
        "https://example.com/reset?token=xyz789"
      );

      // Template mocks are called
      expect(getPasswordResetEmailTemplate).toHaveBeenCalledWith(
        "John Smith",
        "https://example.com/reset?token=xyz789"
      );
      expect(getPasswordResetEmailText).toHaveBeenCalledWith(
        "John Smith",
        "https://example.com/reset?token=xyz789"
      );

      consoleSpy.mockRestore();
    });

    it("should use correct subject", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendPasswordResetEmail(
        "user@example.com",
        "User",
        "https://example.com/reset"
      );

      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("Reset your password");

      consoleSpy.mockRestore();
    });

    it("should handle special characters in name", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendPasswordResetEmail(
        "user@example.com",
        "O'Connor-Smith",
        "https://example.com/reset"
      );

      // Template mocks are called
      expect(getPasswordResetEmailTemplate).toHaveBeenCalledWith(
        "O'Connor-Smith",
        "https://example.com/reset"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("sendWelcomeEmail()", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";
      emailService = new EmailService();
    });

    it("should generate welcome email template", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendWelcomeEmail("user@example.com", "Alice Wonder");

      // Template mocks are called
      expect(getWelcomeEmailTemplate).toHaveBeenCalledWith("Alice Wonder");
      expect(getWelcomeEmailText).toHaveBeenCalledWith("Alice Wonder");

      consoleSpy.mockRestore();
    });

    it("should use correct subject with emoji", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendWelcomeEmail("user@example.com", "User");

      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("Welcome to Letitrip");
      expect(allLogs).toContain("🎉");

      consoleSpy.mockRestore();
    });

    it("should send to correct recipient", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendWelcomeEmail("newuser@example.com", "New User");

      const allLogs = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allLogs).toContain("newuser@example.com");

      consoleSpy.mockRestore();
    });

    it("should handle empty name gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await emailService.sendWelcomeEmail("user@example.com", "");

      // Template mocks are called
      expect(getWelcomeEmailTemplate).toHaveBeenCalledWith("");

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.NODE_ENV = "production";
      emailService = new EmailService();
    });

    it("should handle empty subject", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_123" }),
      });

      await emailService.send({
        to: "test@example.com",
        subject: "",
        html: "<p>Test</p>",
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it("should handle very long subject", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_123" }),
      });

      const longSubject = "A".repeat(500);
      await emailService.send({
        to: "test@example.com",
        subject: longSubject,
        html: "<p>Test</p>",
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it("should handle HTML without text fallback", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg_123" }),
      });

      await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);
      expect(body.text).toBeUndefined();
    });

    it("should handle malformed JSON response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Error",
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
    });

    it("should handle timeout errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Request timeout")
      );

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");
    });

    it("should handle rate limit errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Too Many Requests",
        json: async () => ({ message: "Rate limit exceeded" }),
      });

      const result = await emailService.send({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Rate limit");
    });
  });

  describe("Singleton Instance", () => {
    it("should export emailService instance", () => {
      expect(defaultEmailService).toBeDefined();
    });
  });
});
