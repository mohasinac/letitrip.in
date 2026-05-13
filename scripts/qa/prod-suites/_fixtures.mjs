/**
 * Shared fixtures for end-to-end smoke against live prod.
 *
 * Env contract (loaded from .env.local by the orchestrator):
 *   SMOKE_BASE_URL              default https://www.letitrip.in
 *   SMOKE_LOCALE                default en
 *   SMOKE_ADMIN_EMAIL/PASSWORD  default admin@letitrip.in / TempPass123!
 *   SMOKE_SELLER_EMAIL/PASSWORD default seller-pokemon@letitrip.in / TempPass123!
 *   SMOKE_BUYER_EMAIL/PASSWORD  default buyer-ravi@letitrip.in / TempPass123!
 *   FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY
 *     — service-account creds for the OTP bypass.
 */

export const BASE_URL = process.env.SMOKE_BASE_URL || "https://www.letitrip.in";
export const LOCALE = process.env.SMOKE_LOCALE || "en";
export const SMOKE_PREFIX = `smoke-${Date.now().toString(36)}`;

export const ROLES = {
  admin: {
    email: process.env.SMOKE_ADMIN_EMAIL || "admin@letitrip.in",
    password: process.env.SMOKE_ADMIN_PASSWORD || "TempPass123!",
    expectedRole: "admin",
  },
  seller: {
    email: process.env.SMOKE_SELLER_EMAIL || "aryan@pokemonpalace.in",
    password: process.env.SMOKE_SELLER_PASSWORD || "TempPass123!",
    expectedRole: "seller",
  },
  buyer: {
    email: process.env.SMOKE_BUYER_EMAIL || "rahul.sharma@gmail.com",
    password: process.env.SMOKE_BUYER_PASSWORD || "TempPass123!",
    expectedRole: "buyer",
  },
};

/** Tracks resources we've created so the orchestrator can clean them up. */
const _cleanupRegistry = [];

export function registerCleanup(kind, uid, resourceId) {
  _cleanupRegistry.push({ kind, uid, resourceId });
}

export function listCleanup() {
  return _cleanupRegistry.slice();
}

export function smokeId(label) {
  return `${SMOKE_PREFIX}-${label}`;
}
