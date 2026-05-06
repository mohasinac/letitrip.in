import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const reorderSchema = z.object({
  slideIds: z.array(z.string()).min(1).max(10),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
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
