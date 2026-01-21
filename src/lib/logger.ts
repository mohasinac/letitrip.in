/**
 * Error Logger Utility
 *
 * Centralized error logging system that writes errors to log files
 * and optionally sends to external services.
 *
 * Features:
 * - File-based logging with rotation
 * - Different log levels (error, warn, info, debug)
 * - Structured logging with timestamps
 * - Environment-specific configuration
 * - Error stack traces and metadata
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export type LogLevel = "error" | "warn" | "info" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

class ErrorLogger {
  private logDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor() {
    this.logDir = join(process.cwd(), "logs");
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: LogLevel): string {
    const date = new Date().toISOString().split("T")[0];
    return join(this.logDir, `${level}-${date}.log`);
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry) + "\n";
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels = ["error", "warn", "info", "debug"];
    const configLevel = process.env.LOG_LEVEL || "info";
    const currentIndex = logLevels.indexOf(level);
    const configIndex = logLevels.indexOf(configLevel);
    return currentIndex <= configIndex;
  }

  private writeToFile(level: LogLevel, entry: LogEntry) {
    if (!this.shouldLog(level)) return;

    try {
      const fileName = this.getLogFileName(level);
      const logLine = this.formatLogEntry(entry);
      appendFileSync(fileName, logLine);
    } catch (writeError) {
      console.error("Failed to write to log file:", writeError);
    }
  }

  public log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    this.writeToFile(level, entry);

    // Console output in development
    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[consoleMethod](`[${level.toUpperCase()}]`, message, metadata);
    }
  }

  public error(error: Error | string, metadata?: Record<string, any>) {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      stack,
      metadata,
    };

    this.writeToFile("error", entry);

    // Console output in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ERROR]", message, { stack, metadata });
    }
  }

  public warn(message: string, metadata?: Record<string, any>) {
    this.log("warn", message, metadata);
  }

  public info(message: string, metadata?: Record<string, any>) {
    this.log("info", message, metadata);
  }

  public debug(message: string, metadata?: Record<string, any>) {
    this.log("debug", message, metadata);
  }

  // API-specific logging methods
  public apiError(
    error: Error | string,
    context: {
      method: string;
      url: string;
      statusCode?: number;
      userId?: string;
      requestId?: string;
      ip?: string;
      userAgent?: string;
    },
  ) {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message: `API Error: ${message}`,
      stack,
      metadata: {
        type: "api_error",
        method: context.method,
        url: context.url,
        statusCode: context.statusCode,
      },
      userId: context.userId,
      requestId: context.requestId,
      ip: context.ip,
      userAgent: context.userAgent,
    };

    this.writeToFile("error", entry);

    if (process.env.NODE_ENV === "development") {
      console.error("[API ERROR]", message, context);
    }
  }

  public userAction(
    action: string,
    userId: string,
    metadata?: Record<string, any>,
  ) {
    this.log("info", `User Action: ${action}`, {
      type: "user_action",
      userId,
      ...metadata,
    });
  }

  public performanceLog(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ) {
    this.log("info", `Performance: ${operation} took ${duration}ms`, {
      type: "performance",
      operation,
      duration,
      ...metadata,
    });
  }
}

// Export singleton instance
export const logger = new ErrorLogger();

// Convenience exports
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logDebug = logger.debug.bind(logger);
export const logApiError = logger.apiError.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
export const logPerformance = logger.performanceLog.bind(logger);
