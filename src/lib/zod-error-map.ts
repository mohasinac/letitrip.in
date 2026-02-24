/**
 * Zod v4 Global Error Map
 *
 * Replaces Zod's default machine-y messages ("String must contain at least 1
 * character(s)") with human-friendly strings drawn from ERROR_MESSAGES constants.
 *
 * Zod v4 differences from v3:
 *   - Error map takes a single `issue` argument (no `ctx` parameter)
 *   - Issue codes: `invalid_string` → `invalid_format`, `invalid_enum_value` → `invalid_value`
 *   - String format stored in `issue.format` (not `issue.validation`)
 *   - Return type: `{ message: string }`
 *
 * Usage:
 *   Server-side — called in src/i18n/request.ts on every incoming request.
 *   Client-side — applied once by <ZodSetup /> in the root layout.
 */

import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants";

export function zodErrorMap(
  issue: Parameters<Parameters<typeof z.setErrorMap>[0]>[0],
): { message: string } {
  const code = issue.code as string;

  // -----------------------------------------------------------------
  // Type mismatch — most commonly "required" (undefined/null received)
  // -----------------------------------------------------------------
  if (code === "invalid_type") {
    const inp = (issue as { input?: unknown }).input;
    if (inp === undefined || inp === null) {
      return { message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD };
    }
    return { message: "Invalid type" };
  }

  // -----------------------------------------------------------------
  // Too short — string min(1) → "required"; higher mins → char count
  // -----------------------------------------------------------------
  if (code === "too_small") {
    const i = issue as {
      origin?: string;
      minimum?: number | bigint;
    };
    const min = Number(i.minimum ?? 0);
    if (i.origin === "string") {
      if (min <= 1)
        return { message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD };
      return {
        message: `Must be at least ${min} character${min === 1 ? "" : "s"}`,
      };
    }
    if (i.origin === "array" || i.origin === "set") {
      return {
        message: `Must contain at least ${min} item${min === 1 ? "" : "s"}`,
      };
    }
    return { message: `Must be at least ${min}` };
  }

  // -----------------------------------------------------------------
  // Too long — string max; array max
  // -----------------------------------------------------------------
  if (code === "too_big") {
    const i = issue as { origin?: string; maximum?: number | bigint };
    const max = Number(i.maximum ?? 0);
    if (i.origin === "string") {
      return {
        message: `Must be at most ${max} character${max === 1 ? "" : "s"}`,
      };
    }
    if (i.origin === "array" || i.origin === "set") {
      return {
        message: `Must contain at most ${max} item${max === 1 ? "" : "s"}`,
      };
    }
    return { message: `Must be at most ${max}` };
  }

  // -----------------------------------------------------------------
  // Invalid string format — email, url, etc. (Zod v4: `invalid_format`)
  // -----------------------------------------------------------------
  if (code === "invalid_format") {
    const fmt = (issue as { format?: string }).format ?? "";
    if (fmt === "email")
      return { message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL };
    if (fmt === "url") return { message: "Please enter a valid URL" };
    if (fmt === "uuid" || fmt === "guid")
      return { message: "Invalid ID format" };
    if (fmt === "regex")
      return { message: ERROR_MESSAGES.VALIDATION.INVALID_INPUT };
    return { message: `Invalid ${fmt} format` };
  }

  // -----------------------------------------------------------------
  // Enum / literal mismatch  (Zod v4: `invalid_value`)
  // -----------------------------------------------------------------
  if (code === "invalid_value") {
    const opts = (issue as { values?: unknown[] }).values;
    if (opts?.length) {
      return { message: `Invalid value. Expected one of: ${opts.join(", ")}` };
    }
    return { message: ERROR_MESSAGES.VALIDATION.INVALID_INPUT };
  }

  // -----------------------------------------------------------------
  // Custom error — pass through message if present
  // -----------------------------------------------------------------
  if (code === "custom") {
    const msg = (issue as { message?: string }).message;
    if (msg) return { message: msg };
  }

  // Fall back to whatever message Zod already attached
  return {
    message: (issue as { message?: string }).message ?? "Invalid value",
  };
}

/**
 * Apply the custom error map globally.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
let _applied = false;
export function setupZodErrorMap(): void {
  if (_applied) return;
  z.setErrorMap(zodErrorMap);
  _applied = true;
}
