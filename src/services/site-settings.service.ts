/**
 * Site Settings Service
 * Pure async functions for site settings API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const siteSettingsService = {
  /** Get global site settings (theme, background config, contact info, social links…) */
  get: () => apiClient.get(API_ENDPOINTS.SITE_SETTINGS.GET),

  /** Update site settings (admin only) */
  update: (data: unknown) =>
    apiClient.patch(API_ENDPOINTS.SITE_SETTINGS.UPDATE, data),
};
