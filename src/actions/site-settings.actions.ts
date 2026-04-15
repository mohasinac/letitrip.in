"use server";

/**
 * Site Settings Server Actions
 *
 * READ + WRITE actions for site settings, replacing the former
 * siteSettingsService → apiClient → API route chain (5 hops → 2 hops).
 */

import { requireRole } from "@/lib/firebase/auth-server";
import { siteSettingsRepository } from "@/repositories";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@mohasinac/appkit/monitoring";

export async function getSiteSettingsAction(): Promise<unknown> {
  const settings = await siteSettingsRepository.getSingleton();
  return settings ?? null;
}

export async function updateSiteSettingsAction(
  data: Record<string, unknown>,
): Promise<void> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `site-settings:update:${admin.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid site settings data");
  }

  await siteSettingsRepository.updateSingleton(data as any);

  serverLogger.info("updateSiteSettingsAction", { adminId: admin.uid });
}

