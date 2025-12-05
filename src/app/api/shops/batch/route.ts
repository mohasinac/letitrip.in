/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/batch/route
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
 * POST /api/shops/batch
 * Fetch multiple shops by IDs/slugs
 * Used by homepage featured sections to display admin-curated shops
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
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Shop IDs array is required" },
        { status: 400 },
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch shops by IDs (using slug as document ID pattern)
    const shops: any[] = [];

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
        const doc = await Collections.shops().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });

      const docs = await Promise.all(docPromises);
/**
 * Performs found ids operation
 *
 * @param {any} (s - The (s
 *
 * @returns {any} The foundids result
 *
 */
      const foundShops = docs.filter(Boolean);
      s/**
 * Performs legacy query operation
 *
 * @returns {any} The legacyquery result
 *
 */
hops.push(...foundShops);

      // For any not found by ID, try legacy query
      const foundIds = foundShops.map((s: any) => s.id);
      const missingIds = chunk.filter((id) => !foundIds.includes(/**
 * Performs ordered shops operation
 *
 * @param {any} (id - The (id
 *
 * @returns {any} The orderedshops result
 *
 */
id));

      if (missingIds.length > 0) {
        const legacyQuery = await Collections.shops()
          .where("slug", "in", missingIds)
          .get();

        legacyQuery.docs.forEach((doc) => {
          shops.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedShops = limitedIds
      .map((id) => shops.find((s) => s.id === id || s.slug === id))
      .filter(Boolean)
      .map((s: any) => ({
        /** Id */
        id: s.id,
        ...s,
        // Add camelCase aliases
        /** Owner Id */
        ownerId: s.owner_id,
        /** Product Count */
        productCount: s.product_count || 0,
        /** Auction Count */
        auctionCount: s.auction_count || 0,
        /** Is Verified */
        isVerified: s.is_verified,
        /** Is Active */
        isActive: s.is_active,
        /** Created At */
        createdAt: s.created_at,
        /** Updated At */
        updatedAt: s.updated_at,
      }));

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: orderedShops,
    });
  } catch (error) {
    logError(error as Error, { component: "API.shops.batch" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch shops" },
      { status: 500 },
    );
  }
}
