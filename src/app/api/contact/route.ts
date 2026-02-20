/**
 * Contact API Route
 * POST /api/contact — Send a contact message to support
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

const contactSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  subject: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const { name, email, subject, message } = validation.data;

    serverLogger.info("Contact form submission received", { email, subject });

    const result = await sendContactEmail({ name, email, subject, message });

    if (!result.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONTACT.SEND_FAILED },
        { status: 500 },
      );
    }

    return successResponse({ sent: true }, SUCCESS_MESSAGES.CONTACT.SENT);
  } catch (error) {
    return handleApiError(error);
  }
}
