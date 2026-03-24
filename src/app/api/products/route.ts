/**
 * Products API Routes
 *
 * GET  /api/products  — delegated to @mohasinac/feat-products (public, Sieve-filtered list)
 * POST /api/products  — local (auth required; letitrip-specific validation + email)
 *
 * Handles product listing and creation.
 * Listing uses Firestore-native Sieve queries (offset + limit) via
 * productRepository.list() — no full collection scan.
 *
 * TODO (Future):
 * - Full-text search via Algolia/Typesense
 * - Response-level metrics tracking (response time, error rate)
 */

// ── GET /api/products ─── delegated to package ──────────────────────────────
export { GET } from "@mohasinac/feat-products";

// ── POST /api/products ── local (auth + letitrip-specific logic) ─────────────
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { slugify } from "@/utils";
import { successResponse } from "@/lib/api-response";
import { requireEmailVerified } from "@/lib/security/authorization";
import { productCreateSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { sendNewProductSubmittedEmail } from "@/lib/email";
import { SCHEMA_DEFAULTS } from "@/db/schema";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * POST /api/products
 *
 * Create a new product
 *
 * ✅ Requires seller/moderator/admin authentication
 * ✅ Requires verified email for sellers
 * ✅ Validates body with productCreateSchema
 * ✅ Creates product with status='draft'; sends admin notification email
 */
export const POST = createApiHandler<(typeof productCreateSchema)["_output"]>({
  auth: true,
  roles: ["seller", "moderator", "admin"],
  schema: productCreateSchema,
  handler: async ({ user, body }) => {
    requireEmailVerified(user as unknown as Record<string, unknown>);
    const slug = `${slugify(body!.title).slice(0, 50)}-${Date.now()}`;
    const product = await productRepository.create({
      ...body!,
      slug,
      sellerId: user!.uid,
      sellerName: user!.displayName || user!.email || "Unknown Seller",
      sellerEmail: user!.email || "",
      status: "draft" as any,
      featured: false,
      isPromoted: false,
    } as any);
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || SCHEMA_DEFAULTS.ADMIN_EMAIL;
    sendNewProductSubmittedEmail(adminEmail, {
      id: product.id ?? (product as any).id,
      title: (product as any).title ?? body!.title,
      sellerName: user!.displayName || user!.email || "Unknown Seller",
      sellerEmail: user!.email || "",
      category: body!.category,
    }).catch((err) =>
      serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_POST_ERROR, { err }),
    );
    // NOTE: Category metrics and store stats are maintained by the
    // onProductWrite Cloud Function trigger, which fires when the product
    // status transitions to "published". Draft products are not counted.
    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  },
});
