import { withProviders } from "@/providers.config";
import { z } from "zod";
import { carouselRepository } from "@mohasinac/appkit/features/homepage/repository/carousel.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";

const reorderSchema = z.object({
  slideIds: z.array(z.string()).min(1).max(10),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:carousel:write",
    schema: reorderSchema,
    handler: async ({ body }) => {
      const { slideIds } = body!;
      await carouselRepository.reorderSlides(
        slideIds.map((id, index) => ({ id, order: index + 1 })),
      );
      return successResponse({ reordered: slideIds.length }, "Slides reordered");
    },
  }),
);
