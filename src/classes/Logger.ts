/**
 * Logger Class
 *
 * Singleton class for application logging
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  enableConsole?: boolean;
  enableStorage?: boolean;
  enableFileLogging?: boolean;
  maxEntries?: number;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private options: Required<LoggerOptions>;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private constructor(options?: LoggerOptions) {
    this.options = {
      minLevel: options?.minLevel || "debug",
      enableConsole: options?.enableConsole ?? true,
      enableStorage: options?.enableStorage ?? false,
      enableFileLogging: options?.enableFileLogging ?? false,
      maxEntries: options?.maxEntries || 1000,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      this.levelPriority[level] >= this.levelPriority[this.options.minLevel]
    );
  }

  /**
   * Add log entry
   */
  private addLog(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    };

    // Add to logs array
    this.logs.push(entry);

    // Enforce max entries
    if (this.logs.length > this.options.maxEntries) {
      this.logs.shift();
    }

    // Console output
    if (this.options.enableConsole) {
      this.logToConsole(entry);
    }

    // Storage (if enabled)
    if (this.options.enableStorage && typeof window !== "undefined") {
      this.saveToStorage();
    }

    // File logging for errors (if enabled)
    if (this.options.enableFileLogging && level === "error") {
      this.writeToFile(entry).catch(() => {
        // Silently fail to prevent recursive logging
      });
    }
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp.toISOString()}`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case "debug":
        console.debug(message, entry.data);
        break;
      case "info":
        console.info(message, entry.data);
        break;
      case "warn":
        console.warn(message, entry.data);
        break;
      case "error":
        console.error(message, entry.data);
        break;
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem("app_logs", JSON.stringify(this.logs));
    } catch (error) {
      console.error("Failed to save logs to storage:", error);
    }
  }

  /**
   * Write log entry to file via API
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      await fetch("/api/logs/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: entry.level,
          message: entry.message,
          timestamp: entry.timestamp.toISOString(),
          data: entry.data,
        }),
      });
    } catch (error) {
      // Silently fail - don't log recursively
      console.error("Failed to write log to file:", error);
    }
  }

  /**
   * Debug log
   */
  public debug(message: string, data?: any): void {
    this.addLog("debug", message, data);
  }

  /**
   * Info log
   */
  public info(message: string, data?: any): void {
    this.addLog("info", message, data);
  }

  /**
   * Warning log
   */
  public warn(message: string, data?: any): void {
    this.addLog("warn", message, data);
  }

  /**
   * Error log
   */
  public error(message: string, data?: any): void {
    this.addLog("error", message, data);
  }

  /**
   * Get all logs
   */
  public getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  public clear(): void {
    this.logs = [];
    if (this.options.enableStorage && typeof window !== "undefined") {
      localStorage.removeItem("app_logs");
    }
  }

  /**
   * Export logs as JSON
   */
  public export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get log statistics
   */
  public getStats(): Record<LogLevel, number> {
    return {
      debug: this.logs.filter((l) => l.level === "debug").length,
      info: this.logs.filter((l) => l.level === "info").length,
      warn: this.logs.filter((l) => l.level === "warn").length,
      error: this.logs.filter((l) => l.level === "error").length,
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
