import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const reorderSchema = z.object({
  slideIds: z.array(z.string()).min(1).max(10),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
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
