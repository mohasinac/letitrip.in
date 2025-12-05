/**
 * @fileoverview TypeScript Module
 * @module src/app/api/products/batch/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/products/batch
 * Fetch multiple products by IDs
 * Used by homepage featured sections to display admin-curated products
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  let idsLength = 0;
  try {
    const body = await request.json();
    const { ids } = body;
    idsLength = ids?.length || 0;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product IDs array is required" },
        { status: 400 },
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch products by IDs (using slug as document ID pattern)
    const products: any[] = [];

    // Firestore 'in' query supports max 30 items, so we chunk
    const chunks: string[][] = [];
    for (let i = 0; i < limitedIds.length; i += 30) {
      chunks.push(limitedIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      // Try direct document access first (slug as ID)
      /**
 * Performs doc promises operation
 *
 * @param {any} async(id - The async(id
 *
 * @returns {Promise<any>} The docpromises result
 *
 */
const docPromises = chunk.map(async (id) => {
        const doc = await Collections.products().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });

      const docs = await Promise.all(docPromises);
      con/**
 * Performs found ids operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The foundids result
 *
 */
st foundProducts = docs.filter(Boolean);
      products.push(...foundProducts);

      // For any not fou/**
 * Performs legacy query operation
 *
 * @returns {any} The legacyquery result
 *
 */
nd by ID, try legacy query
      const foundIds = foundProducts.map((p: any) => p.id);
      const missingIds = chunk.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        // /**
 * Performs ordered products operation
 *
 * @param {any} (id - The (id
 *
 * @returns {any} The orderedproducts result
 *
 */
Try to find by id field or slug field
        const legacyQuery = await Collections.products()
          .where("slug", "in", missingIds)
          .get();

        legacyQuery.docs.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedProducts = limitedIds
      .map((id) => products.find((p) => p.id === id || p.slug === id))
      .filter(Boolean)
      .map((p: any) => ({
        /** Id */
        id: p.id,
        ...p,
        // Add camelCase aliases
        /** Shop Id */
        shopId: p.shop_id,
        /** Category Id */
        categoryId: p.category_id,
        /** Stock Count */
        stockCount: p.stock_count ?? p.stock_quantity ?? 0,
        /** Featured */
        featured: p.is_featured,
        /** Original Price */
        originalPrice: p.compare_at_price,
        /** Created At */
        createdAt: p.created_at,
        /** Updated At */
        updatedAt: p.updated_at,
      }));

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: orderedProducts,
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.batch.POST",
      /** Metadata */
      metadata: { idsCount: idsLength },
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
