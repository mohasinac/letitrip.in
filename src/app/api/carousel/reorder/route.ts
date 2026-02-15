/**
 * Carousel API - Reorder Endpoint
 *
 * Handles reordering carousel slides
 */

import { NextRequest, NextResponse } from "next/server";
import { carouselRepository } from "@/repositories";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  carouselReorderSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * POST /api/carousel/reorder
 *
 * Reorder carousel slides
 *
 * Body:
 * - slideIds: string[] (array of slide IDs in desired order)
 *
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(carouselReorderSchema, body);

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

    const { slideIds } = validation.data;

    // Update order for each slide
    const updatePromises = slideIds.map((slideId, index) =>
      carouselRepository.update(slideId, { order: index + 1 }),
    );

    await Promise.all(updatePromises);

    // Fetch updated slides in new order
    const updatedSlides = await carouselRepository.findAll();
    updatedSlides.sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({
      success: true,
      data: updatedSlides,
      message: SUCCESS_MESSAGES.CAROUSEL.REORDERED,
    });
  } catch (error) {
    serverLogger.error("POST /api/carousel/reorder error", { error });

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

    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.CAROUSEL.REORDER_FAILED },
      { status: 500 },
    );
  }
}
