/**
 * Carousel API - Reorder Endpoint
 *
 * Reorders carousel slides by updating each slide's order field.
 */

import { carouselRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { carouselReorderSchema } from "@/lib/validation/schemas";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * POST /api/carousel/reorder
 * Admin only — reorder carousel slides by supplying IDs in desired order.
 */
export const POST = createApiHandler<(typeof carouselReorderSchema)["_output"]>(
  {
    roles: ["admin"],
    schema: carouselReorderSchema,
    handler: async ({ body }) => {
      const { slideIds } = body!;

      // Update order for each slide in parallel (non-transactional; order is a display hint)
      await Promise.all(
        slideIds.map((slideId, index) =>
          carouselRepository.update(slideId, { order: index + 1 }),
        ),
      );

      // Return updated slides sorted by new order
      const updatedSlides = await carouselRepository.findAll();
      updatedSlides.sort((a, b) => (a.order || 0) - (b.order || 0));

      return successResponse(
        updatedSlides,
        SUCCESS_MESSAGES.CAROUSEL.REORDERED,
      );
    },
  },
);
