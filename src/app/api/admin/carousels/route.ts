import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselsRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const createCarouselSchema = z.object({
  name: z.string().min(1).max(200),
  status: z.enum(["active", "draft"]).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:carousel:read",
    handler: async () => {
      const items = await carouselsRepository.listCarousels();
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createCarouselSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:carousel:write",
    schema: createCarouselSchema,
    handler: async ({ body, user }) => {
      const carousel = await carouselsRepository.createCarousel(body!.name, user!.uid);
      if (body!.status === "active") {
        await carouselsRepository.updateCarousel(carousel.id, { status: "active" });
      }
      return successResponse(carousel, "Carousel created", 201);
    },
  }),
);
