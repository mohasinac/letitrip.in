import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
  updateBrandAction,
  deleteBrandAction,
} from "@mohasinac/appkit";

const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoURL: z.string().optional(),
  bannerURL: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().optional(),
  founded: z.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const brand = await categoriesRepository.findById(id);
      if (!brand || brand.categoryType !== "brand") return errorResponse("Brand not found", 404);
      return successResponse(brand);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateBrandSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: updateBrandSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const updated = await updateBrandAction(id, body!);
      return successResponse(updated, "Brand updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await deleteBrandAction(id);
      return successResponse(null, "Brand deleted");
    },
  }),
);
