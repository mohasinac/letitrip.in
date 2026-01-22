/**
 * Client-Side Logger
 *
 * Provides logging utilities for the frontend/UI
 * - Console logging with levels
 * - Error tracking
 * - Performance monitoring
 * - User action tracking
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
  component?: string;
  userId?: string;
}

class ClientLogger {
  private isDev: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.isDev = process.env.NODE_ENV === "development";
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    component?: string,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      component,
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatLog(entry: LogEntry): string {
    const emoji = {
      [LogLevel.DEBUG]: "🐛",
      [LogLevel.INFO]: "ℹ️",
      [LogLevel.WARN]: "⚠️",
      [LogLevel.ERROR]: "❌",
    };

    let log = `${emoji[entry.level]} [${entry.level}] ${entry.timestamp}`;
    if (entry.component) {
      log += ` [${entry.component}]`;
    }
    log += `: ${entry.message}`;

    return log;
  }

  debug(message: string, data?: any, component?: string) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, component);
    this.addLog(entry);

    if (this.isDev) {
      console.log(this.formatLog(entry), data || "");
    }
  }

  info(message: string, data?: any, component?: string) {
    const entry = this.createLogEntry(LogLevel.INFO, message, data, component);
    this.addLog(entry);

    if (this.isDev) {
      console.info(this.formatLog(entry), data || "");
    }
  }

  warn(message: string, data?: any, component?: string) {
    const entry = this.createLogEntry(LogLevel.WARN, message, data, component);
    this.addLog(entry);

    console.warn(this.formatLog(entry), data || "");
  }

  error(message: string, error?: Error | any, component?: string) {
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      error,
      component,
    );

    if (error instanceof Error) {
      entry.stack = error.stack;
    }

    this.addLog(entry);
    console.error(this.formatLog(entry), error || "");

    // In production, you might want to send this to an error tracking service
    if (!this.isDev) {
      this.sendToErrorTracking(entry);
    }
  }

  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Integrate with services like Sentry, LogRocket, etc.
    // For now, just store in localStorage for debugging
    try {
      const errors = JSON.parse(
        localStorage.getItem("app_errors") || "[]",
      ) as LogEntry[];
      errors.push(entry);
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }
      localStorage.setItem("app_errors", JSON.stringify(errors));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  downloadLogs() {
    const blob = new Blob([this.exportLogs()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const logger = new ClientLogger();

// Performance monitoring
export class PerformanceLogger {
  private static marks: Map<string, number> = new Map();

  static startMark(name: string) {
    this.marks.set(name, performance.now());
  }

  static endMark(name: string, logMessage?: string) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      logger.warn(`Performance mark "${name}" not found`);
      return;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    const message = logMessage || `${name} completed`;
    logger.info(`⏱️ ${message} in ${duration.toFixed(2)}ms`);

    return duration;
  }

  static measure(name: string, fn: () => void | Promise<void>) {
    return async () => {
      this.startMark(name);
      try {
        await fn();
      } finally {
        this.endMark(name);
      }
    };
  }
}

// User action tracking
export class ActionLogger {
  static trackClick(element: string, data?: any) {
    logger.debug(`User clicked: ${element}`, data, "ActionLogger");
  }

  static trackNavigation(from: string, to: string) {
    logger.debug(`Navigation: ${from} → ${to}`, undefined, "ActionLogger");
  }

  static trackFormSubmit(formName: string, data?: any) {
    logger.info(`Form submitted: ${formName}`, data, "ActionLogger");
  }

  static trackError(errorType: string, error: Error | any) {
    logger.error(`User encountered error: ${errorType}`, error, "ActionLogger");
  }

  static trackApiCall(endpoint: string, method: string, duration: number) {
    logger.debug(
      `API ${method} ${endpoint} completed in ${duration.toFixed(2)}ms`,
      undefined,
      "ActionLogger",
    );
  }
}

// API call logger wrapper
export async function loggedApiCall<T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    ActionLogger.trackApiCall(endpoint, method, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(
      `API ${method} ${endpoint} failed after ${duration.toFixed(2)}ms`,
      error,
      "API",
    );
    throw error;
  }
}
