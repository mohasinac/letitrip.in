import { withProviders } from "@/providers.config";
/**
 * Contact API Route
 * POST /api/contact â€” Send a contact message to support and store in Firestore
 */

import { z } from "zod";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { contactSubmissionsRepository } from "@mohasinac/appkit";
import { normalizeError } from "@mohasinac/appkit";

const contactSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  subject: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export const POST = withProviders(createRouteHandler<(typeof contactSchema)["_output"]>({
  schema: contactSchema,
  handler: async ({ request, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { name, email, subject, message } = body!;
    serverLogger.info("Contact form submission received", { subject });

    /*
     * 🛑 AWAITED, and a failure fails the request.
     *
     * This was fire-and-forget — `.catch()` and carry on — which was survivable
     * only because an email went out alongside it and served as the backup
     * copy. That email is gone (a contact message is a record now, read from
     * /admin/contact and listed in the daily digest), so this write is the ONLY
     * record of the message.
     *
     * Left non-blocking, a Firestore hiccup would return 200 to a customer who
     * had just typed out a support request, and the message would exist
     * nowhere. Telling them it failed is strictly better than losing it
     * silently — they can retry; we cannot recover it.
     */
    try {
      await contactSubmissionsRepository.save({ name, email, subject, message });
    } catch (err) {
      serverLogger.error("Failed to save contact submission to Firestore", {
        error: normalizeError(err).message,
      });
      return errorResponse(ERROR_MESSAGES.CONTACT.SEND_FAILED, 500);
    }

    return successResponse({ sent: true }, SUCCESS_MESSAGES.CONTACT.SENT);
  },
}));
