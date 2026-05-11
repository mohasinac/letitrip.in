import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productFeaturesRepository,
} from "@mohasinac/appkit";

const productTypeEnum = z.enum(["product", "auction", "preorder", "all"]);
const categoryEnum = z.enum([
  "shipping",
  "seller",
  "condition",
  "platform",
  "auction",
  "preorder",
  "custom",
]);

const updateSchema = z.object({
  label: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().min(1).max(2000).optional(),
  iconColor: z.string().max(80).optional(),
  category: categoryEnum.optional(),
  productTypes: z.array(productTypeEnum).min(1).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10_000).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await productFeaturesRepository.findById(id);
      if (!doc) return errorResponse("Feature not found", 404);
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
      const existing = await productFeaturesRepository.findById(id);
      if (!existing) return errorResponse("Feature not found", 404);
      const updated = await productFeaturesRepository.update(id, body!);
      return successResponse(updated, "Feature updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await productFeaturesRepository.findById(id);
      if (!existing) return errorResponse("Feature not found", 404);
      try {
        await productFeaturesRepository.delete(id);
        return successResponse(null, "Feature deleted");
      } catch (err) {
        return errorResponse(
          err instanceof Error ? err.message : "Failed to delete feature",
          409,
        );
      }
    },
  }),
);
