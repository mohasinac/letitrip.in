import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  carouselsRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const MSG_CAROUSEL_NOT_FOUND = "Carousel not found.";

const updateCarouselSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["active", "draft"]).optional(),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof updateCarouselSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:carousel:write",
    schema: updateCarouselSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await carouselsRepository.findById(id);
      if (!existing) return errorResponse(MSG_CAROUSEL_NOT_FOUND, 404);
      await carouselsRepository.updateCarousel(id, body!);
      const updated = await carouselsRepository.findById(id);
      return successResponse(updated, "Carousel updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:carousel:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await carouselsRepository.findById(id);
      if (!existing) return errorResponse(MSG_CAROUSEL_NOT_FOUND, 404);
      await carouselsRepository.delete(id);
      return successResponse(null, "Carousel deleted");
    },
  }),
);
