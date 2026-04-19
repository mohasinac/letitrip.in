import "@/providers.config";
/**
 * Contact API Route
 * POST /api/contact — Send a contact message to support
 */

import { z } from "zod";
import { sendContactEmail } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";

const contactSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  subject: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export const POST = createRouteHandler<(typeof contactSchema)["_output"]>({
  schema: contactSchema,
  handler: async ({ request, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { name, email, subject, message } = body!;
    serverLogger.info("Contact form submission received", { subject });
    const result = await sendContactEmail({ name, email, subject, message });
    if (!result.success && process.env.NODE_ENV !== "production") {
      serverLogger.warn(
        "Contact email provider failed in non-production; returning mocked success",
        { subject },
      );
      return successResponse(
        { sent: true, mocked: true },
        SUCCESS_MESSAGES.CONTACT.SENT,
      );
    }
    if (!result.success)
      return errorResponse(ERROR_MESSAGES.CONTACT.SEND_FAILED, 500);
    return successResponse({ sent: true }, SUCCESS_MESSAGES.CONTACT.SENT);
  },
});

