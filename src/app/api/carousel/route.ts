/**
 * Carousel Slides API Routes
 *
 * Handles homepage carousel with 9x9 grid system
 *
 * TODO - Phase 2 Refactoring:
 * - Implement slide management (create, update, delete)
 * - Add slide ordering/reordering
 * - Implement slide activation (max 5 active)
 * - Add A/B testing for slides
 * - Track slide analytics (views, clicks, conversions)
 * - Implement slide scheduling (start/end dates)
 * - Add slide preview/draft mode
 */

import { NextRequest, NextResponse } from "next/server";
import { carouselRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  getUserFromRequest,
  requireRoleFromRequest,
} from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  carouselCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/carousel
 *
 * Get active carousel slides
 *
 * Query Parameters:
 * - includeInactive: boolean (optional, admin only)
 *
 * TODO: Implement carousel fetching
 * TODO: Return only active slides (max 5) by default
 * TODO: Sort by order field
 * TODO: Add aggressive caching (CDN + Redis, 5 min TTL)
 * TODO: Track views analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Check authorization for inactive slides (admin only)
    if (includeInactive) {
      const user = await getUserFromRequest(request);
      if (user?.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error: ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED,
          },
          { status: 403 },
        );
      }
    }

    // Query carousel slides from repository
    const slides = includeInactive
      ? await carouselRepository.findAll()
      : await carouselRepository.getActiveSlides();

    // Sort by order field
    slides.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Enforce max 5 active slides in response (for public)
    const limitedSlides = includeInactive ? slides : slides.slice(0, 5);

    return NextResponse.json(
      { success: true, data: limitedSlides },
      {
        headers: {
          // Add cache headers for public access
          "Cache-Control": includeInactive
            ? "private, no-cache" // Admin: no cache
            : "public, max-age=300, s-maxage=600, stale-while-revalidate=120", // Public: 5-10 min cache + SWR
        },
      },
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CAROUSEL_GET_ERROR, { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.CAROUSEL.FETCH_FAILED },
      { status: 500 },
    );
  }
}

/**
 * POST /api/carousel
 *
 * Create new carousel slide (admin only)
 *
 * Body:
 * - title: string (required)
 * - media: object (type, url, alt)
 * - gridCards: GridCard[] (9x9 grid configuration)
 * - order: number
 * - active: boolean
 *
 * TODO: Implement slide creation
 * TODO: Require admin authentication
 * TODO: Validate grid card positions (no overlaps)
 * TODO: Enforce max 5 active slides limit
 * TODO: Return created slide
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(carouselCreateSchema, body);

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

    // Check active slides limit (max 5 active)
    if (validation.data.active) {
      const activeSlides = await carouselRepository.getActiveSlides();
      if (activeSlides.length >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: ERROR_MESSAGES.CAROUSEL.MAX_ACTIVE_REACHED,
            details: {
              currentActive: activeSlides.length,
              maxAllowed: 5,
              suggestion:
                "Deactivate an existing slide before creating a new active one",
            },
          },
          { status: 400 },
        );
      }
    }

    // TODO (Future): Validate grid card positions (no overlaps in 9x9 grid)
    // const hasOverlap = validateGridPositions(validation.data.gridCards);
    // if (hasOverlap) {
    //   return NextResponse.json(
    //     { success: false, error: 'Grid card positions overlap' },
    //     { status: 400 }
    //   );
    // }

    // Create carousel slide
    const slide = await carouselRepository.create({
      ...validation.data,
      cards: validation.data.gridCards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
        content: card.content || { title: "", subtitle: "", description: "" },
        buttons: (card.buttons || []).map((btn, btnIndex) => ({
          ...btn,
          id: `btn-${Date.now()}-${index}-${btnIndex}`,
        })),
      })),
      createdBy: user.uid,
    });

    return NextResponse.json(
      {
        success: true,
        data: slide,
        message: SUCCESS_MESSAGES.CAROUSEL.CREATED,
      },
      { status: 201 },
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CAROUSEL_POST_ERROR, { error });

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
      { success: false, error: ERROR_MESSAGES.CAROUSEL.CREATE_FAILED },
      { status: 500 },
    );
  }
}
