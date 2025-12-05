/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/batch/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * POST /api/auctions/batch
 * Fetch multiple auctions by IDs
 * Used by homepage featured sections to display admin-curated auctions
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
        { success: false, error: "Auction IDs array is required" },
        { status: 400 },
      );
    }

    // Limit batch size to prevent abuse
    const limitedIds = ids.slice(0, 50);

    // Fetch auctions by IDs (using slug as document ID pattern)
    const auctions: any[] = [];

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
        const doc = await Collections.auctions().doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      });

      const docs = await Promise.all(docPromises);
      con/**
 * Performs found ids operation
 *
 * @param {any} (a - The (a
 *
 * @returns {any} The foundids result
 *
 */
st foundAuctions = docs.filter(Boolean);
      auctions.p/**
 * Performs legacy query operation
 *
 * @returns {any} The legacyquery result
 *
 */
ush(...foundAuctions);

      // For any not found by ID, try legacy query
      const foundIds = foundAuctions.map((a: any) => a.id);
      const missingIds = chunk.filter((id) => !foundIds.includes(id));/**
 * Performs ordered auctions operation
 *
 * @param {any} (id - The (id
 *
 * @returns {any} The orderedauctions result
 *
 */


      if (missingIds.length > 0) {
        const legacyQuery = await Collections.auctions()
          .where("slug", "in", missingIds)
          .get();

        legacyQuery.docs.forEach((doc) => {
          auctions.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    // Transform and return in order requested
    const orderedAuctions = limitedIds
      .map((id) => auctions.find((a) => a.id === id || a.slug === id))
      .filter(Boolean)
      .map((a: any) => ({
        /** Id */
        id: a.id,
        ...a,
        // Add camelCase aliases
        /** Shop Id */
        shopId: a.shop_id,
        /** Category Id */
        categoryId: a.category_id,
        /** Current Bid */
        currentBid: a.current_bid,
        /** Starting Bid */
        startingBid: a.starting_bid,
        /** Bid Count */
        bidCount: a.bid_count,
        /** Start Time */
        startTime: a.start_time,
        /** End Time */
        endTime: a.end_time,
        /** Featured */
        featured: a.is_featured,
        /** Created At */
        createdAt: a.created_at,
        /** Updated At */
        updatedAt: a.updated_at,
      }));

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: orderedAuctions,
    });
  } catch (error) {
    console.error("Error fetching auctions batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auctions" },
      { status: 500 },
    );
  }
}
