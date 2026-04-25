/**
 * API Route Constants
 *
 * Centralized API endpoint strings for all client-side fetch calls.
 * Prevents scattering of raw "/api/..." strings across components.
 */

export const API_ROUTES = {
  AUTH: {
    LOGOUT: "/api/auth/logout",
  },
  NEWSLETTER: {
    SUBSCRIBE: "/api/newsletter/subscribe",
  },
  DEMO: {
    SEED: "/api/demo/seed",
  },
  EVENTS: {
    LIST: "/api/events",
    BY_ID: (id: string) => `/api/events/${id}`,
    ENTRIES: (id: string) => `/api/events/${id}/entries`,
    LEADERBOARD: (id: string, limit?: number) =>
      `/api/events/${id}/leaderboard${limit !== undefined ? `?limit=${limit}` : ""}`,
  },
} as const;
