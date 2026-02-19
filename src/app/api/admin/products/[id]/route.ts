/**
 * Admin Product Detail API Route
 * GET    /api/admin/products/[id] — Get single product
 * PATCH  /api/admin/products/[id] — Update any field (admin)
 * DELETE /api/admin/products/[id] — Hard delete product (admin)
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/lib/security/authorization";
import { productRepository, userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getAdminUser(roles: string[]) {
  const authUser = await getAuthenticatedUser();
  if (!authUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  const firestoreUser = await userRepository.findById(authUser.uid);
  if (!firestoreUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  requireRole(
    { ...authUser, role: firestoreUser.role || "user" },
    roles as any,
  );
  return { ...authUser, role: firestoreUser.role || "user" };
}

/**
 * GET /api/admin/products/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getAdminUser(["admin", "moderator"]);

    const { id } = await context.params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/products/[id]
 *
 * Admin can update any field (status, featured, isPromoted, sellerId, etc.)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getAdminUser(["admin", "moderator"]);

    const { id } = await context.params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    const body = await request.json();
    const updated = await productRepository.update(id, {
      ...body,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND_AFTER_UPDATE);
    }

    serverLogger.info("Admin updated product", { productId: id });
    return successResponse(updated, SUCCESS_MESSAGES.PRODUCT.UPDATED);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/products/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await getAdminUser(["admin"]);

    const { id } = await context.params;
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    await productRepository.delete(id);

    serverLogger.info("Admin deleted product", { productId: id });
    return successResponse(null, SUCCESS_MESSAGES.PRODUCT.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
