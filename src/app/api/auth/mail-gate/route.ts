import { withProviders } from "@/providers.config";
/**
 * POST /api/auth/mail-gate — cooldown gate for Firebase-sent auth mail.
 *
 * ## Why this route exists at all
 *
 * Password reset and email verification do NOT go through this app. They were
 * moved to the Firebase client SDK's hosted templates (CLAUDE.md Root Cause
 * #54/#55), which the browser calls directly — no server hop, and therefore no
 * place for `guardSend` or `applyRateLimit` to see them. The result was that
 * these two flows had NO throttle of any kind: not server-side (nothing to
 * hook), and not client-side either (the forgot-password form re-submits
 * freely). A stuck retry loop could mail a real person forty times.
 *
 * So the client asks permission first, and skips the Firebase call when
 * refused.
 *
 * ## 🛑 Be honest about what this is
 *
 * An abuse and annoyance guard, NOT a security boundary. Someone can open a
 * console and call Firebase directly, and this route cannot stop them. That is
 * acceptable: those sends cost nothing (Firebase's own quota, not Resend's
 * 100/day), and the goal is to stop a legitimate user being spammed by a
 * runaway client, not to stop an attacker who has already decided to bypass
 * the UI.
 *
 * ## Anti-enumeration
 *
 * The response NEVER reveals whether an address has an account — it only says
 * whether a request of this kind was made recently. `/auth/forgot-password`
 * deliberately shows the same message either way, and that property must
 * survive this gate.
 */

import { z } from "zod";
import {
  applyRateLimit,
  createRouteHandler,
  errorResponse,
  normalizeError,
  RateLimitPresets,
  serverLogger,
  successResponse,
} from "@mohasinac/appkit";
// `hmacBlindIndex` reaches node crypto, so it lives on the /server entry only —
// importing it from the main barrel would be the client-bundle leak in Root
// Cause #24.
import { authMailCooldownRepository, hmacBlindIndex } from "@mohasinac/appkit/server";

const schema = z.object({
  email: z.string().email(),
  purpose: z.enum(["password_reset", "verify_email"]),
});

/*
 * Unauthenticated by necessity: forgot-password is pre-auth by definition — a
 * user who could authenticate would not need it. Every other auth route under
 * this directory is public for the same reason and none of them declares a
 * role.
 *
 * What stands in for RBAC here: the PASSWORD_RESET rate limit (3/hour/IP), the
 * Firestore cooldown, and the fact that the response carries no account
 * information whatsoever — it says only whether a request of this kind was made
 * recently, never whether the address exists.
 */
export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    schema,
    handler: async ({ request, body }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.PASSWORD_RESET);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const { email, purpose } = body!;

      /*
       * Hash before it touches the collection. `authMailCooldowns` has no PII
       * encryption and needs none — it stores only the fact that *something*
       * asked recently, never who. `hmacBlindIndex` is the same helper that
       * backs `emailIndex` on the users collection, so there is one answer to
       * "how do we key on an address without storing it".
       *
       * Lower-cased first: mail addresses are case-insensitive in practice, and
       * a cooldown that MiXeD case defeats is not a cooldown.
       */
      const emailHash = hmacBlindIndex(email.trim().toLowerCase());

      try {
        const { allowed, retryAfterSeconds } =
          await authMailCooldownRepository.checkAndSet(purpose, emailHash);
        return successResponse({ allowed, retryAfterSeconds });
      } catch (err) {
        const normalized = normalizeError(err);
        /*
         * Fail OPEN. If the cooldown ledger is unreadable, a user locked out of
         * their account must still be able to request a reset — the cost of
         * being wrong in this direction is a duplicate email, and in the other
         * direction it is somebody permanently unable to get back in.
         */
        serverLogger.error("mail-gate: cooldown check failed — allowing", {
          purpose,
          error: normalized.message,
        });
        return successResponse({ allowed: true, retryAfterSeconds: 0 });
      }
    },
  }),
);
