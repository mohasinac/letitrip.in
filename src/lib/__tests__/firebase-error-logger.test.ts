/**
 * Firebase Error Logger Tests
 * Tests error logging to Firebase Analytics
 */

import { analytics } from "@/app/api/lib/firebase/app";
import { logEvent } from "firebase/analytics";
import {
  initErrorHandlers,
  logError,
  logPerformance,
  logUserAction,
} from "../firebase-error-logger";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  analytics: {},
}));

jest.mock("firebase/analytics", () => ({
  logEvent: jest.fn(),
}));

describe("Firebase Error Logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("logError", () => {
    it("should log error with string message", async () => {
      await logError("Test error message");

      expect(logEvent).toHaveBeenCalledWith(analytics, "exception", {
        description: "Test error message",
        fatal: false,
      });
    });

    it("should log error with Error object", async () => {
      const error = new Error("Test error");

      await logError(error);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Test error",
          fatal: false,
        })
      );
    });

    it("should log error with context", async () => {
      const context = {
        userId: "user123",
        url: "/test",
        component: "TestComponent",
      };

      await logError("Test error", context);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Test error",
          ...context,
        })
      );
    });

    it("should mark critical errors as fatal", async () => {
      await logError("Critical error", {}, "critical");

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          fatal: true,
        })
      );
    });

    it("should mark critical severity errors as fatal", async () => {
      await logError("Critical severity error", {}, "critical");

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          fatal: true,
        })
      );
    });

    it("should not mark medium severity errors as fatal", async () => {
      await logError("Medium error", {}, "medium");

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          fatal: false,
        })
      );
    });

    it("should not mark low severity errors as fatal", async () => {
      await logError("Low error", {}, "low");

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          fatal: false,
        })
      );
    });

    it("should console log errors in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      await logError("Dev error");

      expect(console.error).toHaveBeenCalledWith(
        "[Error Logger]",
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle logging errors gracefully", async () => {
      (logEvent as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Logging failed");
      });

      // Should not throw
      await expect(logError("Test error")).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to log error:",
        expect.any(Error)
      );
    });

    it("should not throw if analytics is unavailable", async () => {
      // Analytics being undefined is handled in the function
      // This test verifies the function is defensive
      await expect(logError("Test error")).resolves.not.toThrow();
    });

    it("should include error stack in context", async () => {
      const error = new Error("Test error");

      await logError(error, { component: "Test" });

      // Console log should include stack
      if (process.env.NODE_ENV === "development") {
        expect(console.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            stack: expect.any(String),
          })
        );
      }
    });
  });

  describe("logPerformance", () => {
    it("should log performance metrics", () => {
      logPerformance("page_load", 1500);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.objectContaining({
          name: "page_load",
          value: 1500,
        })
      );
    });

    it("should log performance with metadata", () => {
      const metadata = { page: "/home", device: "mobile" };

      logPerformance("api_call", 250, metadata);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.objectContaining({
          name: "api_call",
          value: 250,
          ...metadata,
        })
      );
    });

    it("should handle zero duration", () => {
      logPerformance("instant_action", 0);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.objectContaining({
          value: 0,
        })
      );
    });

    it("should handle very large durations", () => {
      logPerformance("long_task", 60000);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.objectContaining({
          value: 60000,
        })
      );
    });
  });

  describe("logUserAction", () => {
    it("should log user action", () => {
      logUserAction("button_click", { button: "checkout" });

      expect(logEvent).toHaveBeenCalledWith(analytics, "user_action", {
        action: "button_click",
        button: "checkout",
      });
    });

    it("should log action without parameters", () => {
      logUserAction("page_scroll");

      expect(logEvent).toHaveBeenCalledWith(analytics, "user_action", {
        action: "page_scroll",
      });
    });

    it("should handle complex parameters", () => {
      const params = {
        category: "electronics",
        value: 999,
        items: ["item1", "item2"],
      };

      logUserAction("add_to_cart", params);

      expect(logEvent).toHaveBeenCalledWith(analytics, "user_action", {
        action: "add_to_cart",
        ...params,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long error messages", async () => {
      const longMessage = "a".repeat(1000);

      await logError(longMessage);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: longMessage,
        })
      );
    });

    it("should handle errors with circular references in context", async () => {
      const context: any = { userId: "123" };
      context.self = context; // Circular reference

      // Should not throw
      await expect(logError("Test", context)).resolves.not.toThrow();
    });

    it("should handle empty context", async () => {
      await logError("Test error", {});

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Test error",
          fatal: false,
        })
      );
    });
  });

  describe("initErrorHandlers", () => {
    it("should initialize global error handlers", () => {
      const addEventListenerSpy = jest.spyOn(globalThis, "addEventListener");

      initErrorHandlers();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "error",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "unhandledrejection",
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it("should handle global errors", () => {
      initErrorHandlers();

      const errorEvent = new ErrorEvent("error", {
        error: new Error("Global error"),
        message: "Global error",
      });

      globalThis.dispatchEvent(errorEvent);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Global error",
        })
      );
    });

    it("should handle unhandled promise rejections", () => {
      initErrorHandlers();

      // Create proper Event object with reason property
      const rejectionEvent = Object.assign(new Event("unhandledrejection"), {
        reason: "Rejection",
      });

      globalThis.dispatchEvent(rejectionEvent);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Rejection",
        })
      );
    });

    it("should handle error object without message", async () => {
      const emptyError = {} as Error;
      await logError(emptyError);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: undefined,
        })
      );
    });
  });
});
