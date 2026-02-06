/**
 * @jest-environment jsdom
 */

import { Logger, LogLevel } from "../Logger";

describe("Logger", () => {
  let logger: Logger;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset singleton instance
    (Logger as any).instance = undefined;
    logger = Logger.getInstance({
      enableConsole: false,
      enableStorage: false,
      enableFileLogging: false,
    });

    // Spy on console methods
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock fetch for file logging
    fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    fetchSpy.mockRestore();
    localStorage.clear();
  });

  describe("Singleton Pattern", () => {
    it("should return same instance", () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      expect(logger1).toBe(logger2);
    });

    it("should initialize with default options", () => {
      (Logger as any).instance = undefined;
      const defaultLogger = Logger.getInstance();
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    it("should accept custom options", () => {
      (Logger as any).instance = undefined;
      const customLogger = Logger.getInstance({
        minLevel: "warn",
        maxEntries: 500,
      });
      expect(customLogger).toBeInstanceOf(Logger);
    });
  });

  describe("debug()", () => {
    it("should log debug message", () => {
      logger.debug("Debug message");
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("debug");
      expect(logs[0].message).toBe("Debug message");
    });

    it("should log debug message with data", () => {
      const data = { user: "test", action: "login" };
      logger.debug("User action", data);
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(data);
    });

    it("should not log if below min level", () => {
      (Logger as any).instance = undefined;
      const restrictedLogger = Logger.getInstance({
        minLevel: "warn",
        enableConsole: false,
      });

      restrictedLogger.debug("Debug message");
      expect(restrictedLogger.getLogs()).toHaveLength(0);
    });
  });

  describe("info()", () => {
    it("should log info message", () => {
      logger.info("Info message");
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("info");
    });

    it("should log info message with data", () => {
      logger.info("System info", { cpu: "80%", mem: "2GB" });
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual({ cpu: "80%", mem: "2GB" });
    });
  });

  describe("warn()", () => {
    it("should log warning message", () => {
      logger.warn("Warning message");
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("warn");
    });

    it("should log warning with data", () => {
      logger.warn("Low disk space", { available: "100MB" });
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual({ available: "100MB" });
    });
  });

  describe("error()", () => {
    it("should log error message", () => {
      logger.error("Error message");
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("error");
    });

    it("should log error with Error object", () => {
      const error = new Error("Something went wrong");
      logger.error("Application error", error);
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(error);
    });

    it("should always log errors regardless of minLevel", () => {
      (Logger as any).instance = undefined;
      const errorLogger = Logger.getInstance({
        minLevel: "error",
        enableConsole: false,
      });

      errorLogger.error("Critical error");
      expect(errorLogger.getLogs()).toHaveLength(1);
    });
  });

  describe("Log Level Priority", () => {
    it("should respect minLevel: info", () => {
      (Logger as any).instance = undefined;
      const infoLogger = Logger.getInstance({
        minLevel: "info",
        enableConsole: false,
      });

      infoLogger.debug("Debug");
      infoLogger.info("Info");
      infoLogger.warn("Warn");
      infoLogger.error("Error");

      const logs = infoLogger.getLogs();
      expect(logs).toHaveLength(3); // info, warn, error
      expect(logs.map((l) => l.level)).toEqual(["info", "warn", "error"]);
    });

    it("should respect minLevel: warn", () => {
      (Logger as any).instance = undefined;
      const warnLogger = Logger.getInstance({
        minLevel: "warn",
        enableConsole: false,
      });

      warnLogger.debug("Debug");
      warnLogger.info("Info");
      warnLogger.warn("Warn");
      warnLogger.error("Error");

      const logs = warnLogger.getLogs();
      expect(logs).toHaveLength(2); // warn, error
    });

    it("should respect minLevel: error", () => {
      (Logger as any).instance = undefined;
      const errorLogger = Logger.getInstance({
        minLevel: "error",
        enableConsole: false,
      });

      errorLogger.debug("Debug");
      errorLogger.info("Info");
      errorLogger.warn("Warn");
      errorLogger.error("Error");

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1); // error only
    });
  });

  describe("getLogs()", () => {
    it("should return empty array initially", () => {
      expect(logger.getLogs()).toEqual([]);
    });

    it("should return all logs", () => {
      logger.debug("Debug");
      logger.info("Info");
      logger.warn("Warn");

      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
    });

    it("should filter by level", () => {
      logger.debug("Debug");
      logger.info("Info");
      logger.warn("Warn");
      logger.error("Error");

      const warnings = logger.getLogs("warn");
      expect(warnings).toHaveLength(1);
      expect(warnings[0].level).toBe("warn");
    });

    it("should filter errors only", () => {
      logger.debug("Debug");
      logger.info("Info");
      logger.warn("Warn");
      logger.error("Error");

      const errors = logger.getLogs("error");
      expect(errors).toHaveLength(1);
      expect(errors[0].level).toBe("error");
    });
  });

  describe("clear()", () => {
    it("should clear all logs", () => {
      logger.info("Message 1");
      logger.info("Message 2");
      logger.clear();

      expect(logger.getLogs()).toEqual([]);
    });

    it("should work on empty logs", () => {
      logger.clear();
      expect(logger.getLogs()).toEqual([]);
    });

    it("should clear localStorage when storage enabled", () => {
      (Logger as any).instance = undefined;
      const storageLogger = Logger.getInstance({
        enableStorage: true,
        enableConsole: false,
      });

      storageLogger.info("Message");
      expect(localStorage.getItem("app_logs")).not.toBeNull();

      storageLogger.clear();
      expect(localStorage.getItem("app_logs")).toBeNull();
    });
  });

  describe("Max Entries Limit", () => {
    it("should enforce max entries limit", () => {
      (Logger as any).instance = undefined;
      const limitedLogger = Logger.getInstance({
        maxEntries: 3,
        enableConsole: false,
      });

      limitedLogger.info("Message 1");
      limitedLogger.info("Message 2");
      limitedLogger.info("Message 3");
      limitedLogger.info("Message 4"); // Should evict Message 1

      const logs = limitedLogger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe("Message 2");
      expect(logs[2].message).toBe("Message 4");
    });

    it("should keep most recent logs", () => {
      (Logger as any).instance = undefined;
      const limitedLogger = Logger.getInstance({
        maxEntries: 2,
        enableConsole: false,
      });

      limitedLogger.info("Old");
      limitedLogger.info("Recent 1");
      limitedLogger.info("Recent 2");

      const logs = limitedLogger.getLogs();
      expect(logs.map((l) => l.message)).toEqual(["Recent 1", "Recent 2"]);
    });
  });

  describe("Console Output", () => {
    it("should log to console when enabled", () => {
      (Logger as any).instance = undefined;
      const consoleLogger = Logger.getInstance({ enableConsole: true });

      consoleLogger.debug("Debug message");
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it("should not log to console when disabled", () => {
      logger.debug("Debug message");
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it("should use correct console method for each level", () => {
      (Logger as any).instance = undefined;
      const consoleLogger = Logger.getInstance({ enableConsole: true });

      consoleLogger.debug("Debug");
      consoleLogger.info("Info");
      consoleLogger.warn("Warn");
      consoleLogger.error("Error");

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should include timestamp in console output", () => {
      (Logger as any).instance = undefined;
      const consoleLogger = Logger.getInstance({ enableConsole: true });

      consoleLogger.info("Test message");

      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toMatch(/\[INFO\]/);
      expect(call).toMatch(/Test message/);
    });
  });

  describe("Storage Persistence", () => {
    it("should save to localStorage when enabled", () => {
      (Logger as any).instance = undefined;
      const storageLogger = Logger.getInstance({
        enableStorage: true,
        enableConsole: false,
      });

      storageLogger.info("Persistent message");

      const stored = localStorage.getItem("app_logs");
      expect(stored).not.toBeNull();

      const logs = JSON.parse(stored!);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe("Persistent message");
    });

    it("should not save to localStorage when disabled", () => {
      logger.info("Non-persistent message");

      const stored = localStorage.getItem("app_logs");
      expect(stored).toBeNull();
    });

    it("should update localStorage on each log", () => {
      (Logger as any).instance = undefined;
      const storageLogger = Logger.getInstance({
        enableStorage: true,
        enableConsole: false,
      });

      storageLogger.info("Message 1");
      let stored = JSON.parse(localStorage.getItem("app_logs")!);
      expect(stored).toHaveLength(1);

      storageLogger.info("Message 2");
      stored = JSON.parse(localStorage.getItem("app_logs")!);
      expect(stored).toHaveLength(2);
    });
  });

  describe("File Logging", () => {
    it("should not call fetch when file logging disabled", async () => {
      logger.error("Error message");

      // Wait for any async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should call fetch for errors when file logging enabled", async () => {
      (Logger as any).instance = undefined;
      const fileLogger = Logger.getInstance({
        enableConsole: false,
        enableFileLogging: true,
      });

      fileLogger.error("Error message", { userId: "123" });

      // Wait for async fetch
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/logs/write",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("should send correct log data to API", async () => {
      (Logger as any).instance = undefined;
      const fileLogger = Logger.getInstance({
        enableConsole: false,
        enableFileLogging: true,
      });

      const testData = { userId: "123", action: "payment" };
      fileLogger.error("Payment failed", testData);

      // Wait for async fetch
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const callArgs = fetchSpy.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toMatchObject({
        level: "error",
        message: "Payment failed",
        data: testData,
      });
      expect(body.timestamp).toBeDefined();
    });

    it("should not call fetch for non-error levels", async () => {
      (Logger as any).instance = undefined;
      const fileLogger = Logger.getInstance({
        enableConsole: false,
        enableFileLogging: true,
      });

      fileLogger.debug("Debug message");
      fileLogger.info("Info message");
      fileLogger.warn("Warning message");

      // Wait for any async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should handle fetch failures silently", async () => {
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));

      (Logger as any).instance = undefined;
      const fileLogger = Logger.getInstance({
        enableConsole: false,
        enableFileLogging: true,
      });

      // Should not throw
      expect(() => fileLogger.error("Error message")).not.toThrow();

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Log should still be stored in memory
      expect(fileLogger.getLogs()).toHaveLength(1);
    });

    it("should work with both console and file logging enabled", async () => {
      (Logger as any).instance = undefined;
      const multiLogger = Logger.getInstance({
        enableConsole: true,
        enableFileLogging: true,
      });

      multiLogger.error("Multi-output error");

      // Wait for async fetch
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
      expect(multiLogger.getLogs()).toHaveLength(1);
    });
  });

  describe("Log Entry Structure", () => {
    it("should include all required fields", () => {
      logger.info("Test message", { extra: "data" });
      const logs = logger.getLogs();
      const entry = logs[0];

      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("message");
      expect(entry).toHaveProperty("timestamp");
      expect(entry).toHaveProperty("data");
    });

    it("should have correct timestamp", () => {
      const before = new Date();
      logger.info("Test");
      const after = new Date();

      const logs = logger.getLogs();
      const timestamp = logs[0].timestamp;

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should store data as provided", () => {
      const complexData = {
        nested: { value: "test" },
        array: [1, 2, 3],
        bool: true,
      };

      logger.info("Complex", complexData);
      const logs = logger.getLogs();

      expect(logs[0].data).toEqual(complexData);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty messages", () => {
      logger.info("");
      const logs = logger.getLogs();
      expect(logs[0].message).toBe("");
    });

    it("should handle very long messages", () => {
      const longMessage = "A".repeat(10000);
      logger.info(longMessage);
      const logs = logger.getLogs();
      expect(logs[0].message).toBe(longMessage);
    });

    it("should handle null data", () => {
      logger.info("Test", null);
      const logs = logger.getLogs();
      expect(logs[0].data).toBeNull();
    });

    it("should handle undefined data", () => {
      logger.info("Test", undefined);
      const logs = logger.getLogs();
      expect(logs[0].data).toBeUndefined();
    });

    it("should handle circular references in data", () => {
      const obj: any = { name: "test" };
      obj.self = obj; // Circular reference

      // Should not throw
      expect(() => logger.info("Circular", obj)).not.toThrow();
    });

    it("should handle special characters in messages", () => {
      logger.info("Special: !@#$%^&*()_+{}[]|\\:\";'<>?,./");
      const logs = logger.getLogs();
      expect(logs[0].message).toContain("!@#$%^&*()");
    });

    it("should handle unicode characters", () => {
      logger.info("Unicode: 你好 🎉 ñ");
      const logs = logger.getLogs();
      expect(logs[0].message).toContain("你好");
      expect(logs[0].message).toContain("🎉");
    });
  });

  describe("export()", () => {
    it("should export logs as JSON string", () => {
      logger.info("Message 1");
      logger.error("Message 2");

      const exported = logger.export();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it("should include all log fields in export", () => {
      logger.info("Test", { data: "value" });

      const exported = logger.export();
      const parsed = JSON.parse(exported);

      expect(parsed[0]).toHaveProperty("level");
      expect(parsed[0]).toHaveProperty("message");
      expect(parsed[0]).toHaveProperty("timestamp");
      expect(parsed[0]).toHaveProperty("data");
    });

    it("should export empty array for no logs", () => {
      const exported = logger.export();
      expect(JSON.parse(exported)).toEqual([]);
    });

    it("should format export with proper indentation", () => {
      logger.info("Test");
      const exported = logger.export();

      // Should have newlines (formatted with 2-space indent)
      expect(exported).toContain("\n");
      expect(exported.split("\n").length).toBeGreaterThan(1);
    });
  });

  describe("getStats()", () => {
    it("should return zero stats initially", () => {
      const stats = logger.getStats();

      expect(stats).toEqual({
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
      });
    });

    it("should count logs by level", () => {
      logger.debug("Debug 1");
      logger.debug("Debug 2");
      logger.info("Info 1");
      logger.warn("Warn 1");
      logger.warn("Warn 2");
      logger.warn("Warn 3");
      logger.error("Error 1");

      const stats = logger.getStats();

      expect(stats.debug).toBe(2);
      expect(stats.info).toBe(1);
      expect(stats.warn).toBe(3);
      expect(stats.error).toBe(1);
    });

    it("should update stats after clear", () => {
      logger.info("Message");
      logger.clear();

      const stats = logger.getStats();
      expect(stats.info).toBe(0);
    });

    it("should return correct stats with level filtering", () => {
      (Logger as any).instance = undefined;
      const warnLogger = Logger.getInstance({
        minLevel: "warn",
        enableConsole: false,
      });

      warnLogger.debug("Debug"); // Not logged
      warnLogger.info("Info"); // Not logged
      warnLogger.warn("Warn");
      warnLogger.error("Error");

      const stats = warnLogger.getStats();
      expect(stats.debug).toBe(0);
      expect(stats.info).toBe(0);
      expect(stats.warn).toBe(1);
      expect(stats.error).toBe(1);
    });
  });
});
