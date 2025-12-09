/**
 * IP Tracker Service
 *
 * Tracks user activities and IP addresses for security and analytics.
 *
 * Features:
 * - Log user activities with IP addresses
 * - Track login, registration, orders, bids, etc.
 * - Rate limiting by IP address
 * - Suspicious activity detection
 * - IP-based analytics
 *
 * Security:
 * - Max 5 login attempts per IP per 15 minutes
 * - Track multiple accounts from same IP
 * - Monitor high-frequency actions
 *
 * BUG FIX #23: Removed direct adminDb access from frontend
 * - Now uses apiService to call backend API endpoints
 * - Admin credentials no longer exposed in client bundle
 * - Proper security rules enforcement
 */

import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "./api.service";

export interface ActivityData {
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  action: ActivityAction;
  metadata?: Record<string, any>;
}

export type ActivityAction =
  | "login"
  | "logout"
  | "register"
  | "login_failed"
  | "password_reset"
  | "order_placed"
  | "bid_placed"
  | "profile_update"
  | "address_add"
  | "payment_method_add"
  | "shop_created"
  | "product_created"
  | "auction_created";

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetAt: Date;
}

class IPTrackerService {
  /**
   * Log user activity with IP address
   * BUG FIX #23: Now uses backend API instead of direct DB access
   */
  async logActivity(data: ActivityData): Promise<any> {
    try {
      return await apiService.post("/user-activities/log", data);
    } catch (error) {
      logError(error as Error, {
        service: "IPTrackerService.logActivity",
        action: data.action,
      });
      // Don't throw - logging failure shouldn't block the main action
      return null;
    }
  }

  /**
   * Check rate limit for specific action by IP
   * BUG FIX #23: Now uses backend API instead of direct DB access
   */
  async checkRateLimit(params: {
    ipAddress: string;
    action: ActivityAction;
    maxAttempts?: number;
    windowMs?: number;
  }): Promise<RateLimitResult> {
    const { ipAddress, action, maxAttempts = 5, windowMs = 900000 } = params;
    const windowMinutes = Math.floor(windowMs / 60000);

    try {
      return await apiService.get<RateLimitResult>(
        `/user-activities/rate-limit?ip=${ipAddress}&action=${action}&max=${maxAttempts}&window=${windowMinutes}`
      );
    } catch (error) {
      logError(error as Error, {
        service: "IPTrackerService.checkRateLimit",
        ipAddress,
        action,
      });
      // On error, allow the action (fail open for availability)
      return {
        allowed: true,
        remainingAttempts: maxAttempts,
        resetAt: new Date(Date.now() + windowMs),
      };
    }
  }

  /**
   * Get recent activities for an IP address
   * BUG FIX #23: Now uses backend API instead of direct DB access
   */
  async getActivitiesByIP(
    ipAddress: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      return await apiService.get<any[]>(
        `/user-activities/by-ip/${ipAddress}?limit=${limit}`
      );
    } catch (error) {
      logError(error as Error, {
        service: "IPTrackerService.getActivitiesByIP",
        ipAddress,
      });
      return [];
    }
  }

  /**
   * Get recent activities for a user
   * BUG FIX #23: Now uses backend API instead of direct DB access
   */
  async getActivitiesByUser(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      return await apiService.get<any[]>(
        `/user-activities/by-user/${userId}?limit=${limit}`
      );
    } catch (error) {
      logError(error as Error, {
        service: "IPTrackerService.getActivitiesByUser",
        userId,
      });
      return [];
    }
  }

  /**
   * Get unique users from same IP (detect multiple accounts)
   * BUG FIX #23: Now uses backend API instead of direct DB access
   */
  async getUsersFromIP(ipAddress: string): Promise<string[]> {
    try {
      return await apiService.get<string[]>(
        `/user-activities/users-from-ip/${ipAddress}`
      );
    } catch (error) {
      logError(error as Error, {
        service: "IPTrackerService.getUsersFromIP",
        ipAddress,
      });
      return [];
    }
  }

  /**
   * Get suspicious activity indicators for an IP
   * BUG FIX #23: Now uses backend API instead of direct DB access
   */
  async getSuspiciousActivityScore(ipAddress: string): Promise<{
    score: number;
    reasons: string[];
  }> {
    try {
      return await apiService.get(
        `/user-activities/suspicious-activity/${ipAddress}`
      );
    } catch (error) {
      logError(error as Error, {
        service: "IPTrackerService.getSuspiciousActivityScore",
        ipAddress,
      });
      return { score: 0, reasons: [] };
    }
  }

  /**
   * Extract IP address from request headers
   */
  getIPFromRequest(request: Request): string {
    // Try various headers that may contain the real IP
    const headers = request.headers;

    // Cloudflare
    const cfConnectingIP = headers.get("cf-connecting-ip");
    if (cfConnectingIP) return cfConnectingIP;

    // X-Forwarded-For (may contain multiple IPs, use first)
    const xForwardedFor = headers.get("x-forwarded-for");
    if (xForwardedFor) {
      const ips = xForwardedFor.split(",");
      return ips[0].trim();
    }

    // X-Real-IP
    const xRealIP = headers.get("x-real-ip");
    if (xRealIP) return xRealIP;

    // Fallback to unknown
    return "unknown";
  }

  /**
   * Get user agent from request
   */
  getUserAgentFromRequest(request: Request): string {
    return request.headers.get("user-agent") || "unknown";
  }
}

export const ipTrackerService = new IPTrackerService();
