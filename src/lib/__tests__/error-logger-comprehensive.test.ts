/**
 * Comprehensive Error Logger Test Suite
 *
 * Tests centralized error logging system with Firebase integration.
 *
 * Testing Focus:
 * - Error storage and retrieval
 * - Severity-based console output
 * - Firebase Analytics integration
 * - Helper functions (API, Service, Component, etc.)
 * - Error filtering and export
 * - Memory management (max stored errors)
 * - Environment-specific behavior
 */

import {
  ErrorLogger,
  ErrorSeverity,
  logAPIError,
  logAuthError,
  logComponentError,
  logError,
  logPerformanceIssue,
  logServiceError,
  logValidationError,
} from "../error-logger";
import * as firebaseErrorLogger from "../firebase-error-logger";

// Mock firebase-error-logger
jest.mock("../firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("Error Logger - Comprehensive Test Suite", () => {
  let originalEnv: string | undefined;
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleInfo: typeof console.info;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    ErrorLogger.clear();
    originalEnv = process.env.NODE_ENV;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleInfo = console.info;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
    console.log = originalConsoleLog;
  });

  describe("ErrorLogger.log() - Core Logging", () => {
    describe("Error storage", () => {
      it("stores error in memory", () => {
        ErrorLogger.log(new Error("Test error"));

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe("Test error");
      });

      it("stores error with context", () => {
        ErrorLogger.log(new Error("Test"), { component: "TestComp" });

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("TestComp");
      });

      it("stores error with severity", () => {
        ErrorLogger.log(new Error("Test"), {}, ErrorSeverity.CRITICAL);

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.CRITICAL);
      });

      it("stores error with timestamp", () => {
        const before = new Date();
        ErrorLogger.log(new Error("Test"));
        const after = new Date();

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].timestamp.getTime()).toBeGreaterThanOrEqual(
          before.getTime()
        );
        expect(errors[0].timestamp.getTime()).toBeLessThanOrEqual(
          after.getTime()
        );
      });

      it("stores error stack trace", () => {
        const error = new Error("Test error");
        ErrorLogger.log(error);

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].stack).toBeDefined();
        expect(errors[0].stack).toContain("Test error");
      });

      it("stores string error without stack", () => {
        ErrorLogger.log("String error");

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].message).toBe("String error");
        expect(errors[0].stack).toBeUndefined();
      });
    });

    describe("Memory management", () => {
      it("limits stored errors to 100", () => {
        // NOTE: Max stored errors is 100 to prevent memory leaks
        for (let i = 0; i < 150; i++) {
          ErrorLogger.log(new Error(`Error ${i}`));
        }

        const errors = ErrorLogger.getRecentErrors(150);
        expect(errors.length).toBe(100);
      });

      it("keeps most recent errors when limit exceeded", () => {
        for (let i = 0; i < 150; i++) {
          ErrorLogger.log(new Error(`Error ${i}`));
        }

        const errors = ErrorLogger.getRecentErrors(10);
        // Should have errors 140-149 (most recent)
        expect(errors[errors.length - 1].message).toBe("Error 149");
      });

      it("clears oldest errors first", () => {
        for (let i = 0; i < 101; i++) {
          ErrorLogger.log(new Error(`Error ${i}`));
        }

        const allErrors = ErrorLogger.getRecentErrors(100);
        // First error should be Error 1 (Error 0 was removed)
        expect(allErrors[0].message).toBe("Error 1");
      });
    });

    describe("Console output by severity", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "development";
      });

      it("logs CRITICAL with console.error", () => {
        ErrorLogger.log(
          new Error("Critical"),
          { component: "Test" },
          ErrorSeverity.CRITICAL
        );

        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("🔴 CRITICAL"),
          expect.any(Object)
        );
      });

      it("logs HIGH with console.error", () => {
        ErrorLogger.log(new Error("High"), {}, ErrorSeverity.HIGH);

        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("🟠 HIGH"),
          expect.any(Object)
        );
      });

      it("logs MEDIUM with console.warn", () => {
        ErrorLogger.log(new Error("Medium"), {}, ErrorSeverity.MEDIUM);

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("🟡 MEDIUM"),
          expect.any(Object)
        );
      });

      it("logs LOW with console.info", () => {
        ErrorLogger.log(new Error("Low"), {}, ErrorSeverity.LOW);

        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("🟢 LOW"),
          expect.any(Object)
        );
      });

      it("includes component name in output", () => {
        ErrorLogger.log(new Error("Test"), { component: "TestComponent" });

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("[TestComponent]"),
          expect.any(Object)
        );
      });

      it("shows Unknown when component not specified", () => {
        ErrorLogger.log(new Error("Test"));

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("[Unknown]"),
          expect.any(Object)
        );
      });
    });

    describe("Production logging", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "production";
      });

      it("always logs CRITICAL to console in production", () => {
        ErrorLogger.log(new Error("Critical"), {}, ErrorSeverity.CRITICAL);

        expect(console.error).toHaveBeenCalledWith(
          "[ERROR]",
          expect.objectContaining({
            message: "Critical",
            severity: ErrorSeverity.CRITICAL,
          })
        );
      });

      it("always logs HIGH to console in production", () => {
        ErrorLogger.log(new Error("High"), {}, ErrorSeverity.HIGH);

        expect(console.error).toHaveBeenCalledWith(
          "[ERROR]",
          expect.objectContaining({
            severity: ErrorSeverity.HIGH,
          })
        );
      });

      it("does not log MEDIUM to console in production", () => {
        ErrorLogger.log(new Error("Medium"), {}, ErrorSeverity.MEDIUM);

        // Should not call console in production for MEDIUM
        expect(console.warn).not.toHaveBeenCalled();
        expect(console.info).not.toHaveBeenCalled();
      });

      it("does not log LOW to console in production", () => {
        ErrorLogger.log(new Error("Low"), {}, ErrorSeverity.LOW);

        expect(console.info).not.toHaveBeenCalled();
      });
    });

    describe("Firebase integration", () => {
      it("calls Firebase logError", () => {
        ErrorLogger.log(new Error("Test"));

        expect(firebaseErrorLogger.logError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.any(Object),
          ErrorSeverity.MEDIUM
        );
      });

      it("passes context to Firebase", () => {
        const context = { component: "Test", userId: "user123" };
        ErrorLogger.log(new Error("Test"), context);

        expect(firebaseErrorLogger.logError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining(context),
          expect.any(String)
        );
      });

      it("fails silently when Firebase throws", () => {
        (firebaseErrorLogger.logError as jest.Mock).mockImplementationOnce(
          () => {
            throw new Error("Firebase error");
          }
        );

        expect(() => ErrorLogger.log(new Error("Test"))).not.toThrow();
      });

      it("warns in development when Firebase fails", () => {
        process.env.NODE_ENV = "development";
        (firebaseErrorLogger.logError as jest.Mock).mockImplementationOnce(
          () => {
            throw new Error("Firebase error");
          }
        );

        ErrorLogger.log(new Error("Test"));

        expect(console.warn).toHaveBeenCalledWith(
          "Failed to log to Firebase:",
          expect.any(Error)
        );
      });
    });
  });

  describe("Helper Logging Methods", () => {
    describe("info() - Info Logging", () => {
      it("logs info message in development", () => {
        process.env.NODE_ENV = "development";
        ErrorLogger.info("Info message", { component: "Test" });

        expect(console.log).toHaveBeenCalledWith(
          "[INFO] [Test]",
          "Info message",
          expect.any(Object)
        );
      });

      it("does not log in production", () => {
        process.env.NODE_ENV = "production";
        ErrorLogger.info("Info");

        expect(console.log).not.toHaveBeenCalled();
      });
    });

    describe("warn() - Warning Logging", () => {
      it("logs warning in development", () => {
        process.env.NODE_ENV = "development";
        ErrorLogger.warn("Warning", { component: "Test" });

        expect(console.warn).toHaveBeenCalledWith(
          "[WARN] [Test]",
          "Warning",
          expect.any(Object)
        );
      });

      it("does not log in production", () => {
        process.env.NODE_ENV = "production";
        ErrorLogger.warn("Warning");

        expect(console.warn).not.toHaveBeenCalled();
      });
    });

    describe("logAPIError() - API Error Logging", () => {
      it("logs API error with endpoint", () => {
        ErrorLogger.logAPIError("/api/test", new Error("API failed"));

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("API");
        expect(errors[0].context.action).toBe("/api/test");
      });

      it("logs as HIGH severity for 5xx status codes", () => {
        ErrorLogger.logAPIError("/api/test", new Error("Server error"), 500);

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.HIGH);
      });

      it("logs as MEDIUM severity for 4xx status codes", () => {
        ErrorLogger.logAPIError("/api/test", new Error("Not found"), 404);

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.MEDIUM);
      });

      it("includes status code in metadata", () => {
        ErrorLogger.logAPIError("/api/test", new Error("Error"), 403);

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.metadata?.statusCode).toBe(403);
      });

      it("works with string errors", () => {
        ErrorLogger.logAPIError("/api/test", "String error", 500);

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].message).toBe("String error");
      });
    });

    describe("logServiceError() - Service Error Logging", () => {
      it("logs service error with service name and method", () => {
        ErrorLogger.logServiceError(
          "UserService",
          "getUser",
          new Error("Failed")
        );

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("UserServiceService");
        expect(errors[0].context.action).toBe("getUser");
      });

      it("logs as MEDIUM severity", () => {
        ErrorLogger.logServiceError("Test", "method", new Error("Error"));

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.MEDIUM);
      });
    });

    describe("logComponentError() - Component Error Logging", () => {
      it("logs component error with component and action", () => {
        ErrorLogger.logComponentError(
          "ProductCard",
          "onClick",
          new Error("Click failed")
        );

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("ProductCard");
        expect(errors[0].context.action).toBe("onClick");
      });

      it("logs as LOW severity", () => {
        ErrorLogger.logComponentError("Test", "action", new Error("Error"));

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.LOW);
      });
    });

    describe("logValidationError() - Validation Error Logging", () => {
      it("logs validation error with field name", () => {
        ErrorLogger.logValidationError("email", "Invalid email format");

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].message).toContain("email");
        expect(errors[0].message).toContain("Invalid email format");
      });

      it("includes field in metadata", () => {
        ErrorLogger.logValidationError("username", "Too short");

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.metadata?.field).toBe("username");
      });

      it("uses Validation component by default", () => {
        ErrorLogger.logValidationError("field", "error");

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("Validation");
      });

      it("allows custom component", () => {
        ErrorLogger.logValidationError("field", "error", {
          component: "CustomForm",
        });

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("CustomForm");
      });

      it("logs as LOW severity", () => {
        ErrorLogger.logValidationError("field", "error");

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.LOW);
      });
    });

    describe("logAuthError() - Authentication Error Logging", () => {
      it("logs auth error with Auth component", () => {
        ErrorLogger.logAuthError(new Error("Login failed"));

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.component).toBe("Auth");
      });

      it("logs as HIGH severity", () => {
        // NOTE: Auth errors are always HIGH severity (security critical)
        ErrorLogger.logAuthError(new Error("Unauthorized"));

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].severity).toBe(ErrorSeverity.HIGH);
      });

      it("merges custom context", () => {
        ErrorLogger.logAuthError(new Error("Error"), { userId: "user123" });

        const errors = ErrorLogger.getRecentErrors(1);
        expect(errors[0].context.userId).toBe("user123");
      });
    });

    describe("logPerformanceIssue() - Performance Logging", () => {
      it("logs performance issue when threshold exceeded", () => {
        process.env.NODE_ENV = "development";
        ErrorLogger.logPerformanceIssue("slowOperation", 2000, 1000);

        // NOTE: warn() receives 3 args: prefix, message, context
        expect(console.warn).toHaveBeenCalledWith(
          "[WARN] [Performance]",
          expect.stringContaining("Performance issue"),
          expect.any(Object)
        );
      });

      it("does not log when under threshold", () => {
        process.env.NODE_ENV = "development";
        ErrorLogger.logPerformanceIssue("fastOperation", 500, 1000);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("includes duration and threshold in metadata", () => {
        process.env.NODE_ENV = "development";
        ErrorLogger.logPerformanceIssue("operation", 2000, 1000);

        // NOTE: Performance issues use warn() in development only
        expect(console.warn).toHaveBeenCalledWith(
          "[WARN] [Performance]",
          expect.stringContaining("operation took 2000ms"),
          expect.objectContaining({
            metadata: expect.objectContaining({
              duration: 2000,
              threshold: 1000,
            }),
          })
        );
      });

      it("uses Performance component by default", () => {
        process.env.NODE_ENV = "development";
        ErrorLogger.logPerformanceIssue("op", 2000, 1000);

        expect(console.warn).toHaveBeenCalledWith(
          "[WARN] [Performance]",
          expect.any(String),
          expect.objectContaining({
            component: "Performance",
          })
        );
      });
    });
  });

  describe("Error Retrieval and Filtering", () => {
    beforeEach(() => {
      // Seed with various errors
      ErrorLogger.log(new Error("Low 1"), {}, ErrorSeverity.LOW);
      ErrorLogger.log(new Error("Medium 1"), {}, ErrorSeverity.MEDIUM);
      ErrorLogger.log(new Error("High 1"), {}, ErrorSeverity.HIGH);
      ErrorLogger.log(new Error("Critical 1"), {}, ErrorSeverity.CRITICAL);
      ErrorLogger.log(new Error("Low 2"), {}, ErrorSeverity.LOW);
    });

    describe("getRecentErrors()", () => {
      it("returns recent errors", () => {
        const errors = ErrorLogger.getRecentErrors(3);

        expect(errors).toHaveLength(3);
        expect(errors[2].message).toBe("Low 2");
      });

      it("returns all errors when count >= total", () => {
        const errors = ErrorLogger.getRecentErrors(100);

        expect(errors).toHaveLength(5);
      });

      it("defaults to 10 errors", () => {
        for (let i = 0; i < 20; i++) {
          ErrorLogger.log(new Error(`Error ${i}`));
        }

        const errors = ErrorLogger.getRecentErrors();
        expect(errors).toHaveLength(10);
      });
    });

    describe("getErrorsBySeverity()", () => {
      it("filters by LOW severity", () => {
        const errors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.LOW);

        expect(errors).toHaveLength(2);
        expect(errors.every((e) => e.severity === ErrorSeverity.LOW)).toBe(
          true
        );
      });

      it("filters by MEDIUM severity", () => {
        const errors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.MEDIUM);

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe("Medium 1");
      });

      it("filters by HIGH severity", () => {
        const errors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.HIGH);

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe("High 1");
      });

      it("filters by CRITICAL severity", () => {
        const errors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.CRITICAL);

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe("Critical 1");
      });

      it("returns empty array when no matches", () => {
        ErrorLogger.clear();
        ErrorLogger.log(new Error("Test"), {}, ErrorSeverity.LOW);

        const errors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.CRITICAL);
        expect(errors).toHaveLength(0);
      });
    });

    describe("clear()", () => {
      it("clears all stored errors", () => {
        ErrorLogger.clear();

        const errors = ErrorLogger.getRecentErrors();
        expect(errors).toHaveLength(0);
      });

      it("allows logging after clear", () => {
        ErrorLogger.clear();
        ErrorLogger.log(new Error("After clear"));

        const errors = ErrorLogger.getRecentErrors();
        expect(errors).toHaveLength(1);
      });
    });

    describe("exportErrors()", () => {
      it("exports errors as JSON string", () => {
        const json = ErrorLogger.exportErrors();
        const parsed = JSON.parse(json);

        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBeGreaterThan(0);
      });

      it("includes all error properties", () => {
        ErrorLogger.clear();
        ErrorLogger.log(new Error("Test"), { component: "Test" });

        const json = ErrorLogger.exportErrors();
        const parsed = JSON.parse(json);

        expect(parsed[0]).toHaveProperty("message");
        expect(parsed[0]).toHaveProperty("severity");
        expect(parsed[0]).toHaveProperty("context");
        expect(parsed[0]).toHaveProperty("timestamp");
      });

      it("handles empty error list", () => {
        ErrorLogger.clear();
        const json = ErrorLogger.exportErrors();

        expect(json).toBe("[]");
      });
    });
  });

  describe("Exported Helper Functions", () => {
    it("logError calls ErrorLogger.log", () => {
      logError(new Error("Test"), { component: "Test" }, ErrorSeverity.HIGH);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].message).toBe("Test");
    });

    it("logAPIError calls ErrorLogger.logAPIError", () => {
      logAPIError("/api/test", new Error("API error"), 500);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context.component).toBe("API");
    });

    it("logServiceError calls ErrorLogger.logServiceError", () => {
      logServiceError("UserService", "getUser", new Error("Service error"));

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context.component).toContain("Service");
    });

    it("logComponentError calls ErrorLogger.logComponentError", () => {
      logComponentError("Button", "onClick", new Error("Click error"));

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context.component).toBe("Button");
    });

    it("logValidationError calls ErrorLogger.logValidationError", () => {
      logValidationError("email", "Invalid format");

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].message).toContain("email");
    });

    it("logAuthError calls ErrorLogger.logAuthError", () => {
      logAuthError(new Error("Auth failed"));

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context.component).toBe("Auth");
    });

    it("logPerformanceIssue calls ErrorLogger.logPerformanceIssue", () => {
      process.env.NODE_ENV = "development";
      logPerformanceIssue("slowOp", 2000, 1000);

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("logs different error types together", () => {
      logAPIError("/api/users", new Error("Not found"), 404);
      logServiceError("AuthService", "login", new Error("Failed"));
      logComponentError("Header", "render", new Error("Render error"));

      const errors = ErrorLogger.getRecentErrors(3);
      expect(errors).toHaveLength(3);
      expect(errors[0].context.component).toBe("API");
      expect(errors[1].context.component).toContain("Service");
      expect(errors[2].context.component).toBe("Header");
    });

    it("handles high-volume logging", () => {
      for (let i = 0; i < 1000; i++) {
        logError(new Error(`Error ${i}`));
      }

      // Should only keep last 100
      const errors = ErrorLogger.getRecentErrors(150);
      expect(errors).toHaveLength(100);
    });

    it("exports and parses errors correctly", () => {
      logError(new Error("Test 1"), {}, ErrorSeverity.HIGH);
      logError(new Error("Test 2"), {}, ErrorSeverity.LOW);

      const json = ErrorLogger.exportErrors();
      const parsed = JSON.parse(json);

      expect(parsed.length).toBeGreaterThanOrEqual(2);
    });
  });
});
