import "@/providers.config";
/**
 * Admin Products [id] API Route
 * GET    /api/admin/products/:id — Get a single product
 * PATCH  /api/admin/products/:id — Update a product
 * DELETE /api/admin/products/:id — Delete a product (soft via status)
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const product = await productRepository.findByIdOrSlug(id).catch(() => null);
  if (!product) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.PRODUCT.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: product });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating product", { id });
  const updated = await productRepository.updateProduct(id, parsed.data as any);
  return Response.json(successResponse(updated, SUCCESS_MESSAGES.PRODUCT.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Admin deleting product", { id });
  await productRepository.update(id, { status: "deleted" } as any);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.PRODUCT.DELETED));
}
