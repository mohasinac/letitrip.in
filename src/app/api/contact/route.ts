import "@/providers.config";
/**
 * Contact API Route
 * POST /api/contact — Send a contact message to support
 */

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/next";

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
    if (!result.success)
      return errorResponse(ERROR_MESSAGES.CONTACT.SEND_FAILED, 500);
    return successResponse({ sent: true }, SUCCESS_MESSAGES.CONTACT.SENT);
  },
});
