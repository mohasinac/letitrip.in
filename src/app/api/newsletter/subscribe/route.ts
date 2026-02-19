/**
 * Newsletter Subscribe API
 *
 * POST /api/newsletter/subscribe — Subscribe an email address
 *
 * No authentication required — open endpoint.
 * Rate limiting is handled at the edge/infra level (future).
 */

import { NextRequest } from "next/server";
import { newsletterRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  source: z.string().max(50).optional(),
});

/**
 * POST /api/newsletter/subscribe
 *
 * Body: { email: string, source?: string }
 *
 * - Creates a new subscriber or re-activates a lapsed one.
 * - Already-active subscribers receive a 200 with the same success message
 *   (avoids leaking subscription status).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message;
      return errorResponse(
        firstError || ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
        400,
      );
    }

    const { email, source } = validation.data;

    const { isNew } = await newsletterRepository.subscribe({ email, source });

    serverLogger.info(
      isNew ? "Newsletter subscribe" : "Newsletter duplicate subscribe",
      { email },
    );

    // Always return the same message to avoid leaking subscription status
    return successResponse(
      { email },
      SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED,
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
