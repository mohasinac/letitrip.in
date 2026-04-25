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

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  status: z.string().optional(),
  availableQuantity: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).passthrough();

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const product = await productRepository.findByIdOrSlug(id).catch(() => null);
      if (!product) return errorResponse("Product not found", 404);
      return successResponse(product);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateProductSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateProductSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const updated = await adminUpdateProduct(id, body! as any);
      return successResponse(updated, "Product updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await adminDeleteProduct(id);
      return successResponse(null, "Product deleted");
    },
  }),
);
