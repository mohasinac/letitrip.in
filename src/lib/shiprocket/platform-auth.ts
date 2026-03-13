/**
 * Platform Shiprocket Authentication
 *
 * Resolves the platform-level Shiprocket credentials from Firestore
 * siteSettings (admin-configurable) with env-var fallback.
 *
 * Credential resolution order:
 *   1. Firestore siteSettings.credentials.shiprocketEmail / shiprocketPassword
 *      (set via Admin › Site Settings › Credentials)
 *   2. Environment variables SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD
 *
 * The returned token is refetched whenever it is absent or expired.
 * Token lifetime is ~10 days; we refresh after 9 days to stay safe.
 */

import { AppError } from "@/lib/errors";
import { siteSettingsRepository } from "@/repositories";
import { shiprocketAuthenticate } from "./client";

// ─── In-memory token cache (single-process; good enough for serverless) ────────

interface CachedToken {
  token: string;
  expiresAt: number; // ms epoch
}

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days

let _cache: CachedToken | null = null;

// ─── Credential Resolution ────────────────────────────────────────────────────

async function resolveCredentials(): Promise<{
  email: string;
  password: string;
}> {
  let email = "";
  let password = "";
  try {
    const creds = await siteSettingsRepository.getDecryptedCredentials();
    email = creds.shiprocketEmail || "";
    password = creds.shiprocketPassword || "";
  } catch {
    // DB unavailable — fall through to env vars
  }
  return {
    email: email || process.env.SHIPROCKET_EMAIL || "",
    password: password || process.env.SHIPROCKET_PASSWORD || "",
  };
}

// ─── Platform Token ───────────────────────────────────────────────────────────

/**
 * Get (or refresh) the platform Shiprocket JWT token.
 * Uses in-process cache; safe for serverless — cold-start re-auths once.
 */
export async function getPlatformShiprocketToken(): Promise<string> {
  // Return cached token if still valid
  if (_cache && Date.now() < _cache.expiresAt) {
    return _cache.token;
  }

  const { email, password } = await resolveCredentials();
  if (!email || !password) {
    throw new AppError(
      500,
      "Shiprocket credentials are not configured. Set them in Admin › Site Settings › Credentials, or set SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD in .env.local.",
      "SHIPROCKET_CONFIG_ERROR",
    );
  }

  const authResponse = await shiprocketAuthenticate({ email, password });
  if (!authResponse.token) {
    throw new AppError(
      502,
      "Shiprocket authentication failed — no token returned.",
      "SHIPROCKET_AUTH_ERROR",
    );
  }

  _cache = {
    token: authResponse.token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };

  return _cache.token;
}

/** Invalidate the in-process cache (call after a 401 to force re-auth). */
export function invalidatePlatformShiprocketToken(): void {
  _cache = null;
}
