/**
 * Carousel API - Individual Slide Routes
 *
 * Handles individual carousel slide operations
 */

import { NextRequest, NextResponse } from "next/server";
import { carouselRepository } from "@/repositories";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  carouselUpdateSchema,
} from "@/lib/validation/schemas";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";

/**
 * GET /api/carousel/[id]
 *
 * Get carousel slide by ID
 *
 * Public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch carousel slide
    const slide = await carouselRepository.findById(id);

    if (!slide) {
      throw new NotFoundError("Carousel slide not found");
    }

    return NextResponse.json({
      success: true,
      data: slide,
    });
  } catch (error) {
    const { id } = await params;
    console.error(
      `GET /api/carousel/${id} ${ERROR_MESSAGES.API.CAROUSEL_ID_GET_ERROR}`,
      error,
    );

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch carousel slide" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/carousel/[id]
 *
 * Update carousel slide
 *
 * Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Fetch carousel slide
    const slide = await carouselRepository.findById(id);

    if (!slide) {
      throw new NotFoundError("Carousel slide not found");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(carouselUpdateSchema, body);

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

    // Check active slides limit if activating this slide
    if (validation.data.active && !slide.active) {
      const activeSlides = await carouselRepository.getActiveSlides();
      if (activeSlides.length >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Maximum 5 active carousel slides allowed",
            details: {
              currentActive: activeSlides.length,
              maxAllowed: 5,
              suggestion:
                "Deactivate an existing slide before activating this one",
            },
          },
          { status: 400 },
        );
      }
    }

    // Update carousel slide
    const updatedSlide = await carouselRepository.update(id, validation.data);

    return NextResponse.json({
      success: true,
      data: updatedSlide,
    });
  } catch (error) {
    const { id } = await params;
    console.error(
      `PATCH /api/carousel/${id} ${ERROR_MESSAGES.API.CAROUSEL_ID_PATCH_ERROR}`,
      error,
    );

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

    return NextResponse.json(
      { success: false, error: "Failed to update carousel slide" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/carousel/[id]
 *
 * Delete carousel slide
 *
 * Requires admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Fetch carousel slide
    const slide = await carouselRepository.findById(id);

    if (!slide) {
      throw new NotFoundError("Carousel slide not found");
    }

    // Delete carousel slide (hard delete - carousel slides can be removed)
    await carouselRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: "Carousel slide deleted successfully",
    });
  } catch (error) {
    const { id } = await params;
    console.error(
      `DELETE /api/carousel/${id} ${ERROR_MESSAGES.API.CAROUSEL_ID_DELETE_ERROR}`,
      error,
    );

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

    return NextResponse.json(
      { success: false, error: "Failed to delete carousel slide" },
      { status: 500 },
    );
  }
}
