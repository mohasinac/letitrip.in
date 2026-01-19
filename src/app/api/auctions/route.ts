/**
 * List Auctions API Route
 *
 * Fetches auctions with cursor-based pagination and filtering.
 * Supports filtering by category, shop, status, and search query.
 *
 * @route GET /api/auctions
 *
 * @queryparam cursor - Pagination cursor (auction slug)
 * @queryparam limit - Number of items per page (default: 20, max: 100)
 * @queryparam category - Filter by category slug
 * @queryparam shop - Filter by shop slug
 * @queryparam status - Filter by status (upcoming, live, ended)
 * @queryparam search - Search query for auction title/description
 * @queryparam sort - Sort order (ending-soon, newest, popular)
 *
 * @example
 * ```tsx
 * // Get live auctions
 * const response = await fetch('/api/auctions?status=live&sort=ending-soon');
 *
 * // Get next page
 * const response = await fetch('/api/auctions?cursor=auction-slug&limit=20');
 * ```
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  Timestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const cursor = searchParams.get("cursor");
    const limitParam = parseInt(searchParams.get("limit") || "20");
    const categorySlug = searchParams.get("category");
    const shopSlug = searchParams.get("shop");
    const searchQuery = searchParams.get("search");
    const sortBy = searchParams.get("sort") || "ending-soon";
    const status = searchParams.get("status"); // upcoming, live, ended

    // Validate and cap limit
    const pageLimit = Math.min(Math.max(limitParam, 1), 100);

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Filter by category
    if (categorySlug) {
      constraints.push(where("categorySlug", "==", categorySlug));
    }

    // Filter by shop
    if (shopSlug) {
      constraints.push(where("shopSlug", "==", shopSlug));
    }

    // Filter by status
    const now = Timestamp.now();
    if (status === "upcoming") {
      constraints.push(where("startTime", ">", now));
    } else if (status === "live") {
      constraints.push(where("startTime", "<=", now));
      constraints.push(where("endTime", ">", now));
    } else if (status === "ended") {
      constraints.push(where("endTime", "<=", now));
    }

    // Apply sorting
    switch (sortBy) {
      case "ending-soon":
        constraints.push(orderBy("endTime", "asc"));
        break;
      case "popular":
        constraints.push(orderBy("viewCount", "desc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("createdAt", "desc"));
        break;
    }

    // Handle cursor pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "auctions", cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }

    // Add limit
    constraints.push(limit(pageLimit + 1));

    // Execute query
    const auctionsQuery = query(collection(db, "auctions"), ...constraints);
    const querySnapshot = await getDocs(auctionsQuery);

    // Process results
    const auctions = querySnapshot.docs.slice(0, pageLimit).map((doc) => {
      const data = doc.data();
      return {
        slug: doc.id,
        ...data,
        // Calculate auction status
        status: getAuctionStatus(data.startTime, data.endTime),
      };
    });

    // Check if there's a next page
    const hasMore = querySnapshot.docs.length > pageLimit;
    const nextCursor = hasMore ? querySnapshot.docs[pageLimit - 1].id : null;

    // Filter by search query (client-side)
    let filteredAuctions = auctions;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredAuctions = auctions.filter(
        (auction: any) =>
          auction.title?.toLowerCase().includes(lowerQuery) ||
          auction.description?.toLowerCase().includes(lowerQuery),
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          auctions: filteredAuctions,
          pagination: {
            limit: pageLimit,
            hasMore,
            nextCursor,
          },
          filters: {
            category: categorySlug,
            shop: shopSlug,
            search: searchQuery,
            sort: sortBy,
            status,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching auctions:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch auctions",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to determine auction status
 */
function getAuctionStatus(
  startTime: Timestamp,
  endTime: Timestamp,
): "upcoming" | "live" | "ended" {
  const now = Timestamp.now();
  if (startTime.toMillis() > now.toMillis()) {
    return "upcoming";
  } else if (endTime.toMillis() > now.toMillis()) {
    return "live";
  } else {
    return "ended";
  }
}
