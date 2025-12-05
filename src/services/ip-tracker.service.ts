/**
 * @fileoverview Service Module
 * @module src/services/ip-tracker.service
 * @description This file contains service functions for ip-tracker operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
 */

import { adminDb as db } from "@/app/api/lib/firebase/config";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";

const { USER_ACTIVITIES } = COLLECTIONS;

/**
 * ActivityData interface
 * 
 * @interface
 * @description Defines the structure and contract for ActivityData
 */
export interface ActivityData {
  /** User Id */
  userId?: string;
  /** Ip Address */
  ipAddress: string;
  /** User Agent */
  userAgent?: string;
  /** Action */
  action: ActivityAction;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * ActivityAction type
 * 
 * @typedef {Object} ActivityAction
 * @description Type definition for ActivityAction
 */
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

/**
 * RateLimitResult interface
 * 
 * @interface
 * @description Defines the structure and contract for RateLimitResult
 */
export interface RateLimitResult {
  /** Allowed */
  allowed: boolean;
  /** Remaining Attempts */
  remainingAttempts: number;
  /** Reset At */
  resetAt: Date;
}

/**
 * IPTrackerService class
 * 
 * @class
 * @description Description of IPTrackerService class functionality
 */
class IPTrackerService {
  /**
   * Log user activity with IP address
   */
  async logActivity(data: ActivityData): Promise<void> {
    try {
      const activityRef = db.collection(USER_ACTIVITIES).doc();
      const timestamp = new Date();

      await activityRef.set({
        /** Id */
        id: activityRef.id,
        /** User Id */
        userId: data.userId || null,
        /** Ip Address */
        ipAddress: data.ipAddress,
        /** User Agent */
        userAgent: data.userAgent || null,
        /** Action */
        action: data.action,
        /** Metadata */
        metadata: data.metadata || {},
        timestamp,
        /** Created At */
        createdAt: timestamp,
      });
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerService.logActivity",
        /** Action */
        action: "log_activity",
        /** Metadata */
        metadata: {
          /** User Id */
          userId: data.userId,
          /** Action */
          action: data.action,
        },
      });
      // Don't throw - logging failure shouldn't block the main action
    }
  }

  /**
   * Check rate limit for specific action by IP
   */
  async checkRateLimit(
    /** Ip Address */
    ipAddress: string,
    /** Action */
    action: ActivityAction,
    /** Max Attempts */
    maxAttempts: number = 5,
    /** Window Minutes */
    windowMinutes: number = 15,
  ): Promise<RateLimitResult> {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

      const activitiesSnapshot = await db
        .collection(USER_ACTIVITIES)
        .where("ipAddress", "==", ipAddress)
        .where("action", "==", action)
        .where("timestamp", ">=", windowStart)
        .get();

      const attemptCount = activitiesSnapshot.size;
      const allowed = attemptCount < maxAttempts;
      const remainingAttempts = Math.max(0, maxAttempts - attemptCount);
      const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000);

      return {
        allowed,
        remainingAttempts,
        resetAt,
      };
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerService.checkRateLimit",
        /** Action */
        action: "check_rate_limit",
        /** Metadata */
        metadata: {
          ipAddress,
          action,
        },
      });
      // On error, allow the action
      return {
        /** Allowed */
        allowed: true,
        /** Remaining Attempts */
        remainingAttempts: maxAttempts,
        /** Reset At */
        resetAt: new Date(Date.now() + windowMinutes * 60 * 1000),
      };
    }
  }

  /**
   * Get recent activities for an IP address
   */
  async getActivitiesByIP(
    /** Ip Address */
    ipAddress: string,
    /** Limit */
    limit: number = 50,
  ): Promise<any[]> {
    try {
      const snapshot = await db
        .collection(USER_ACTIVITIES)
        .where("ipAddress", "==", ipAddress)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc: any) => doc.data());
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerService.getActivitiesByIP",
        /** Action */
        action: "get_activities_by_ip",
        /** Metadata */
        metadata: { ipAddress },
      });
      return [];
    }
  }

  /**
   * Get recent activities for a user
   */
  async getActivitiesByUser(
    /** User Id */
    userId: string,
    /** Limit */
    limit: number = 50,
  ): Promise<any[]> {
    try {
      const snapshot = await db
        .collection(USER_ACTIVITIES)
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc: any) => doc.data());
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerService.getActivitiesByUser",
        /** Action */
        action: "get_activities_by_user",
        /** Metadata */
        metadata: { userId },
      });
      return [];
    }
  }

  /**
   * Get unique users from same IP (detect multiple accounts)
   */
  async getUsersFromIP(ipAddress: string): Promise<string[]> {
    try {
      const snapshot = await db
        .collection(USER_ACTIVITIES)
        .where("ipAddress", "==", ipAddress)
        .where("userId", "!=", null)
        .get();

      /**
 * Custom React hook for r ids
 *
 * @returns {any} The userids result
 *
 */
const userIds = new Set<string>();
      snapshot.docs.forEach((doc: any) => {
        const userId = doc.data().userId;
        if (userId) userIds.add(userId);
      });

      return Array.from(userIds);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerService.getUsersFromIP",
        /** Action */
        action: "get_users_from_ip",
        /** Metadata */
        metadata: { ipAddress },
      });
      return [];
    }
  }

  /**
   * Get suspicious activity indicators for an IP
   */
  async getSuspiciousActivityScore(ipAddress: string): Promise<{
    /** Score */
    score: number;
    /** Reasons */
    reasons: string[];
  }> {
    try {
      let score = 0;
      const reasons: string[] = [];

      // Check failed login attempts in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const failedLoginsSnapshot = await db
        .collection(USER_ACTIVITIES)
        .where("ipAddress", "==", ipAddress)
        .where("action", "==", "login_failed")
        .where("timestamp", ">=", oneHourAgo)
        .get();

      if (failedLoginsSnapshot.size >= 3) {
        score += 30;
        reasons.push(
          `${failedLoginsSnapshot.size} failed login attempts in last hour`,
        );
      }

      // Check multiple user accounts from same IP
      const userIds = await this.getUsersFromIP(ipAddress);
      if (userIds.length >= 5) {
        score += 20;
        reasons.push(`${userIds.length} different accounts from same IP`);
      }

      // Check high-frequency actions in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentActivitiesSnapshot = await db
        .collection(USER_ACTIVITIES)
        .where("ipAddress", "==", ipAddress)
        .where("timestamp", ">=", fiveMinutesAgo)
        .get();

      if (recentActivitiesSnapshot.size >= 50) {
        score += 40;
        reasons.push(
          `${recentActivitiesSnapshot.size} actions in last 5 minutes (potential bot)`,
        );
      }

      // Check rapid account creation
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const registrationsSnapshot = await db
        .collection(USER_ACTIVITIES)
        .where("ipAddress", "==", ipAddress)
        .where("action", "==", "register")
        .where("timestamp", ">=", oneDayAgo)
        .get();

      if (registrationsSnapshot.size >= 3) {
        score += 50;
        reasons.push(
          `${registrationsSnapshot.size} registrations in last 24 hours`,
        );
      }

      return { score, reasons };
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerService.getSuspiciousActivityScore",
        /** Action */
        action: "get_suspicious_activity_score",
        /** Metadata */
        metadata: { ipAddress },
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
