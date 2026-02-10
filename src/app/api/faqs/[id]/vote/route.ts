/**
 * FAQ Vote API Route
 *
 * Handle helpful/not helpful voting for FAQs
 */

import { NextRequest, NextResponse } from "next/server";
import { faqsRepository } from "@/repositories";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  faqVoteSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

/**
 * POST /api/faqs/[id]/vote
 *
 * Vote on FAQ (helpful/not helpful)
 * Requires authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Check if FAQ exists
    const faq = await faqsRepository.findById(id);
    if (!faq) {
      throw new NotFoundError("FAQ not found");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(faqVoteSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    const { vote } = validation.data;
    const helpful = vote === "helpful";

    // Initialize stats if not present
    const stats = faq.stats || { views: 0, helpful: 0, notHelpful: 0 };

    // Update vote counts
    let updatedFAQ;
    if (helpful) {
      updatedFAQ = await faqsRepository.update(id, {
        stats: {
          ...stats,
          helpful: (stats.helpful || 0) + 1,
        },
      });
    } else {
      updatedFAQ = await faqsRepository.update(id, {
        stats: {
          ...stats,
          notHelpful: (stats.notHelpful || 0) + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        helpful: updatedFAQ.stats?.helpful || 0,
        notHelpful: updatedFAQ.stats?.notHelpful || 0,
      },
      message: helpful
        ? "Thank you for your feedback!"
        : "Thank you for your feedback. We'll work to improve this answer.",
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    serverLogger.error("POST /api/faqs/[id]/vote error", { error });
    return NextResponse.json(
      { success: false, error: "Failed to record vote" },
      { status: 500 },
    );
  }
}
