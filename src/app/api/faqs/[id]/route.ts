/**
 * FAQs [id] API Routes
 *
 * Individual FAQ operations with ownership checks
 */

import { NextRequest, NextResponse } from "next/server";
import { faqsRepository, siteSettingsRepository } from "@/repositories";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  faqUpdateSchema,
} from "@/lib/validation/schemas";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * GET /api/faqs/[id]
 *
 * Get FAQ by ID with variable interpolation
 * Public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch FAQ
    const faq = await faqsRepository.findById(id);

    if (!faq) {
      throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    }

    // Get site settings for variable interpolation
    const siteSettings = await siteSettingsRepository.getSingleton();

    // Helper function to interpolate variables
    const interpolateVariables = (
      text: string,
      variables: Record<string, string | undefined>,
    ) => {
      let result = text;
      Object.entries(variables).forEach(([key, value]) => {
        if (value) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          result = result.replace(regex, value);
        }
      });
      return result;
    };

    // Interpolate variables in answer
    const interpolatedFAQ = {
      ...faq,
      answer: {
        ...faq.answer,
        text: interpolateVariables(faq.answer.text, {
          companyName: siteSettings.siteName,
          supportEmail: siteSettings.contact.email,
          supportPhone: siteSettings.contact.phone,
          websiteUrl: `https://${siteSettings.siteName}`,
          companyAddress: siteSettings.contact.address,
        }),
      },
    };

    // Increment view count (async, non-blocking)
    const currentStats = faq.stats || { views: 0, helpful: 0, notHelpful: 0 };
    faqsRepository
      .update(id, {
        stats: {
          ...currentStats,
          views: (currentStats.views || 0) + 1,
          lastViewed: new Date(),
        },
      })
      .catch((err) =>
        serverLogger.error("FAQ view count update failed", { error: err }),
      );

    return NextResponse.json({
      success: true,
      data: interpolatedFAQ,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    serverLogger.error("GET /api/faqs/[id] error", { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.FAQ.FETCH_FAILED },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/faqs/[id]
 *
 * Update FAQ
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Check if FAQ exists
    const faq = await faqsRepository.findById(id);
    if (!faq) {
      throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(faqUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    // Update FAQ
    const updatedFAQ = await faqsRepository.update(id, validation.data as any);

    return NextResponse.json({
      success: true,
      data: updatedFAQ,
      message: SUCCESS_MESSAGES.FAQ.UPDATED,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    serverLogger.error("PATCH /api/faqs/[id] error", { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.FAQ.UPDATE_FAILED },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/faqs/[id]
 *
 * Delete FAQ
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Check if FAQ exists
    const faq = await faqsRepository.findById(id);
    if (!faq) {
      throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    }

    // Hard delete FAQ (FAQs can be removed completely)
    await faqsRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.FAQ.DELETED,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    serverLogger.error("DELETE /api/faqs/[id] error", { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.FAQ.DELETE_FAILED },
      { status: 500 },
    );
  }
}
