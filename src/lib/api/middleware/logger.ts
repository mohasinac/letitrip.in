/**
 * API Logging Middleware
 * Logs all API requests and responses
 */

import { NextRequest, NextResponse } from 'next/server';

export interface LogLevel {
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  DEBUG: 'debug';
}

export const LOG_LEVEL: LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
};

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  error?: any;
  metadata?: any;
}

/**
 * Format log entry
 */
function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    `${entry.method} ${entry.path}`,
  ];

  if (entry.statusCode) {
    parts.push(`- ${entry.statusCode}`);
  }

  if (entry.duration) {
    parts.push(`- ${entry.duration}ms`);
  }

  if (entry.userId) {
    parts.push(`- User: ${entry.userId}`);
  }

  if (entry.userRole) {
    parts.push(`- Role: ${entry.userRole}`);
  }

  return parts.join(' ');
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Logger class
 */
class ApiLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: keyof LogLevel, entry: LogEntry) {
    const formattedEntry = formatLogEntry(entry);
    
    switch (level) {
      case 'ERROR':
        console.error(formattedEntry, entry.error || '');
        break;
      case 'WARN':
        console.warn(formattedEntry);
        break;
      case 'DEBUG':
        if (this.isDevelopment) {
          console.debug(formattedEntry, entry.metadata || '');
        }
        break;
      case 'INFO':
      default:
        console.log(formattedEntry);
    }

    // In production, you could send logs to external service
    if (!this.isDevelopment) {
      this.sendToExternalLogger(entry);
    }
  }

  private async sendToExternalLogger(entry: LogEntry) {
    // TODO: Implement external logging service
    // Examples: Sentry, LogRocket, Datadog, etc.
    // await fetch('https://your-logging-service.com/logs', {
    //   method: 'POST',
    //   body: JSON.stringify(entry),
    // });
  }

  info(message: string, metadata?: any) {
    this.log('INFO', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      method: '',
      path: message,
      metadata,
    });
  }

  warn(message: string, metadata?: any) {
    this.log('WARN', {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      method: '',
      path: message,
      metadata,
    });
  }

  error(message: string, error?: any, metadata?: any) {
    this.log('ERROR', {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      method: '',
      path: message,
      error,
      metadata,
    });
  }

  debug(message: string, metadata?: any) {
    this.log('DEBUG', {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      method: '',
      path: message,
      metadata,
    });
  }

  /**
   * Log API request
   */
  logRequest(request: NextRequest, user?: { uid: string; role?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      method: request.method,
      path: request.nextUrl.pathname,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      userId: user?.uid,
      userRole: user?.role,
    };

    this.log('INFO', entry);
  }

  /**
   * Log API response
   */
  logResponse(
    request: NextRequest,
    response: NextResponse,
    startTime: number,
    user?: { uid: string; role?: string }
  ) {
    const duration = Date.now() - startTime;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: response.status >= 400 ? 'ERROR' : 'INFO',
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode: response.status,
      duration,
      userId: user?.uid,
      userRole: user?.role,
    };

    this.log(entry.level, entry);
  }

  /**
   * Log API error
   */
  logError(
    request: NextRequest,
    error: Error,
    user?: { uid: string; role?: string }
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      method: request.method,
      path: request.nextUrl.pathname,
      userId: user?.uid,
      userRole: user?.role,
      error: {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      },
    };

    this.log('ERROR', entry);
  }
}

// Export singleton instance
export const logger = new ApiLogger();

/**
 * Logging middleware
 */
export function withLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();

    // Log request
    logger.logRequest(request);

    try {
      // Execute handler
      const response = await handler(request, ...args);

      // Log response
      logger.logResponse(request, response, startTime);

      return response;
    } catch (error) {
      // Log error
      logger.logError(request, error as Error);
      throw error;
    }
  };
}

/**
 * Performance logging
 */
export function logPerformance(label: string) {
  const start = Date.now();

  return {
    end: () => {
      const duration = Date.now() - start;
      logger.debug(`[Performance] ${label}: ${duration}ms`);
    },
  };
}

/**
 * Database query logging
 */
export function logDatabaseQuery(
  collection: string,
  operation: string,
  filters?: any
) {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[DB Query] ${operation} on ${collection}`, { filters });
  }
}
