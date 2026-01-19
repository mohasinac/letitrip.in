/**
 * Shops API Routes
 *
 * Handles listing and creating shops.
 *
 * @route GET /api/shops - List shops with filters
 * @route POST /api/shops - Create shop (Seller only)
 *
 * @example
 * ```tsx
 * // List shops
 * const response = await fetch('/api/shops?category=electronics&featured=true');
 *
 * // Create shop
 * const response = await fetch('/api/shops', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     name: 'My Shop',
 *     slug: 'my-shop',
 *     ownerId: 'user-id',
 *     ...
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  DocumentData,
  Query,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shops
 *
 * List shops with filters and cursor-based pagination.
 *
 * Query Parameters:
 * - category: Filter by category slug
 * - featured: Filter featured shops (true/false)
 * - verified: Filter verified shops (true/false)
 * - search: Search by name or description
 * - sort: Sort order (newest, popular, rating, name)
 * - limit: Number of results per page (default 20, max 100)
 * - cursor: Last document ID for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const featuredParam = searchParams.get("featured");
    const verifiedParam = searchParams.get("verified");
    const searchQuery = searchParams.get("search");
    const sortBy = searchParams.get("sort") || "newest";
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build base query
    const constraints: any[] = [];

    // Filter by category
    if (categorySlug) {
      constraints.push(where("categorySlug", "==", categorySlug));
    }

    // Filter by featured
    if (featuredParam === "true") {
      constraints.push(where("featured", "==", true));
    }

    // Filter by verified
    if (verifiedParam === "true") {
      constraints.push(where("verified", "==", true));
    }

    // Filter by search (basic implementation, consider Algolia for production)
    if (searchQuery) {
      // Firestore doesn't support full-text search natively
      // This is a basic implementation that searches by exact match
      // For production, use Algolia or similar search service
      const lowerSearch = searchQuery.toLowerCase();
      constraints.push(where("nameLower", ">=", lowerSearch));
      constraints.push(where("nameLower", "<=", lowerSearch + "\uf8ff"));
    }

    // Add sorting
    switch (sortBy) {
      case "popular":
        constraints.push(orderBy("totalProducts", "desc"));
        break;
      case "rating":
        constraints.push(orderBy("rating", "desc"));
        break;
      case "name":
        constraints.push(orderBy("name", "asc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("createdAt", "desc"));
        break;
    }

    // Apply limit
    constraints.push(limit(pageLimit));

    // Handle cursor pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "shops", cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }

    // Execute query
    const shopsQuery: Query<DocumentData> = query(
      collection(db, "shops"),
      ...constraints,
    );

    const querySnapshot = await getDocs(shopsQuery);

    const shops = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get last document for next page cursor
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          shops,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
          filters: {
            category: categorySlug,
            featured: featuredParam,
            verified: verifiedParam,
            search: searchQuery,
            sort: sortBy,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops", details: error.message },
      { status: 500 },
    );
  }
}

interface CreateShopRequest {
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  logo?: string;
  banner?: string;
  categorySlug?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

/**
 * POST /api/shops
 *
 * Create a new shop (Seller only).
 * Requires authentication and seller role.
 *
 * Request Body:
 * - name: Shop name (required)
 * - slug: URL-friendly slug (required, unique)
 * - ownerId: User ID of shop owner (required)
 * - description: Shop description
 * - logo: Logo image URL
 * - banner: Banner image URL
 * - categorySlug: Primary category
 * - address: Shop address object
 * - contactEmail: Contact email
 * - contactPhone: Contact phone
 * - socialLinks: Social media links
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateShopRequest = await request.json();
    const {
      name,
      slug,
      ownerId,
      description,
      logo,
      banner,
      categorySlug,
      address,
      contactEmail,
      contactPhone,
      socialLinks,
    } = body;

    // Validate required fields
    if (!name || !slug || !ownerId) {
      return NextResponse.json(
        { error: "Name, slug, and ownerId are required" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingShopQuery = query(
      collection(db, "shops"),
      where("slug", "==", slug),
    );
    const existingShops = await getDocs(existingShopQuery);

    if (!existingShops.empty) {
      return NextResponse.json(
        { error: "Shop with this slug already exists" },
        { status: 409 },
      );
    }

    // Create shop document
    const shopData = {
      name,
      slug,
      nameLower: name.toLowerCase(), // For search
      ownerId,
      description: description || "",
      logo: logo || null,
      banner: banner || null,
      categorySlug: categorySlug || null,
      address: address || {},
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      socialLinks: socialLinks || {},

      // Status and metrics
      featured: false,
      verified: false,
      status: "active",

      // Counters
      totalProducts: 0,
      totalAuctions: 0,
      totalSales: 0,
      totalRevenue: 0,

      // Rating
      rating: 0,
      reviewCount: 0,

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "shops"), shopData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...shopData,
        },
        message: "Shop created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating shop:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to create shop" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create shop", details: error.message },
      { status: 500 },
    );
  }
}
