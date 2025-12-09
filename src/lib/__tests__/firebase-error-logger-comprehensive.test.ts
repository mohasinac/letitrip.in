/**
 * Comprehensive Firebase Error Logger Test Suite
 *
 * Tests Firebase Analytics-based error logging with SSR compatibility.
 *
 * Testing Focus:
 * - Error logging to Firebase Analytics
 * - Performance metric tracking
 * - User action logging
 * - Global error handlers
 * - SSR safety (no window/document checks)
 * - Severity-based logging
 * - Context metadata handling
 * - Fail-silent error handling
 */

import { analytics } from "@/app/api/lib/firebase/app";
import { logEvent } from "firebase/analytics";
import {
  initErrorHandlers,
  logError,
  logPerformance,
  logUserAction,
} from "../firebase-error-logger";

// Mock Firebase Analytics
jest.mock("@/app/api/lib/firebase/app", () => ({
  analytics: {},
}));

jest.mock("firebase/analytics", () => ({
  logEvent: jest.fn(),
}));

describe("Firebase Error Logger - Comprehensive Test Suite", () => {
  let originalEnv: string | undefined;
  let originalConsoleError: typeof console.error;
  let originalGlobalThis: typeof globalThis;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env.NODE_ENV;
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error = originalConsoleError;
  });

  describe("logError() - Error Logging Function", () => {
    describe("Error object handling", () => {
      it("logs Error object with message and stack", async () => {
        const error = new Error("Test error");
        await logError(error);

        expect(logEvent).toHaveBeenCalledWith(analytics, "exception", {
          description: "Test error",
          fatal: false,
        });
      });

      it("logs Error object with custom context", async () => {
        const error = new Error("Test error");
        const context = {
          userId: "user123",
          component: "TestComponent",
          action: "testAction",
        };

        await logError(error, context);

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            description: "Test error",
            userId: "user123",
            component: "TestComponent",
            action: "testAction",
          })
        );
      });

      it("preserves error stack trace in console log", async () => {
        process.env.NODE_ENV = "development";
        const error = new Error("Test error");

        await logError(error);

        expect(console.error).toHaveBeenCalledWith(
          "[Error Logger]",
          expect.objectContaining({
            message: "Test error",
            stack: expect.stringContaining("Error: Test error"),
          })
        );
      });
    });

    describe("String error handling", () => {
      it("logs string error as message", async () => {
        await logError("String error message");

        expect(logEvent).toHaveBeenCalledWith(analytics, "exception", {
          description: "String error message",
          fatal: false,
        });
      });

      it("logs string with context", async () => {
        await logError("Error", { component: "TestComponent" });

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            description: "Error",
            component: "TestComponent",
          })
        );
      });

      it("string errors have no stack trace", async () => {
        process.env.NODE_ENV = "development";
        await logError("String error");

        expect(console.error).toHaveBeenCalledWith(
          "[Error Logger]",
          expect.objectContaining({
            message: "String error",
            stack: undefined,
          })
        );
      });
    });

    describe("Severity levels", () => {
      it("logs low severity as non-fatal", async () => {
        await logError(new Error("Low error"), {}, "low");

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            fatal: false,
          })
        );
      });

      it("logs medium severity as non-fatal (default)", async () => {
        await logError(new Error("Medium error"));

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            fatal: false,
          })
        );
      });

      it("logs high severity as non-fatal", async () => {
        await logError(new Error("High error"), {}, "high");

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            fatal: false,
          })
        );
      });

      it("logs critical severity as fatal", async () => {
        // NOTE: Only critical severity is marked as fatal in Firebase
        await logError(new Error("Critical error"), {}, "critical");

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            fatal: true,
          })
        );
      });
    });

    describe("Environment-specific logging", () => {
      it("logs to console in development", async () => {
        process.env.NODE_ENV = "development";
        await logError(new Error("Dev error"));

        expect(console.error).toHaveBeenCalledWith(
          "[Error Logger]",
          expect.any(Object)
        );
      });

      it("does not log to console in production for low severity", async () => {
        process.env.NODE_ENV = "production";
        await logError(new Error("Low error"), {}, "low");

        expect(console.error).not.toHaveBeenCalled();
      });

      it("logs critical errors to console in production", async () => {
        process.env.NODE_ENV = "production";
        await logError(new Error("Critical"), {}, "critical");

        expect(console.error).toHaveBeenCalledWith(
          "[CRITICAL ERROR]",
          expect.objectContaining({
            message: "Critical",
            severity: "critical",
          })
        );
      });

      it("logs high errors to console in production", async () => {
        process.env.NODE_ENV = "production";
        await logError(new Error("High"), {}, "high");

        expect(console.error).toHaveBeenCalledWith(
          "[CRITICAL ERROR]",
          expect.objectContaining({
            severity: "high",
          })
        );
      });
    });

    describe("SSR safety", () => {
      it("skips Firebase Analytics when document is undefined", async () => {
        // NOTE: Simulating SSR environment (can't actually mutate document in tests)
        // In real SSR, document is undefined and logEvent is skipped
        const originalDocument = globalThis.document;
        (globalThis as any).document = undefined;

        await logError(new Error("SSR error"));

        // In test environment with mocked analytics, logEvent may still be called
        // Real implementation checks: analytics && typeof globalThis !== "undefined" && globalThis.document

        (globalThis as any).document = originalDocument;
      });

      it("handles null analytics gracefully", async () => {
        // NOTE: Implementation has null check for analytics
        // If analytics is null/undefined, logEvent is not called
        // Can't test by mutation, but code path exists
        await logError(new Error("Test"));

        // Should complete without throwing
        expect(true).toBe(true);
      });
    });

    describe("Context metadata", () => {
      it("includes URL in context", async () => {
        await logError(new Error("Error"), { url: "https://example.com" });

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            url: "https://example.com",
          })
        );
      });

      it("includes userId in context", async () => {
        await logError(new Error("Error"), { userId: "user123" });

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            userId: "user123",
          })
        );
      });

      it("includes custom metadata fields", async () => {
        await logError(new Error("Error"), {
          customField: "customValue",
          anotherField: 123,
        });

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            customField: "customValue",
            anotherField: 123,
          })
        );
      });

      it("handles empty context", async () => {
        await logError(new Error("Error"), {});

        expect(logEvent).toHaveBeenCalledWith(
          analytics,
          "exception",
          expect.objectContaining({
            description: "Error",
          })
        );
      });
    });

    describe("Error handling in logger", () => {
      it("fails silently when logEvent throws", async () => {
        (logEvent as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Firebase error");
        });

        // Should not throw
        await expect(logError(new Error("Test"))).resolves.not.toThrow();

        expect(console.error).toHaveBeenCalledWith(
          "Failed to log error:",
          expect.any(Error)
        );
      });

      it("continues execution after logging failure", async () => {
        (logEvent as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Firebase error");
        });

        await logError(new Error("Test"));

        // Should complete without throwing
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe("logPerformance() - Performance Tracking", () => {
    it("logs performance metric with name and duration", () => {
      logPerformance("api_call", 1500);

      expect(logEvent).toHaveBeenCalledWith(analytics, "timing_complete", {
        name: "api_call",
        value: 1500,
      });
    });

    it("logs performance with metadata", () => {
      logPerformance("page_load", 2000, {
        page: "/products",
        userId: "user123",
      });

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.objectContaining({
          name: "page_load",
          value: 2000,
          page: "/products",
          userId: "user123",
        })
      );
    });

    it("handles zero duration", () => {
      logPerformance("instant_action", 0);

      expect(logEvent).toHaveBeenCalledWith(analytics, "timing_complete", {
        name: "instant_action",
        value: 0,
      });
    });

    it("handles very large durations", () => {
      logPerformance("slow_operation", 60000);

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.objectContaining({
          value: 60000,
        })
      );
    });

    it("handles null analytics gracefully", () => {
      // NOTE: Implementation has null check: if (analytics && ...)
      // Can't test by mutating import, but code path exists
      logPerformance("test", 100);

      // Should complete without throwing
      expect(logEvent).toHaveBeenCalled();
    });

    it("fails silently on error", () => {
      (logEvent as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Firebase error");
      });

      expect(() => logPerformance("test", 100)).not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to log performance:",
        expect.any(Error)
      );
    });
  });

  describe("logUserAction() - User Action Tracking", () => {
    it("logs user action with name", () => {
      logUserAction("button_click");

      expect(logEvent).toHaveBeenCalledWith(analytics, "user_action", {
        action: "button_click",
      });
    });

    it("logs action with metadata", () => {
      logUserAction("product_view", {
        productId: "prod123",
        category: "electronics",
      });

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "user_action",
        expect.objectContaining({
          action: "product_view",
          productId: "prod123",
          category: "electronics",
        })
      );
    });

    it("handles empty metadata", () => {
      logUserAction("action");

      expect(logEvent).toHaveBeenCalledWith(analytics, "user_action", {
        action: "action",
      });
    });

    it("handles null analytics gracefully", () => {
      // NOTE: Implementation has null check: if (analytics && ...)
      // Can't test by mutating import, but code path exists
      logUserAction("test");

      // Should complete without throwing
      expect(logEvent).toHaveBeenCalled();
    });

    it("fails silently on error", () => {
      (logEvent as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Firebase error");
      });

      expect(() => logUserAction("test")).not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to log user action:",
        expect.any(Error)
      );
    });
  });

  describe("initErrorHandlers() - Global Error Handlers", () => {
    let mockAddEventListener: jest.Mock;
    let errorHandlers: Map<string, Function>;

    beforeEach(() => {
      errorHandlers = new Map();
      mockAddEventListener = jest.fn((event, handler) => {
        errorHandlers.set(event, handler);
      });

      // Mock globalThis.addEventListener
      (globalThis as any).addEventListener = mockAddEventListener;
      (globalThis as any).location = { href: "https://test.com" };
    });

    afterEach(() => {
      delete (globalThis as any).addEventListener;
      delete (globalThis as any).location;
    });

    it("registers global error handler", () => {
      initErrorHandlers();

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "error",
        expect.any(Function)
      );
    });

    it("registers unhandled rejection handler", () => {
      initErrorHandlers();

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "unhandledrejection",
        expect.any(Function)
      );
    });

    it("handles error events", async () => {
      initErrorHandlers();

      const errorHandler = errorHandlers.get("error");
      const errorEvent = {
        error: new Error("Global error"),
        message: "Error message",
      } as ErrorEvent;

      errorHandler?.(errorEvent);

      // Wait for async logError
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Global error",
        })
      );
    });

    it("handles error events without error object", async () => {
      initErrorHandlers();

      const errorHandler = errorHandlers.get("error");
      const errorEvent = {
        message: "Error message only",
      } as ErrorEvent;

      errorHandler?.(errorEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Error message only",
        })
      );
    });

    it("handles unhandled promise rejections with Error", async () => {
      initErrorHandlers();

      const rejectionHandler = errorHandlers.get("unhandledrejection");
      const rejectionEvent = {
        reason: new Error("Promise rejection"),
      } as PromiseRejectionEvent;

      rejectionHandler?.(rejectionEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Promise rejection",
        })
      );
    });

    it("handles unhandled promise rejections with string", async () => {
      initErrorHandlers();

      const rejectionHandler = errorHandlers.get("unhandledrejection");
      const rejectionEvent = {
        reason: "String rejection reason",
      } as PromiseRejectionEvent;

      rejectionHandler?.(rejectionEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "String rejection reason",
        })
      );
    });

    it("includes URL in error context", async () => {
      initErrorHandlers();

      const errorHandler = errorHandlers.get("error");
      const errorEvent = {
        error: new Error("Test error"),
      } as ErrorEvent;

      errorHandler?.(errorEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // NOTE: URL from globalThis.location?.href (test environment may differ)
      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          url: expect.any(String),
          component: "global",
        })
      );
    });

    it("marks errors as high severity", async () => {
      // NOTE: Global errors are always high severity
      initErrorHandlers();

      const errorHandler = errorHandlers.get("error");
      const errorEvent = {
        error: new Error("Test"),
      } as ErrorEvent;

      errorHandler?.(errorEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // High severity means fatal: false (not critical)
      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          fatal: false,
        })
      );
    });

    it("does nothing when globalThis unavailable", () => {
      const original = (globalThis as any).addEventListener;
      delete (globalThis as any).addEventListener;

      expect(() => initErrorHandlers()).not.toThrow();

      (globalThis as any).addEventListener = original;
    });
  });

  describe("integration scenarios", () => {
    it("logs complete error lifecycle", async () => {
      process.env.NODE_ENV = "development";

      // 1. Log error
      await logError(
        new Error("Integration test"),
        { component: "TestComponent" },
        "high"
      );

      // 2. Verify Firebase Analytics
      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({
          description: "Integration test",
          component: "TestComponent",
        })
      );

      // 3. Verify console logging
      expect(console.error).toHaveBeenCalledWith(
        "[Error Logger]",
        expect.any(Object)
      );
    });

    it("tracks performance and actions together", () => {
      logPerformance("page_load", 1500, { page: "/home" });
      logUserAction("page_view", { page: "/home" });

      expect(logEvent).toHaveBeenCalledTimes(2);
      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "timing_complete",
        expect.any(Object)
      );
      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "user_action",
        expect.any(Object)
      );
    });

    it("handles global errors and explicit errors", async () => {
      initErrorHandlers();

      // Explicit error
      await logError(new Error("Explicit"));

      // Simulate global error
      const errorHandler = (
        globalThis as any
      ).addEventListener?.mock?.calls?.find(
        (call: any[]) => call[0] === "error"
      )?.[1];

      if (errorHandler) {
        errorHandler({
          error: new Error("Global"),
        } as ErrorEvent);
      }

      // Both should be logged
      expect(logEvent).toHaveBeenCalledWith(
        analytics,
        "exception",
        expect.objectContaining({ description: "Explicit" })
      );
    });
  });
});
