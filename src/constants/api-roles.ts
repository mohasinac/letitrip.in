/**
 * Role tuples for `createRouteHandler({ roles: [...] })` and equivalent guards.
 *
 * Why a constant: the same 5 distinct tuples appear across ~30 API route files.
 * Inlining the literal arrays drifted in this session — `/api/store/orders`,
 * `/api/store/analytics`, and `/api/store/payouts` were `auth: true` only,
 * silently allowing buyers through to a 200 (with empty data) instead of 403.
 * Centralising them so the audit surface is a single import is cheaper than
 * keeping ~30 inline tuples in sync.
 *
 * The string values mirror the user-role tokens accepted by
 * `createRouteHandler({ roles })` (see appkit `auth` middleware). Keep in sync
 * with `scripts/qa/_constants.mjs > USER_ROLES`.
 */

import type { UserRole } from "@mohasinac/appkit";

// ── Canonical role tokens ────────────────────────────────────────────────────
// Adding a new role: extend the union in appkit and add the literal here.
// Note: the appkit `UserRole` union uses `"user"` for the buyer role
// (not `"buyer"`). Anything that needs to distinguish buyers from anonymous
// callers should still rely on `auth: true` + role check, not a separate role.
export const USER_ROLE = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  MODERATOR: "moderator",
  SELLER: "seller",
  USER: "user",
} as const satisfies Record<string, UserRole>;

// ── Role-tuple presets ───────────────────────────────────────────────────────
// Each tuple is the *list of roles allowed to invoke the guarded handler*.
// "Allowed" means: `requireRoleAny(user, tuple)` lets the call through; any
// other role gets 403.

/** Admin-only — site-wide management (users, settings, dashboards). */
export const ROLES_ADMIN_ONLY: readonly UserRole[] = [USER_ROLE.ADMIN];

/** Admin + moderator — content moderation surfaces (ban review). */
export const ROLES_ADMIN_MOD: readonly UserRole[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.MODERATOR,
];

/** Admin + employee — trust & safety ops (scam registry, support tickets). */
export const ROLES_TRUST_SAFETY: readonly UserRole[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.EMPLOYEE,
];

/** Seller dashboard write-paths — own store only; admin escalation. */
export const ROLES_STORE_WRITE: readonly UserRole[] = [
  USER_ROLE.SELLER,
  USER_ROLE.ADMIN,
];

/** Seller dashboard read-paths — same plus moderators for support review. */
export const ROLES_STORE_READ: readonly UserRole[] = [
  USER_ROLE.SELLER,
  USER_ROLE.ADMIN,
  USER_ROLE.MODERATOR,
];

/** All admin-tier (admin + moderator + seller) — rare; usually means a leak. */
export const ROLES_ANY_STAFF: readonly UserRole[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.MODERATOR,
  USER_ROLE.SELLER,
];
