import { normalizeError } from "@mohasinac/appkit/errors/normalize";
/**
 * Session Activity API
 * POST /api/auth/session/activity - Update session last activity timestamp
 */

import { NextRequest } from "next/server";
import { handleApiError } from "@mohasinac/appkit/errors/error-handler";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { z } from "zod";

/*
 * `sessionId` is passed straight to `sessionRepository.updateActivity()`, so a
 * non-string reached a Firestore document path. The old `if (!sessionId)` guard
 * only excluded falsy values.
 *
 * Invisible to `audit-unvalidated-request-body` until 2026-10-17 for the same
 * reason as its parent route: the rule matched only `export const POST`.
 */
const sessionActivitySchema = z.object({
  sessionId: z.string().trim().min(1).max(200),
});
import { sessionRepository } from "@mohasinac/appkit/features/auth/repository/session.repository";
import { verifySessionCookie } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getOptionalSessionCookie } from "@mohasinac/appkit/next/request-helpers";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { errorResponse } from "@mohasinac/appkit/next/api/api-response";

export async function POST(request: NextRequest) {
  try {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) return errorResponse("Too many requests", 429);
    // Get session cookie to verify user
    const sessionCookie = getOptionalSessionCookie(request);
    if (!sessionCookie) {
      throw new ValidationError(ERROR_MESSAGES.SESSION.NOT_FOUND);
    }

    // Verify the session
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      throw new ValidationError(ERROR_MESSAGES.SESSION.INVALID);
    }

    // Get session ID from request
    const parsed = sessionActivitySchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.SESSION.ID_REQUIRED, parsed.error.issues);
    }
    const { sessionId } = parsed.data;

    // Update session activity
    await sessionRepository.updateActivity(sessionId);

    return successResponse(
      undefined,
      SUCCESS_MESSAGES.SESSION.ACTIVITY_UPDATED,
    );
  } catch (error: unknown) {
    void normalizeError(error);
    return handleApiError(error);
  }
}

