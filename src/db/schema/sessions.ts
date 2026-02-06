/**
 * Sessions Collection Schema
 *
 * Tracks active user sessions across devices for security and monitoring.
 * Enables session management, multi-device tracking, and admin oversight.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface SessionDocument {
  id: string; // Unique session ID (UUID)
  userId: string; // User who owns this session
  deviceInfo?: {
    // Device information
    userAgent?: string; // Browser/device user agent
    browser?: string; // Parsed browser name
    os?: string; // Operating system
    device?: string; // Device type (mobile, desktop, tablet)
    ip?: string; // IP address (anonymized)
  };
  location?: {
    // Approximate location
    country?: string;
    city?: string;
  };
  createdAt: Date; // Session creation time
  lastActivity: Date; // Last activity timestamp
  expiresAt: Date; // Session expiration time
  isActive: boolean; // Is session still valid
  revokedAt?: Date; // Manual revocation timestamp
  revokedBy?: string; // Who revoked (userId or 'admin')
}

export const SESSION_COLLECTION = "sessions" as const;

// ============================================
// 2. INDEXED FIELDS (Must match firestore.indexes.json)
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * SYNC REQUIRED: Update firestore.indexes.json when changing these
 * Deploy: firebase deploy --only firestore:indexes
 */
export const SESSION_INDEXED_FIELDS = [
  "userId", // For fetching user's sessions
  "isActive", // For filtering active sessions
  "expiresAt", // For cleanup queries
  "createdAt", // For sorting by creation date
  "lastActivity", // For sorting by recent activity
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) sessions
 *
 * Foreign Keys:
 * - sessions/{id}.userId references users/{uid}
 *
 * CASCADE BEHAVIOR:
 * - When user deleted: Delete all user's sessions
 * - When user disabled: Revoke all active sessions
 * - When password changed: Optionally revoke all sessions
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default session data
 */
export const DEFAULT_SESSION_DATA: Partial<SessionDocument> = {
  isActive: true,
};

/**
 * Fields that are publicly readable (for user's own sessions)
 */
export const SESSION_PUBLIC_FIELDS = [
  "id",
  "deviceInfo",
  "location",
  "createdAt",
  "lastActivity",
  "expiresAt",
  "isActive",
] as const;

/**
 * Session expiration duration (5 days in milliseconds)
 */
export const SESSION_EXPIRATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

/**
 * Session activity timeout (30 days - auto-cleanup)
 */
export const SESSION_CLEANUP_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new sessions (omit system-generated fields)
 */
export type SessionCreateInput = Omit<
  SessionDocument,
  "id" | "createdAt" | "lastActivity"
>;

/**
 * Type for updating session activity
 */
export type SessionUpdateInput = {
  lastActivity: Date;
  location?: SessionDocument["location"];
};

/**
 * Type for revoking sessions
 */
export type SessionRevokeInput = {
  isActive: false;
  revokedAt: Date;
  revokedBy: string;
};

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const sessionQueryHelpers = {
  byUserId: (userId: string) => ["userId", "==", userId] as const,
  active: () => ["isActive", "==", true] as const,
  inactive: () => ["isActive", "==", false] as const,
  expired: () => ["expiresAt", "<", new Date()] as const,
  notExpired: () => ["expiresAt", ">=", new Date()] as const,
  recentActivity: (since: Date) => ["lastActivity", ">=", since] as const,
} as const;

/**
 * Helper: Parse user agent string into device info
 */
export function parseUserAgent(
  userAgent: string,
): SessionDocument["deviceInfo"] {
  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = "Unknown";
  if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari")) browser = "Safari";
  else if (ua.includes("edge")) browser = "Edge";

  // OS detection
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    os = "iOS";

  // Device type
  let device = "Desktop";
  if (ua.includes("mobile")) device = "Mobile";
  else if (ua.includes("tablet") || ua.includes("ipad")) device = "Tablet";

  return { userAgent, browser, os, device };
}

/**
 * Helper: Generate unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
