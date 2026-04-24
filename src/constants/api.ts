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
} as const;
