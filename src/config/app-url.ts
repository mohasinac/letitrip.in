/**
 * Dynamically determine app URLs based on environment.
 *
 * Priority for APP_URL:
 * 1. Explicit NEXT_PUBLIC_APP_URL (for multi-domain setups)
 * 2. Vercel production URL (VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL)
 * 3. Explicit NEXT_PUBLIC_SITE_URL (fallback for backward compat)
 * 4. Localhost for dev
 *
 * Vercel auto-env vars:
 * - VERCEL_ENV: 'production' | 'preview' | 'development'
 * - VERCEL_URL: preview hostname (auto-set on preview/staging)
 * - VERCEL_PROJECT_PRODUCTION_URL: custom production domain
 */

function getAppUrl(): string {
  // Explicit override (e.g., for multi-domain or custom setup)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Production deployment on Vercel — use custom domain if set, else auto domain
  if (process.env.VERCEL_ENV === "production") {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }

  // Preview/staging deployments on Vercel
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return "http://localhost:3000";
}

function getApiUrl(): string {
  // Explicit override
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return `${getAppUrl()}/api`;
}

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return getAppUrl();
}

export const APP_URL = getAppUrl();
export const API_URL = getApiUrl();
export const SITE_URL = getSiteUrl();

// For NextAuth (server-side only)
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || APP_URL;
