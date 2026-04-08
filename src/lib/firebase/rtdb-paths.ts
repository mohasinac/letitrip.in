/**
 * Shared Realtime Database path constants.
 *
 * Server routes must import from this file rather than from the client
 * Realtime DB helper, otherwise Next.js can pull the browser Firebase SDK into
 * the server build.
 */
export const RTDB_PATHS = {
  PRESENCE: "presence",
  CHAT: "chat",
  NOTIFICATIONS: "notifications",
  LIVE_UPDATES: "live_updates",
  AUTH_EVENTS: "auth_events",
  PAYMENT_EVENTS: "payment_events",
  BULK_EVENTS: "bulk_events",
} as const;