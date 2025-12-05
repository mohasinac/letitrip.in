/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/logger
 * @description This file contains functionality related to logger
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create Winston logger
const logger = winston.createLogger({
  /** Level */
  level: process.env.LOG_LEVEL || "info",
  /** Format */
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  /** Transports */
  transports: [
    // Error logs
    new winston.transports.File({
      /** Filename */
      filename: path.join(logsDir, "error.log"),
      /** Level */
      level: "error",
      maxsize: 5242880, // 5MB
      /** Max Files */
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      /** Filename */
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      /** Max Files */
      maxFiles: 5,
    }),
    // API logs
    new winston.transports.File({
      /** Filename */
      filename: path.join(logsDir, "api.log"),
      /** Level */
      level: "info",
      maxsize: 5242880, // 5MB
      /** Max Files */
      maxFiles: 5,
    }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      /** Format */
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

/**
 * LogContext interface
 * 
 * @interface
 * @description Defines the structure and contract for LogContext
 */
export interface LogContext {
  /** Method */
  method?: string;
  /** Url */
  url?: string;
  /** Status Code */
  statusCode?: number;
  /** Duration */
  duration?: number;
  /** Ip */
  ip?: string;
  /** User Agent */
  userAgent?: string;
  /** User Id */
  userId?: string;
  /** Error */
  error?: any;
  [key: string]: any;
}

/**
 * ApiLogger class
 * 
 * @class
 * @description Description of ApiLogger class functionality
 */
class ApiLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = logger;
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    this.logger.error(message, {
      ...context,
      /** Error */
      error:
        error instanceof Error
          ? {
              /** Message */
              message: error.message,
              /** Stack */
              stack: error.stack,
              /** Name */
              name: error.name,
            }
          : error,
    });
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }

  // Log API request/response
  logRequest(req: NextRequest, context?: LogContext) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : req.headers.get("x-real-ip") || "unknown";

    this.info("API Request", {
      /** Method */
      method: req.method,
      /** Url */
      url: req.url,
      ip,
      /** User Agent */
      userAgent: req.headers.get("user-agent") || "unknown",
      ...context,
    });
  }

  logResponse(
    /** Req */
    req: NextRequest,
    /** Response */
    response: NextResponse,
    /** Duration */
    duration: number,
    /** Context */
    context?: LogContext,
  ) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : req.headers.get("x-real-ip") || "unknown";

    const logData: LogContext = {
      /** Method */
      method: req.method,
      /** Url */
      url: req.url,
      /** Status Code */
      statusCode: response.status,
      /** Duration */
      duration: duration,
      /** Duration Ms */
      durationMs: `${duration}ms`,
      ip,
      /** User Agent */
      userAgent: req.headers.get("user-agent") || "unknown",
      ...context,
    };

    if (response.status >= 500) {
      this.error("API Error", null, logData);
    } else if (response.status >= 400) {
      this.warn("API Client Error", logData);
    } else {
      this.info("API Response", logData);
    }
  }

  logError(error: Error, req?: NextRequest, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
    };

    if (req) {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded
        ? forwarded.split(",")[0]
        : req.headers.get("x-real-ip") || "unknown";

      errorContext.method = req.method;
      errorContext.url = req.url;
      errorContext.ip = ip;
      errorContext.userAgent = req.headers.get("user-agent") || "unknown";
    }

    this.error("Unhandled Error", error, errorContext);
  }
}

export const apiLogger = new ApiLogger();

// Middleware wrapper for API routes
/**
 * Function: With Logger
 */
/**
 * Performs with logger operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to withlogger result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withLogger(req, handler);
 */

/**
 * Performs with logger operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to withlogger result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withLogger(/** Req */
  req, /** Handler */
  handler);
 */

export async function withLogger(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: NextRequest) => Promise<NextResponse>,
  /** Context */
  context?: LogContext,
) {
  const startTime = Date.now();

  try {
    apiLogger.logRequest(req, context);

    const response = await handler(req);
    const duration = Date.now() - startTime;

    apiLogger.logResponse(req, response, duration, context);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    apiLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      req,
      { ...context, duration: duration, durationMs: `${duration}ms` },
    );

    // Return error response
    return NextResponse.json(
      {
        /** Error */
        error: "Internal Server Error",
        /** Message */
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error instanceof Error
              ? error.message
              : String(error),
      },
      { status: 500 },
    );
  }
}

export { logger };
