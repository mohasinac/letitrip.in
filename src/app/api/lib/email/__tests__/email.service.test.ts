import { EmailOptions, EmailService } from "../email.service";

// Mock fetch globally
global.fetch = jest.fn();

describe("EmailService", () => {
  let emailService: EmailService;
  const originalEnv = process.env;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Constructor", () => {
    it("should initialize with environment variables", () => {
      process.env.RESEND_API_KEY = "test_api_key";
      process.env.EMAIL_FROM = "test@example.com";
      process.env.EMAIL_FROM_NAME = "Test App";

      const service = new EmailService();

      expect(service).toBeDefined();
      expect(service["apiKey"]).toBe("test_api_key");
      expect(service["fromEmail"]).toBe("test@example.com");
      expect(service["fromName"]).toBe("Test App");
      expect(service["isConfigured"]).toBe(true);
    });

    it("should use default values when env vars not set", () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
      delete process.env.EMAIL_FROM_NAME;

      const service = new EmailService();

      expect(service["apiKey"]).toBe("");
      expect(service["fromEmail"]).toBe("noreply@letitrip.in");
      expect(service["fromName"]).toBe("Letitrip");
      expect(service["isConfigured"]).toBe(false);
    });

    it("should throw error in production without API key", () => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "production";

      expect(() => new EmailService()).toThrow(
        "⚠️ Email service not configured. Set RESEND_API_KEY in environment variables."
      );
    });

    it("should warn in development without API key", () => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      new EmailService();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️ Email service not configured. Set RESEND_API_KEY in environment variables."
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("send()", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "test_api_key";
      process.env.EMAIL_FROM = "test@example.com";
      process.env.EMAIL_FROM_NAME = "Test App";
      emailService = new EmailService();
    });

    it("should send email successfully", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "email_123" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
        text: "Test content",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("email_123");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test_api_key",
          },
          body: JSON.stringify({
            from: "Test App <test@example.com>",
            to: ["user@example.com"],
            subject: "Test Email",
            html: "<p>Test content</p>",
            text: "Test content",
            reply_to: undefined,
          }),
        })
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✅ Email sent successfully:",
        "email_123"
      );

      consoleLogSpy.mockRestore();
    });

    it("should send email to multiple recipients", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "email_456" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const options: EmailOptions = {
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: JSON.stringify({
            from: "Test App <test@example.com>",
            to: ["user1@example.com", "user2@example.com"],
            subject: "Test Email",
            html: "<p>Test content</p>",
            text: undefined,
            reply_to: undefined,
          }),
        })
      );
    });

    it("should use custom from address when provided", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "email_789" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
        from: "Custom <custom@example.com>",
      };

      await emailService.send(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: JSON.stringify({
            from: "Custom <custom@example.com>",
            to: ["user@example.com"],
            subject: "Test Email",
            html: "<p>Test content</p>",
            text: undefined,
            reply_to: undefined,
          }),
        })
      );
    });

    it("should include replyTo when provided", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "email_101" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
        replyTo: "reply@example.com",
      };

      await emailService.send(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: JSON.stringify({
            from: "Test App <test@example.com>",
            to: ["user@example.com"],
            subject: "Test Email",
            html: "<p>Test content</p>",
            text: undefined,
            reply_to: "reply@example.com",
          }),
        })
      );
    });

    it("should handle API error response", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ message: "Invalid API key" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid API key");
      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Email sending failed:", {
        message: "Invalid API key",
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle API error response without message", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({}),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send email");
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Email service error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle non-Error exceptions", async () => {
      mockFetch.mockRejectedValueOnce("String error");

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email service error");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Email service error:",
        "String error"
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("send() - Development Mode", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";
      emailService = new EmailService();
    });

    it("should log email details in development without API key", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content with lots of text that should be truncated</p>".repeat(
          10
        ),
        text: "Test content text".repeat(20),
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^dev-\d+$/);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "📧 [EMAIL SERVICE - DEV MODE]"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "From:",
        "Letitrip <noreply@letitrip.in>"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith("To:", "user@example.com");
      expect(consoleLogSpy).toHaveBeenCalledWith("Subject:", "Test Email");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "HTML Preview:",
        expect.stringContaining("Test content")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Text:",
        expect.stringContaining("Test content")
      );
      expect(mockFetch).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it("should log email without text field in development", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      const options: EmailOptions = {
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await emailService.send(options);

      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "📧 [EMAIL SERVICE - DEV MODE]"
      );
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        "Text:",
        expect.anything()
      );

      consoleLogSpy.mockRestore();
    });

    it("should return error if not configured in non-development mode", async () => {
      process.env.NODE_ENV = "test";
      const service = new EmailService();

      const options: EmailOptions = {
        to: "user@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      };

      const result = await service.send(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Email service not configured. Please add RESEND_API_KEY to environment variables."
      );
    });
  });

  describe("sendVerificationEmail()", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "test_api_key";
      emailService = new EmailService();
    });

    it("should send verification email with correct template", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "verify_123" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const result = await emailService.sendVerificationEmail(
        "user@example.com",
        "John Doe",
        "https://example.com/verify?token=abc123"
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("verify_123");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: expect.stringContaining("Verify your email address - Letitrip"),
        })
      );

      const callBody = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit).body as string
      );
      expect(callBody.to).toEqual(["user@example.com"]);
      expect(callBody.subject).toBe("Verify your email address - Letitrip");
      expect(callBody.html).toContain("John Doe");
      expect(callBody.html).toContain(
        "https://example.com/verify?token=abc123"
      );
      expect(callBody.text).toContain("John Doe");
      expect(callBody.text).toContain(
        "https://example.com/verify?token=abc123"
      );
    });

    it("should handle verification email sending failure", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ message: "Rate limit exceeded" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const result = await emailService.sendVerificationEmail(
        "user@example.com",
        "John Doe",
        "https://example.com/verify?token=abc123"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rate limit exceeded");
    });
  });

  describe("sendPasswordResetEmail()", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "test_api_key";
      emailService = new EmailService();
    });

    it("should send password reset email with correct template", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "reset_456" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const result = await emailService.sendPasswordResetEmail(
        "user@example.com",
        "Jane Smith",
        "https://example.com/reset?token=xyz789"
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("reset_456");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: expect.stringContaining("Reset your password - Letitrip"),
        })
      );

      const callBody = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit).body as string
      );
      expect(callBody.to).toEqual(["user@example.com"]);
      expect(callBody.subject).toBe("Reset your password - Letitrip");
      expect(callBody.html).toContain("Jane Smith");
      expect(callBody.html).toContain("https://example.com/reset?token=xyz789");
      expect(callBody.text).toContain("Jane Smith");
      expect(callBody.text).toContain("https://example.com/reset?token=xyz789");
    });

    it("should handle password reset email sending failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Service unavailable"));

      const result = await emailService.sendPasswordResetEmail(
        "user@example.com",
        "Jane Smith",
        "https://example.com/reset?token=xyz789"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Service unavailable");
    });
  });

  describe("sendWelcomeEmail()", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "test_api_key";
      emailService = new EmailService();
    });

    it("should send welcome email with correct template", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "welcome_789" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const result = await emailService.sendWelcomeEmail(
        "user@example.com",
        "Alice Johnson"
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("welcome_789");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: expect.stringContaining("Welcome to Letitrip! 🎉"),
        })
      );

      const callBody = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit).body as string
      );
      expect(callBody.to).toEqual(["user@example.com"]);
      expect(callBody.subject).toBe("Welcome to Letitrip! 🎉");
      expect(callBody.html).toContain("Alice Johnson");
      expect(callBody.text).toContain("Alice Johnson");
    });

    it("should handle welcome email sending failure", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ message: "Invalid recipient" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const result = await emailService.sendWelcomeEmail(
        "invalid-email",
        "Alice Johnson"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid recipient");
    });
  });

  describe("Integration scenarios", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "test_api_key";
      emailService = new EmailService();
    });

    it("should handle multiple emails in sequence", async () => {
      const mockResponse1 = {
        ok: true,
        json: async () => ({ id: "email_1" }),
      };
      const mockResponse2 = {
        ok: true,
        json: async () => ({ id: "email_2" }),
      };
      const mockResponse3 = {
        ok: true,
        json: async () => ({ id: "email_3" }),
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse1 as Response)
        .mockResolvedValueOnce(mockResponse2 as Response)
        .mockResolvedValueOnce(mockResponse3 as Response);

      const result1 = await emailService.sendVerificationEmail(
        "user1@example.com",
        "User One",
        "https://example.com/verify1"
      );
      const result2 = await emailService.sendPasswordResetEmail(
        "user2@example.com",
        "User Two",
        "https://example.com/reset2"
      );
      const result3 = await emailService.sendWelcomeEmail(
        "user3@example.com",
        "User Three"
      );

      expect(result1.success).toBe(true);
      expect(result1.messageId).toBe("email_1");
      expect(result2.success).toBe(true);
      expect(result2.messageId).toBe("email_2");
      expect(result3.success).toBe(true);
      expect(result3.messageId).toBe("email_3");
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed success and failure", async () => {
      const mockResponse1 = {
        ok: true,
        json: async () => ({ id: "email_success" }),
      };
      const mockResponse2 = {
        ok: false,
        json: async () => ({ message: "Failed" }),
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse1 as Response)
        .mockResolvedValueOnce(mockResponse2 as Response);

      const result1 = await emailService.sendWelcomeEmail(
        "user@example.com",
        "User"
      );
      const result2 = await emailService.sendVerificationEmail(
        "invalid@example.com",
        "Invalid",
        "https://example.com/verify"
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });
  });
});
