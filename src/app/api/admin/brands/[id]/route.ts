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
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

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

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:brands:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const brand = await categoriesRepository.findById(id);
      if (!brand || brand.categoryType !== "brand") return errorResponse("Brand not found", 404);
      return successResponse(brand);
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PUT = withProviders(
  createRouteHandler<(typeof updateBrandSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:brands:write",
    schema: updateBrandSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const updated = await updateBrandAction(id, body!);
      return successResponse(updated, "Brand updated");
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:brands:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await deleteBrandAction(id);
      return successResponse(null, "Brand deleted");
    },
  }),
);
