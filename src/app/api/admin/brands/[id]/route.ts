import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  brandsRepository,
} from "@mohasinac/appkit";

const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoURL: z.string().optional(),
  bannerURL: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const brand = await brandsRepository.findById(id);
      if (!brand) return errorResponse("Brand not found", 404);
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
      const existing = await brandsRepository.findById(id);
      if (!existing) return errorResponse("Brand not found", 404);
      const updated = await brandsRepository.update(id, body!);
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
      const existing = await brandsRepository.findById(id);
      if (!existing) return errorResponse("Brand not found", 404);
      await brandsRepository.delete(id);
      return successResponse(null, "Brand deleted");
    },
  }),
);
