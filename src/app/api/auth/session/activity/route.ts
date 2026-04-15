/**
 * Session Activity API
 * POST /api/auth/session/activity - Update session last activity timestamp
 */

import { NextRequest } from "next/server";
import { handleApiError } from "@mohasinac/appkit/errors";
import { ValidationError } from "@mohasinac/appkit/errors";
import { sessionRepository } from "@/repositories";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse } from "@mohasinac/appkit/next";
import { getOptionalSessionCookie } from "@mohasinac/appkit/next";

export async function POST(request: NextRequest) {
  try {
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
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      throw new ValidationError(ERROR_MESSAGES.SESSION.ID_REQUIRED);
    }

    // Update session activity
    await sessionRepository.updateActivity(sessionId);

    return successResponse(
      undefined,
      SUCCESS_MESSAGES.SESSION.ACTIVITY_UPDATED,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

