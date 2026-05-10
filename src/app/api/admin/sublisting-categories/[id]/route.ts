import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  sublistingCategoriesRepository,
} from "@mohasinac/appkit";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  coverImage: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await sublistingCategoriesRepository.findById(id);
      if (!doc) return errorResponse("Sub-listing category not found", 404);
      return successResponse(doc);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: updateSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await sublistingCategoriesRepository.findById(id);
      if (!existing) return errorResponse("Sub-listing category not found", 404);
      const updated = await sublistingCategoriesRepository.update(id, body!);
      return successResponse(updated, "Sub-listing category updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await sublistingCategoriesRepository.findById(id);
      if (!existing) return errorResponse("Sub-listing category not found", 404);
      await sublistingCategoriesRepository.delete(id);
      return successResponse(null, "Sub-listing category deleted");
    },
  }),
);
