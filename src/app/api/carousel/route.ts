/**
 * Carousel Slides API Routes
 *
 * Handles homepage carousel with 9x9 grid system
 *
 * TODO (Future) - Phase 2:
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
import { errorResponse, successResponse } from "@/lib/api-response";
import { getBooleanParam, getSearchParams } from "@/lib/api/request-helpers";
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
import { handleApiError } from "@/lib/errors/error-handler";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/carousel
 *
 * Get active carousel slides
 *
 * Query Parameters:
 * - includeInactive: boolean (optional, admin only)
 *
 * Ã¢Å“â€¦ Fetches active slides via carouselRepository.getActiveSlides()
 * Ã¢Å“â€¦ Returns only active slides (max 5) for public; all slides for admins
 * Ã¢Å“â€¦ Sorted by order field ascending
 * Ã¢Å“â€¦ Cache-Control headers set (5 min public / no-cache admin)
 * TODO (Future): Track views analytics per slide
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = getSearchParams(request);
    const includeInactive =
      getBooleanParam(searchParams, "includeInactive") === true;

    // Check authorization for inactive slides (admin only)
    if (includeInactive) {
      const user = await getUserFromRequest(request);
      if (user?.role !== "admin") {
        return errorResponse(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED, 403);
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
    return errorResponse(ERROR_MESSAGES.CAROUSEL.FETCH_FAILED, 500);
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
 * Ã¢Å“â€¦ Requires admin authentication via requireRoleFromRequest
 * Ã¢Å“â€¦ Validates body with carouselCreateSchema (Zod)
 * Ã¢Å“â€¦ Enforces max 5 active slides limit
 * Ã¢Å“â€¦ Creates slide via carouselRepository.create()
 * Ã¢Å“â€¦ Returns created slide with 201 status
 * TODO (Future): Validate grid card positions for overlaps in 9x9 grid
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(carouselCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Check active slides limit (max 5 active)
    if (validation.data.active) {
      const activeSlides = await carouselRepository.getActiveSlides();
      if (activeSlides.length >= 5) {
        return errorResponse(ERROR_MESSAGES.CAROUSEL.MAX_ACTIVE_REACHED, 400, {
          currentActive: activeSlides.length,
          maxAllowed: 5,
          suggestion:
            "Deactivate an existing slide before creating a new active one",
        });
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

    return successResponse(slide, SUCCESS_MESSAGES.CAROUSEL.CREATED, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
