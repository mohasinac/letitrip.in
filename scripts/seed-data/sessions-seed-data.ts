/**
 * Sessions Seed Data
 *
 * Covers all session lifecycle states and device types for testing:
 *   — Active sessions        : admin, seller, regular users (desktop + mobile)
 *   — Multi-device session   : same user, two concurrent devices
 *   — Expired session        : isActive=false because expiresAt is in the past
 *   — User-revoked session   : isActive=false, revokedBy=userId
 *   — Admin-revoked session  : isActive=false, revokedBy="admin" (suspicious activity)
 *
 * All FK references:
 *   userId → users/{uid} (see users-seed-data.ts)
 */

import type { SessionDocument } from "@/db/schema";
import { SESSION_COLLECTION } from "@/db/schema";

// Re-exported so seed-all-data.ts can reference the collection name directly.
export { SESSION_COLLECTION };

export const sessionsSeedData: SessionDocument[] = [
  // ── Active: Admin — Chrome Desktop (Windows) ────────────────────────────
  {
    id: "session-admin-chrome-desktop-001",
    userId: "user-admin-user-admin",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      browser: "Chrome 122",
      os: "Windows 11",
      device: "Desktop",
      ip: "203.0.113.1",
    },
    location: { country: "India", city: "Mumbai" },
    createdAt: new Date("2026-02-25T07:00:00Z"),
    lastActivity: new Date("2026-03-01T08:45:00Z"),
    expiresAt: new Date("2026-03-26T07:00:00Z"),
    isActive: true,
  },

  // ── Active: John Doe — Chrome Desktop ────────────────────────────────────
  {
    id: "session-john-chrome-desktop-001",
    userId: "user-john-doe-johndoe",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      browser: "Chrome 121",
      os: "Windows 11",
      device: "Desktop",
      ip: "203.0.113.10",
    },
    location: { country: "India", city: "Mumbai" },
    createdAt: new Date("2026-02-26T09:00:00Z"),
    lastActivity: new Date("2026-03-01T09:15:00Z"),
    expiresAt: new Date("2026-03-26T09:00:00Z"),
    isActive: true,
  },

  // ── Active: John Doe — Chrome Android (multi-device test) ───────────────
  {
    id: "session-john-chrome-android-002",
    userId: "user-john-doe-johndoe",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
      browser: "Chrome 121",
      os: "Android 14",
      device: "Mobile",
      ip: "203.0.113.11",
    },
    location: { country: "India", city: "Mumbai" },
    createdAt: new Date("2026-02-27T14:30:00Z"),
    lastActivity: new Date("2026-03-01T06:00:00Z"),
    expiresAt: new Date("2026-03-27T14:30:00Z"),
    isActive: true,
  },

  // ── Active: Jane Smith — Safari iOS ─────────────────────────────────────
  {
    id: "session-jane-safari-ios-001",
    userId: "user-jane-smith-janes",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
      browser: "Safari 17",
      os: "iOS 17.3",
      device: "Mobile",
      ip: "203.0.113.20",
    },
    location: { country: "India", city: "Delhi" },
    createdAt: new Date("2026-02-28T10:00:00Z"),
    lastActivity: new Date("2026-03-01T07:30:00Z"),
    expiresAt: new Date("2026-03-28T10:00:00Z"),
    isActive: true,
  },

  // ── Active: TechHub Seller — Chrome macOS Desktop ───────────────────────
  {
    id: "session-techhub-chrome-mac-001",
    userId: "user-techhub-electronics-electron",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      browser: "Chrome 122",
      os: "macOS 14",
      device: "Desktop",
      ip: "203.0.113.30",
    },
    location: { country: "India", city: "Mumbai" },
    createdAt: new Date("2026-02-24T06:00:00Z"),
    lastActivity: new Date("2026-03-01T08:00:00Z"),
    expiresAt: new Date("2026-03-24T06:00:00Z"),
    isActive: true,
  },

  // ── Active: Content Moderator — Firefox Linux Desktop ───────────────────
  {
    id: "session-moderator-firefox-linux-001",
    userId: "user-moderator-mod-user",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
      browser: "Firefox 123",
      os: "Ubuntu Linux",
      device: "Desktop",
      ip: "203.0.113.40",
    },
    location: { country: "India", city: "Mumbai" },
    createdAt: new Date("2026-02-28T08:00:00Z"),
    lastActivity: new Date("2026-03-01T08:55:00Z"),
    expiresAt: new Date("2026-03-28T08:00:00Z"),
    isActive: true,
  },

  // ── Active: Priya Sharma — Chrome iPad (Tablet) ─────────────────────────
  {
    id: "session-priya-chrome-ipad-001",
    userId: "user-priya-sharma-priya",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/121.0.6167.66 Mobile/15E148 Safari/604.1",
      browser: "Chrome 121",
      os: "iOS 17.2",
      device: "Tablet",
      ip: "203.0.113.50",
    },
    location: { country: "India", city: "Hyderabad" },
    createdAt: new Date("2026-02-27T18:00:00Z"),
    lastActivity: new Date("2026-02-28T20:00:00Z"),
    expiresAt: new Date("2026-03-27T18:00:00Z"),
    isActive: true,
  },

  // ── Active: Artisan Crafts Co. seller — Edge Windows Desktop ─────────────
  {
    id: "session-artisan-edge-win-001",
    userId: "user-artisan-crafts-artisan",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
      browser: "Edge 122",
      os: "Windows 11",
      device: "Desktop",
      ip: "203.0.113.60",
    },
    location: { country: "India", city: "Jaipur" },
    createdAt: new Date("2026-02-25T10:00:00Z"),
    lastActivity: new Date("2026-02-28T16:30:00Z"),
    expiresAt: new Date("2026-03-25T10:00:00Z"),
    isActive: true,
  },

  // ── Expired: Mike Johnson — Safari macOS (expiresAt is in the past) ──────
  // Tests: admin session list, cleanup queries, session expiry UI badge
  {
    id: "session-mike-safari-mac-expired-001",
    userId: "user-mike-johnson-mikejohn",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
      browser: "Safari 17",
      os: "macOS 14",
      device: "Desktop",
      ip: "203.0.113.70",
    },
    location: { country: "India", city: "Bangalore" },
    createdAt: new Date("2026-01-25T12:00:00Z"),
    lastActivity: new Date("2026-01-29T10:00:00Z"),
    expiresAt: new Date("2026-01-30T12:00:00Z"), // Expired 30 days ago
    isActive: false,
  },

  // ── Expired: Raj Patel — Chrome Android (natural expiry) ─────────────────
  {
    id: "session-raj-chrome-android-expired-001",
    userId: "user-raj-patel-rajpatel",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Samsung Galaxy S23) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
      browser: "Chrome 119",
      os: "Android 13",
      device: "Mobile",
      ip: "203.0.113.80",
    },
    location: { country: "India", city: "Ahmedabad" },
    createdAt: new Date("2026-01-10T09:00:00Z"),
    lastActivity: new Date("2026-01-12T15:00:00Z"),
    expiresAt: new Date("2026-01-15T09:00:00Z"), // Expired 45 days ago
    isActive: false,
  },

  // ── Revoked by User: Raj Patel — old laptop session he revoked manually ──
  // Tests: revoke session API, "Sign out all devices" flow
  {
    id: "session-raj-chrome-desktop-revoked-001",
    userId: "user-raj-patel-rajpatel",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      browser: "Chrome 118",
      os: "Windows 10",
      device: "Desktop",
      ip: "203.0.113.81",
    },
    location: { country: "India", city: "Ahmedabad" },
    createdAt: new Date("2025-12-01T08:00:00Z"),
    lastActivity: new Date("2026-02-01T09:00:00Z"),
    expiresAt: new Date("2026-03-01T08:00:00Z"), // Would still be valid
    isActive: false,
    revokedAt: new Date("2026-02-10T11:00:00Z"),
    revokedBy: "user-raj-patel-rajpatel", // User revoked their own session
  },

  // ── Revoked by Admin: Suspicious session on unknown device ───────────────
  // Tests: admin revoke session API, security audit UI
  {
    id: "session-meera-suspicious-revoked-admin-001",
    userId: "user-meera-nair-meera",
    deviceInfo: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 9; SM-J730F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
      browser: "Chrome 67",
      os: "Android 9",
      device: "Mobile",
      ip: "198.51.100.42", // Unknown IP, flagged as suspicious
    },
    location: { country: "Russia", city: "Moscow" }, // Unexpected country
    createdAt: new Date("2026-02-15T03:22:00Z"),
    lastActivity: new Date("2026-02-15T03:45:00Z"),
    expiresAt: new Date("2026-03-15T03:22:00Z"),
    isActive: false,
    revokedAt: new Date("2026-02-15T09:00:00Z"),
    revokedBy: "admin", // Admin revoked after security review
  },
];
