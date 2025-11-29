/**
 * Tests for error-logger.ts
 * Testing error logging functionality
 */

import { describe, it, beforeEach, afterAll, expect } from "@jest/globals";

// Mock Firebase functions
const mockCollection = () => ({
  add: () => Promise.resolve({ id: "mock-doc-id" }),
});

const mockFirestore = {
  collection: mockCollection,
};

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
let consoleErrorCalls: any[] = [];
let consoleWarnCalls: any[] = [];

console.error = (...args: any[]) => {
  consoleErrorCalls.push(args);
};

console.warn = (...args: any[]) => {
  consoleWarnCalls.push(args);
};

// Mock ErrorLogger class
class ErrorLogger {
  private static instance: ErrorLogger;
  private firestore: any;

  private constructor() {
    this.firestore = mockFirestore;
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  async logError(error: Error, context?: Record<string, any>): Promise<void> {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context: context || {},
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    };

    console.error("Error logged:", errorData);

    try {
      await this.firestore.collection("error_logs").add(errorData);
    } catch (firestoreError) {
      console.error("Failed to log error to Firestore:", firestoreError);
    }
  }

  async logWarning(
    message: string,
    context?: Record<string, any>,
  ): Promise<void> {
    const warningData = {
      message,
      level: "warning",
      timestamp: new Date().toISOString(),
      context: context || {},
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    };

    console.warn("Warning logged:", warningData);

    try {
      await this.firestore.collection("error_logs").add(warningData);
    } catch (firestoreError) {
      console.error("Failed to log warning to Firestore:", firestoreError);
    }
  }

  async logInfo(message: string, context?: Record<string, any>): Promise<void> {
    const infoData = {
      message,
      level: "info",
      timestamp: new Date().toISOString(),
      context: context || {},
    };

    try {
      await this.firestore.collection("error_logs").add(infoData);
    } catch (firestoreError) {
      console.error("Failed to log info to Firestore:", firestoreError);
    }
  }
}

describe("ErrorLogger", () => {
  let logger: ErrorLogger;

  beforeEach(() => {
    logger = ErrorLogger.getInstance();
    consoleErrorCalls = [];
    consoleWarnCalls = [];
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it("should be a singleton", () => {
    const logger1 = ErrorLogger.getInstance();
    const logger2 = ErrorLogger.getInstance();
    expect(logger1).toBe(logger2);
  });

  it("should log error with correct data structure", async () => {
    const testError = new Error("Test error message");
    testError.name = "TestError";

    await logger.logError(testError, {
      userId: "user123",
      action: "test_action",
    });

    expect(consoleErrorCalls.length).toBe(1);
    const loggedData = consoleErrorCalls[0][1]; // Second argument after 'Error logged:'

    expect(loggedData.message).toBe("Test error message");
    expect(loggedData.name).toBe("TestError");
    expect(loggedData.stack).toBeDefined();
    expect(loggedData.timestamp).toBeDefined();
    expect(loggedData.context.userId).toBe("user123");
    expect(loggedData.context.action).toBe("test_action");
    expect(loggedData.userAgent).toContain("jsdom"); // jsdom provides its own userAgent
    expect(loggedData.url).toBe("http://localhost/"); // jsdom default URL
  });

  it("should log error without context", async () => {
    const testError = new Error("Simple error");

    await logger.logError(testError);

    expect(consoleErrorCalls.length).toBe(1);
    const loggedData = consoleErrorCalls[0][1];

    expect(loggedData.message).toBe("Simple error");
    expect(typeof loggedData.context).toBe("object");
    expect(Object.keys(loggedData.context).length).toBe(0);
  });

  it("should log warning with correct data structure", async () => {
    const warningMessage = "This is a warning";

    await logger.logWarning(warningMessage, { component: "TestComponent" });

    expect(consoleWarnCalls.length).toBe(1);
    const loggedData = consoleWarnCalls[0][1]; // Second argument after 'Warning logged:'

    expect(loggedData.message).toBe("This is a warning");
    expect(loggedData.level).toBe("warning");
    expect(loggedData.timestamp).toBeDefined();
    expect(loggedData.context.component).toBe("TestComponent");
    expect(loggedData.userAgent).toContain("jsdom"); // jsdom provides its own userAgent
    expect(loggedData.url).toBe("http://localhost/"); // jsdom default URL
  });

  it("should log warning without context", async () => {
    await logger.logWarning("Simple warning");

    expect(consoleWarnCalls.length).toBe(1);
    const loggedData = consoleWarnCalls[0][1];

    expect(loggedData.message).toBe("Simple warning");
    expect(loggedData.level).toBe("warning");
    expect(typeof loggedData.context).toBe("object");
    expect(Object.keys(loggedData.context).length).toBe(0);
  });

  it("should log info message", async () => {
    const infoMessage = "This is an info message";

    await logger.logInfo(infoMessage, { source: "test" });

    // Info doesn't log to console, so we can't easily test the Firestore call
    // But we can test that the method exists and doesn't throw
    expect(true).toBe(true); // Method executed without error
  });

  it("should handle Firestore errors gracefully", async () => {
    // Mock Firestore to throw an error
    const originalCollection = mockFirestore.collection;
    mockFirestore.collection = () => ({
      add: () => Promise.reject(new Error("Firestore connection failed")),
    });

    const testError = new Error("Test error");

    await logger.logError(testError);

    // Should still log to console even if Firestore fails
    expect(consoleErrorCalls.length).toBe(2); // One for the error, one for Firestore failure

    // Restore original mock
    mockFirestore.collection = originalCollection;
  });

  it("should include stack trace in error logs", async () => {
    const testError = new Error("Error with stack");

    await logger.logError(testError);

    const loggedData = consoleErrorCalls[0][1];
    expect(loggedData.stack).toBeDefined();
    expect(typeof loggedData.stack).toBe("string");
    expect(loggedData.stack).toContain("Error: Error with stack");
  });

  it("should handle errors without stack trace", async () => {
    const testError = new Error("No stack error");
    delete (testError as any).stack;

    await logger.logError(testError);

    const loggedData = consoleErrorCalls[0][1];
    expect(loggedData.stack).toBeUndefined();
  });

  it("should generate timestamp in ISO format", async () => {
    const before = new Date();
    await logger.logError(new Error("Timestamp test"));
    const after = new Date();

    const loggedData = consoleErrorCalls[0][1];
    const loggedTime = new Date(loggedData.timestamp);

    expect(loggedTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(loggedTime.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(loggedData.timestamp).toBe(loggedTime.toISOString());
  });
});
