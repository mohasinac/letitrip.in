"use server";

/**
 * Site Settings Server Actions — thin entrypoint
 */

import { requireRole } from "@/lib/firebase/auth-server";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import { getSiteSettings, updateSiteSettings } from "@mohasinac/appkit/features/admin";

export async function getSiteSettingsAction(): Promise<unknown> {
  return getSiteSettings();
}

export async function updateSiteSettingsAction(data: Record<string, unknown>): Promise<void> {
  const admin = await requireRole(["admin"]);
  const rl = await rateLimitByIdentifier(`site-settings:update:${admin.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  if (!data || typeof data !== "object") throw new ValidationError("Invalid site settings data");
  return updateSiteSettings(admin.uid, data);
}
