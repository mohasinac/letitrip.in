/**
 * Z1 — Digital-code pool ingestion (SB-UNI-N).
 *
 * POST /api/store/products/[id]/codes
 * Body: { codes: string[] }
 *
 * Batch-writes up to 200 codes per request into the
 * `products/{id}/codes/` subcollection. Updates digitalCode.codePoolSize
 * and digitalCode.codesAvailable atomically in the same write batch.
 * Seller must own the product; product must be listingType:"digital-code".
 */

import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  ApiErrors,
  successResponse,
  productRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { getAdminDb } from "@mohasinac/appkit/server";
import {
  PRODUCT_CODES_SUBCOLLECTION,
  PRODUCT_COLLECTION,
} from "@mohasinac/appkit";
import type { ProductCodeDocument } from "@mohasinac/appkit";
import { z } from "zod";

const IngestCodesSchema = z.object({
  codes: z.array(z.string().min(1).max(256)).min(1).max(200),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ request, user, params }) => {
      const productId = (params as Record<string, string>).id;

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return ApiErrors.badRequest("Invalid JSON body");
      }

      const parsed = IngestCodesSchema.safeParse(body);
      if (!parsed.success) {
        return ApiErrors.badRequest(
          parsed.error.issues[0]?.message ?? "Invalid request",
        );
      }

      const { codes } = parsed.data;

      const product = await productRepository.findById(productId);
      if (!product) return ApiErrors.notFound("Product not found");
      if (product.listingType !== "digital-code") {
        return ApiErrors.badRequest("Product is not a digital-code listing");
      }

      // Seller auth: verify the store belongs to this user (unless admin)
      if (user!.role !== "admin") {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || store.id !== product.storeId) {
          return ApiErrors.forbidden("Not your product");
        }
      }

      const db = getAdminDb();
      const productRef = db.collection(PRODUCT_COLLECTION).doc(productId);
      const codesCollRef = productRef.collection(PRODUCT_CODES_SUBCOLLECTION);

      const now = new Date();
      const batch = db.batch();

      for (const code of codes) {
        const codeRef = codesCollRef.doc();
        const codeDoc: Omit<ProductCodeDocument, "id"> = {
          productId,
          code,
          status: "available",
          createdAt: now,
          updatedAt: now,
        };
        batch.set(codeRef, codeDoc);
      }

      const prevAvailable = product.digitalCode?.codesAvailable ?? 0;
      const prevPoolSize = product.digitalCode?.codePoolSize ?? 0;
      batch.update(productRef, {
        "digitalCode.codePoolSize": prevPoolSize + codes.length,
        "digitalCode.codesAvailable": prevAvailable + codes.length,
        updatedAt: now,
      });

      await batch.commit();

      return successResponse({
        inserted: codes.length,
        codesAvailable: prevAvailable + codes.length,
      });
    },
  }),
);
