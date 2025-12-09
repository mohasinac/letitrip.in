import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as winston from "winston";
import { getClientIp } from "../lib/utils/ip-utils";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // API logs
    new winston.transports.File({
      filename: path.join(logsDir, "api.log"),
      level: "info",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export interface LogContext {
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  ip?: string;
  userAgent?: string;
  userId?: string;
  error?: any;
  [key: string]: any;
}

class ApiLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = logger;
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context);
  }

  error(message: string, context?: LogContext) {
    this.logger.error(message, context || {});
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }

  // Log API request/response
  logRequest(req: NextRequest, context?: LogContext) {
    const ip = getClientIp(req);

    this.info("API Request", {
      method: req.method,
      url: req.url,
      ip,
      userAgent: req.headers.get("user-agent") || "unknown",
      ...context,
    });
  }

  logResponse(
    req: NextRequest,
    response: NextResponse,
    duration: number,
    context?: LogContext
  ) {
    const ip = getClientIp(req);

    const logData: LogContext = {
      method: req.method,
      url: req.url,
      statusCode: response.status,
      duration: duration,
      durationMs: `${duration}ms`,
      ip,
      userAgent: req.headers.get("user-agent") || "unknown",
      ...context,
    };

    if (response.status >= 500) {
      this.error("API Error", logData);
    } else if (response.status >= 400) {
      this.warn("API Client Error", logData);
    } else {
      this.info("API Response", logData);
    }
  }

  logError(error: Error, req?: NextRequest, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    };

    if (req) {
      const ip = getClientIp(req);

      errorContext.method = req.method;
      errorContext.url = req.url;
      errorContext.ip = ip;
      errorContext.userAgent = req.headers.get("user-agent") || "unknown";
    }

    this.error("Unhandled Error", errorContext);
  }
}

export const apiLogger = new ApiLogger();

// Middleware wrapper for API routes
export async function withLogger(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  context?: LogContext
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
      { ...context, duration: duration, durationMs: `${duration}ms` }
    );

    // Return error response
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

export { logger };
