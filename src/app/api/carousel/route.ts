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
 * - Implement slide scheduling (start/end dates)
 * - Add slide preview/draft mode
 * Done: Track slide analytics (views, clicks) — ✅ views fire-and-forget in GET (Phase 7 tech debt)
 */

import { carouselRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getBooleanParam, getSearchParams } from "@/lib/api/request-helpers";
import { getUserFromRequest } from "@/lib/security/authorization";
import { carouselCreateSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import type { GridCard } from "@/db/schema";
import { createApiHandler } from "@/lib/api/api-handler";

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
 * Done: View count fire-and-forget tracking implemented below (Phase 7 tech debt)
 */
export const GET = createApiHandler({
  handler: async ({ request }) => {
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
      ? (
          await carouselRepository.list({
            sorts: "order",
            page: "1",
            pageSize: "100",
          })
        ).items
      : await carouselRepository.getActiveSlides();

    // Sort by order field
    slides.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Enforce max 5 active slides in response (for public)
    const limitedSlides = includeInactive ? slides : slides.slice(0, 5);

    // Track views asynchronously (fire-and-forget) for public fetches only.
    // Analytics failures must never block the response.
    if (!includeInactive && limitedSlides.length > 0) {
      Promise.all(
        limitedSlides.map((slide) =>
          carouselRepository.incrementViews(slide.id),
        ),
      ).catch(() => {
        // Intentionally swallowed — analytics must not affect availability
      });
    }

    const response = successResponse(limitedSlides);
    response.headers.set(
      "Cache-Control",
      includeInactive
        ? "private, no-cache"
        : "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
    );
    return response;
  },
});

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
export const POST = createApiHandler<(typeof carouselCreateSchema)["_output"]>({
  auth: true,
  roles: ["admin"],
  schema: carouselCreateSchema,
  handler: async ({ user, body }) => {
    if (body!.active) {
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
    const slide = await carouselRepository.create({
      ...body!,
      cards: body!.cards.map((card, index) => ({
        ...card,
        gridRow: card.gridRow as 1 | 2,
        gridCol: card.gridCol as 1 | 2 | 3,
        id: `card-${Date.now()}-${index}`,
        content: card.content || { title: "", subtitle: "", description: "" },
        buttons: (card.buttons || []).map((btn, btnIndex) => ({
          ...btn,
          id: `btn-${Date.now()}-${index}-${btnIndex}`,
        })),
        isButtonOnly: card.isButtonOnly ?? false,
        sizing: card.sizing as GridCard["sizing"],
      })),
      createdBy: user!.uid,
    });
    return successResponse(slide, SUCCESS_MESSAGES.CAROUSEL.CREATED, 201);
  },
});
