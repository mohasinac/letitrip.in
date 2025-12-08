import { ErrorLogger, ErrorSeverity, logError } from "../error-logger";

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("Error Logger", () => {
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
    ErrorLogger.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  describe("log", () => {
    it("should log error with string message", () => {
      ErrorLogger.log("Test error message");

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Test error message");
      expect(errors[0].severity).toBe(ErrorSeverity.MEDIUM);
    });

    it("should log error with Error object", () => {
      const error = new Error("Test error");
      ErrorLogger.log(error);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Test error");
      expect(errors[0].stack).toBeDefined();
    });

    it("should log with custom severity", () => {
      ErrorLogger.log("Critical error", {}, ErrorSeverity.CRITICAL);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].severity).toBe(ErrorSeverity.CRITICAL);
    });

    it("should log with context", () => {
      const context = {
        component: "TestComponent",
        action: "testAction",
        userId: "user123",
      };

      ErrorLogger.log("Error with context", context);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context).toEqual(context);
    });

    it("should use console.error for CRITICAL severity", () => {
      ErrorLogger.log("Critical error", {}, ErrorSeverity.CRITICAL);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should use console.error for HIGH severity", () => {
      ErrorLogger.log("High severity error", {}, ErrorSeverity.HIGH);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("getRecentErrors", () => {
    it("should return recent errors", () => {
      ErrorLogger.log("Error 1");
      ErrorLogger.log("Error 2");
      ErrorLogger.log("Error 3");

      const errors = ErrorLogger.getRecentErrors(2);
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe("Error 2");
      expect(errors[1].message).toBe("Error 3");
    });

    it("should return all errors if count exceeds stored errors", () => {
      ErrorLogger.log("Error 1");

      const errors = ErrorLogger.getRecentErrors(10);
      expect(errors).toHaveLength(1);
    });
  });

  describe("getErrorsBySeverity", () => {
    it("should filter errors by severity", () => {
      ErrorLogger.log("Low error", {}, ErrorSeverity.LOW);
      ErrorLogger.log("Medium error", {}, ErrorSeverity.MEDIUM);
      ErrorLogger.log("Critical error", {}, ErrorSeverity.CRITICAL);

      const criticalErrors = ErrorLogger.getErrorsBySeverity(
        ErrorSeverity.CRITICAL
      );
      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].severity).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe("clear", () => {
    it("should clear all errors", () => {
      ErrorLogger.log("Error 1");
      ErrorLogger.log("Error 2");

      expect(ErrorLogger.getRecentErrors(10)).toHaveLength(2);

      ErrorLogger.clear();

      expect(ErrorLogger.getRecentErrors(10)).toHaveLength(0);
    });
  });

  describe("logAPIError", () => {
    it("should log API errors with endpoint", () => {
      ErrorLogger.logAPIError("/api/test", new Error("API failed"), 500);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context.component).toBe("API");
      expect(errors[0].context.action).toBe("/api/test");
    });

    it("should use HIGH severity for 5xx errors", () => {
      ErrorLogger.logAPIError("/api/test", "Server error", 500);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].severity).toBe(ErrorSeverity.HIGH);
    });

    it("should use MEDIUM severity for 4xx errors", () => {
      ErrorLogger.logAPIError("/api/test", "Not found", 404);

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe("logServiceError", () => {
    it("should log service errors with service name", () => {
      ErrorLogger.logServiceError("Auth", "login", "Login failed");

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].context.component).toBe("AuthService");
      expect(errors[0].context.action).toBe("login");
    });
  });

  describe("logValidationError", () => {
    it("should log validation errors with field name", () => {
      ErrorLogger.logValidationError("email", "Invalid email format");

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors[0].message).toContain("email");
      expect(errors[0].message).toContain("Invalid email format");
      expect(errors[0].severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe("helper functions", () => {
    it("should use logError helper", () => {
      logError("Test error", { component: "Test" });

      const errors = ErrorLogger.getRecentErrors(1);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Test error");
    });
  });

  describe("exportErrors", () => {
    it("should export errors as JSON string", () => {
      ErrorLogger.log("Test error");

      const exported = ErrorLogger.exportErrors();
      expect(exported).toBeTruthy();
      expect(() => JSON.parse(exported)).not.toThrow();

      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].message).toBe("Test error");
    });
  });

  describe("timestamp", () => {
    it("should add timestamp to logged errors", () => {
      const beforeLog = new Date();
      ErrorLogger.log("Timestamped error");
      const afterLog = new Date();

      const errors = ErrorLogger.getRecentErrors(1);
      const timestamp = new Date(errors[0].timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeLog.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterLog.getTime());
    });
  });
});
