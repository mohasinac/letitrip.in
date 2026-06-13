import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  adminUpdateProduct,
  adminDeleteProduct,
  productRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  status: z.string().optional(),
  availableQuantity: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  isSold: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).passthrough();

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:products:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const product = await productRepository.findByIdOrSlug(id).catch(() => null);
      if (!product) return errorResponse("Product not found", 404);
      return successResponse(product);
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PATCH = withProviders(
  createRouteHandler<(typeof updateProductSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:products:write",
    schema: updateProductSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const updated = await adminUpdateProduct(user!.uid, id, body! as any);
      return successResponse(updated, "Product updated");
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:delete",
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      await adminDeleteProduct(user!.uid, id);
      return successResponse(null, "Product deleted");
    },
  }),
);
