/**
 * @jest-environment jsdom
 */

import {
  logClientError,
  logClientWarning,
  logClientInfo,
  logClientDebug,
  logApiError,
  logValidationError,
  logNavigationError,
  logAuthError,
  logUploadError,
  logPaymentError,
  logApplicationError,
  initializeClientLogger,
} from "../error-logger";
import { logger } from "@/classes";

jest.mock("@/classes", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Error Logger Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logClientError()", () => {
    it("should log error message", () => {
      const error = new Error("Test error");
      logClientError("Test message", error);

      expect(logger.error).toHaveBeenCalled();
    });

    it("should include context data", () => {
      const error = new Error("Test error");
      const context = { userId: "user123", component: "TestComponent" };

      logClientError("Test message", error, context);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });

    it("should handle Error objects", () => {
      const error = new Error("Test error");
      logClientError("Error logged", error);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].error).toEqual(
        expect.objectContaining({
          name: "Error",
          message: "Test error",
        }),
      );
    });

    it("should handle non-Error objects", () => {
      logClientError("Unknown error", "String error");

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].error).toBe("String error");
    });

    it("should include timestamp", () => {
      logClientError("Test message", new Error("Test"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].timestamp).toBeTruthy();
    });

    it("should include user agent", () => {
      logClientError("Test message", new Error("Test"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].userAgent).toBeTruthy();
    });
  });

  describe("logClientWarning()", () => {
    it("should log warning message", () => {
      logClientWarning("Test warning");

      expect(logger.warn).toHaveBeenCalled();
    });

    it("should include context data", () => {
      const context = { component: "TestComponent" };
      logClientWarning("Test warning", context);

      expect(logger.warn).toHaveBeenCalled();
      const callArgs = (logger.warn as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });

    it("should include timestamp", () => {
      logClientWarning("Test warning");

      expect(logger.warn).toHaveBeenCalled();
      const callArgs = (logger.warn as jest.Mock).mock.calls[0];
      expect(callArgs[1].timestamp).toBeTruthy();
    });
  });

  describe("logClientInfo()", () => {
    it("should log info message", () => {
      logClientInfo("Test info");

      expect(logger.info).toHaveBeenCalled();
    });

    it("should include context data", () => {
      const context = { action: "test-action" };
      logClientInfo("Test info", context);

      expect(logger.info).toHaveBeenCalled();
      const callArgs = (logger.info as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });

    it("should include timestamp", () => {
      logClientInfo("Test info");

      expect(logger.info).toHaveBeenCalled();
      const callArgs = (logger.info as jest.Mock).mock.calls[0];
      expect(callArgs[1].timestamp).toBeTruthy();
    });
  });

  describe("logClientDebug()", () => {
    it("should log debug message", () => {
      logClientDebug("Test debug");

      expect(logger.debug).toHaveBeenCalled();
    });

    it("should include context data", () => {
      const context = { value: "test-value" };
      logClientDebug("Test debug", context);

      expect(logger.debug).toHaveBeenCalled();
      const callArgs = (logger.debug as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });

    it("should include timestamp", () => {
      logClientDebug("Test debug");

      expect(logger.debug).toHaveBeenCalled();
      const callArgs = (logger.debug as jest.Mock).mock.calls[0];
      expect(callArgs[1].timestamp).toBeTruthy();
    });
  });

  describe("logApiError()", () => {
    const createMockResponse = (
      body: string,
      status: number,
      statusText: string,
    ) => {
      return {
        status,
        statusText,
        clone: jest.fn().mockReturnValue({
          json: jest.fn().mockResolvedValue(JSON.parse(body)),
          text: jest.fn().mockResolvedValue(body),
        }),
      } as unknown as Response;
    };

    it("should log API error for successful response", async () => {
      const response = createMockResponse(
        JSON.stringify({ error: "Not found" }),
        404,
        "Not Found",
      );

      await logApiError("/api/test", response);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].status).toBe(404);
      expect(callArgs[1].endpoint).toBe("/api/test");
    });

    it("should handle JSON response body", async () => {
      const response = createMockResponse(
        JSON.stringify({ error: "Server error" }),
        500,
        "Internal Server Error",
      );

      await logApiError("/api/error", response);

      expect(logger.error).toHaveBeenCalled();
    });

    it("should include context data", async () => {
      const response = createMockResponse(
        JSON.stringify({ error: "Test" }),
        400,
        "Bad Request",
      );
      const context = { userId: "user123" };

      await logApiError("/api/test", response, context);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("logValidationError()", () => {
    it("should log validation errors", () => {
      const errors = {
        email: "Invalid email",
        password: "Password too short",
      };

      logValidationError("LoginForm", errors);

      expect(logger.warn).toHaveBeenCalled();
      const callArgs = (logger.warn as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("LoginForm");
      expect(callArgs[1].validationErrors).toEqual(errors);
    });

    it("should include form name in context", () => {
      logValidationError("SignupForm", { username: "Required" });

      expect(logger.warn).toHaveBeenCalled();
      const callArgs = (logger.warn as jest.Mock).mock.calls[0];
      expect(callArgs[1].formName).toBe("SignupForm");
    });

    it("should include additional context", () => {
      const context = { userId: "user123" };
      logValidationError("ProfileForm", { age: "Invalid" }, context);

      expect(logger.warn).toHaveBeenCalled();
      const callArgs = (logger.warn as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("logNavigationError()", () => {
    it("should log navigation errors", () => {
      const error = new Error("Route not found");

      logNavigationError("/unknown-route", error);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("/unknown-route");
      expect(callArgs[1].route).toBe("/unknown-route");
    });

    it("should mark as navigation error", () => {
      logNavigationError("/test", new Error("Test"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].type).toBe("navigation");
    });

    it("should include additional context", () => {
      const context = { userId: "user123" };
      logNavigationError("/admin", new Error("Unauthorized"), context);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("logAuthError()", () => {
    it("should log authentication errors", () => {
      const error = new Error("Invalid credentials");

      logAuthError("login", error);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("login");
      expect(callArgs[1].operation).toBe("login");
    });

    it("should mark as authentication error", () => {
      logAuthError("signup", new Error("Test"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].type).toBe("authentication");
    });

    it("should include additional context", () => {
      const context = { provider: "google" };
      logAuthError("oauth", new Error("OAuth failed"), context);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("logUploadError()", () => {
    it("should log upload errors", () => {
      const error = new Error("File too large");

      logUploadError("profile.jpg", error);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("profile.jpg");
      expect(callArgs[1].fileName).toBe("profile.jpg");
    });

    it("should mark as upload error", () => {
      logUploadError("document.pdf", new Error("Test"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].type).toBe("upload");
    });

    it("should include additional context", () => {
      const context = { userId: "user123", size: 5242880 };
      logUploadError("large.zip", new Error("Upload failed"), context);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("logPaymentError()", () => {
    it("should log payment errors", () => {
      const error = new Error("Payment declined");

      logPaymentError("txn-12345", error);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("txn-12345");
      expect(callArgs[1].transactionId).toBe("txn-12345");
    });

    it("should mark as payment error", () => {
      logPaymentError("txn-67890", new Error("Test"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1].type).toBe("payment");
    });

    it("should include additional context", () => {
      const context = { amount: 100, currency: "USD" };
      logPaymentError("txn-99999", new Error("Payment failed"), context);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("logApplicationError()", () => {
    it("should log application errors with category", () => {
      const error = new Error("Database connection failed");

      logApplicationError("DATABASE", "Connection failed", error);

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("DATABASE");
      expect(callArgs[1].category).toBe("DATABASE");
    });

    it("should include error details", () => {
      logApplicationError("API", "Request timeout", new Error("Timeout"));

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(
        expect.objectContaining({
          category: "API",
        }),
      );
    });

    it("should include additional context", () => {
      const context = { endpoint: "/api/data" };
      logApplicationError(
        "FETCH",
        "Failed to fetch data",
        new Error("Network error"),
        context,
      );

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(expect.objectContaining(context));
    });
  });

  describe("initializeClientLogger()", () => {
    it("should initialize without throwing", () => {
      expect(() => initializeClientLogger()).not.toThrow();
    });

    it("should set up global error handlers", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      initializeClientLogger();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "unhandledrejection",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );

      addEventListenerSpy.mockRestore();
    });

    it("should handle global errors", () => {
      initializeClientLogger();

      const event = new ErrorEvent("error", {
        message: "Test error",
        filename: "test.js",
        lineno: 10,
        colno: 5,
        error: new Error("Test"),
      });

      window.dispatchEvent(event);

      // Logger should be called by the event handler
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
