/**
 * Carousel API - Individual Slide Routes
 *
 * Handles individual carousel slide operations.
 */

import { carouselRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { carouselUpdateSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

type IdParams = { id: string };

/**
 * GET /api/carousel/[id]
 * Public — get a carousel slide by ID.
 */
export const GET = createApiHandler<never, IdParams>({
  handler: async ({ params }) => {
    const { id } = params!;
    const slide = await carouselRepository.findById(id);
    if (!slide) throw new NotFoundError(ERROR_MESSAGES.CAROUSEL.NOT_FOUND);
    return successResponse(slide);
  },
});

/**
 * PATCH /api/carousel/[id]
 * Admin only — update carousel slide; enforces max-5-active limit.
 */
export const PATCH = createApiHandler<
  Partial<(typeof carouselUpdateSchema)["_output"]>,
  IdParams
>({
  roles: ["admin"],
  schema: carouselUpdateSchema,
  handler: async ({ params, body }) => {
    const { id } = params!;
    const slide = await carouselRepository.findById(id);
    if (!slide) throw new NotFoundError(ERROR_MESSAGES.CAROUSEL.NOT_FOUND);

    // Enforce max 5 active slides before activating a new one
    if (body?.active && !slide.active) {
      const activeSlides = await carouselRepository.getActiveSlides();
      if (activeSlides.length >= 5) {
        return errorResponse(ERROR_MESSAGES.CAROUSEL.MAX_ACTIVE_REACHED, 400, {
          currentActive: activeSlides.length,
          maxAllowed: 5,
        });
      }
    }

    const updatedSlide = await carouselRepository.update(id, body as any);
    return successResponse(updatedSlide, SUCCESS_MESSAGES.CAROUSEL.UPDATED);
  },
});

/**
 * DELETE /api/carousel/[id]
 * Admin only — hard delete carousel slide.
 */
export const DELETE = createApiHandler<never, IdParams>({
  roles: ["admin"],
  handler: async ({ params }) => {
    const { id } = params!;
    const slide = await carouselRepository.findById(id);
    if (!slide) throw new NotFoundError(ERROR_MESSAGES.CAROUSEL.NOT_FOUND);
    await carouselRepository.delete(id);
    return successResponse(undefined, SUCCESS_MESSAGES.CAROUSEL.DELETED);
  },
});
