import { NextRequest, NextResponse } from "next/server";
import { buildQueryFromFilters } from "@/lib/filter-helpers";
import { getCurrentUser } from "../lib/session";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getShopsQuery,
  UserRole,
  buildQuery,
} from "@/app/api/lib/firebase/queries";
import { withCache } from "@/app/api/middleware/cache";

/**
 * Unified Shops API with Firebase Integration
 * GET: List shops (filtered by role)
 * POST: Create shop (seller/admin only)
 */

// Cache shops for 3 minutes
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async (req: NextRequest) => {
      try {
        const user = await getCurrentUser(req);

        const { searchParams } = new URL(req.url);

        // Extract filters from query params
        const filters: Record<string, any> = {};
        searchParams.forEach((value, key) => {
          if (value) filters[key] = value;
        });

        const role = user?.role ? (user.role as UserRole) : UserRole.USER;
        const userId = user?.id;

        // Build role-based query
        let query = getShopsQuery(role, userId);

        const limit = filters.limit ? parseInt(filters.limit) : 20;

        // Use composite indexes for optimal performance
        // Public users see only verified, non-banned shops
        // TEMPORARY: Remove orderBy to work without composite indexes while they build
        const useCompositeIndexes =
          process.env.USE_COMPOSITE_INDEXES === "true";

        if (!user || role === UserRole.USER) {
          if (filters.showOnHomepage === "true") {
            // Index: is_banned + show_on_homepage + created_at
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("show_on_homepage", "==", true);

            if (useCompositeIndexes) {
              query = query.orderBy("created_at", "desc");
            }

            query = query.limit(limit);
          } else if (filters.featured === "true") {
            // Index: is_featured + is_verified + created_at
            query = Collections.shops()
              .where("is_featured", "==", true)
              .where("is_verified", "==", true);

            if (useCompositeIndexes) {
              query = query.orderBy("created_at", "desc");
            }

            query = query.limit(limit);
          } else {
            // Index: is_banned + is_verified + created_at
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("is_verified", "==", true);

            if (useCompositeIndexes) {
              query = query.orderBy("created_at", "desc");
            }

            query = query.limit(limit);
          }
        } else {
          // Authenticated users (sellers/admin) see more
          if (filters.showOnHomepage === "true") {
            query = query.where("show_on_homepage", "==", true).limit(limit);
          } else if (filters.featured === "true") {
            query = query.where("is_featured", "==", true).limit(limit);
          } else {
            query = query.limit(limit);
          }
        }

        // Execute query
        const snapshot = await query.get();

        if (snapshot.empty) {
          console.log("[Shops API] No shops found for the given filters");
        }

        let shops = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // For sellers, also fetch public verified shops if needed
        if (role === UserRole.SELLER && filters.includePublic === "true") {
          const publicQuery = Collections.shops()
            .where("is_verified", "==", true)
            .where("is_banned", "==", false)
            .limit(20);

          const publicSnapshot = await publicQuery.get();
          const publicShops = publicSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Merge and deduplicate
          const shopMap = new Map();
          [...shops, ...publicShops].forEach((shop) =>
            shopMap.set(shop.id, shop)
          );
          shops = Array.from(shopMap.values());
        }

        // Check if user can create more shops
        let canCreateMore = false;
        if (role === UserRole.ADMIN) {
          canCreateMore = true; // Admins can create unlimited shops
        } else if (role === UserRole.SELLER && userId) {
          // Count user's existing shops
          const userShopsQuery = Collections.shops().where(
            "owner_id",
            "==",
            userId
          );
          const userShopsSnapshot = await userShopsQuery.get();
          canCreateMore = userShopsSnapshot.size === 0; // Max 1 shop for sellers
        }

        // Return consistent response format
        return NextResponse.json({
          success: true,
          data: shops, // Use 'data' for consistency with other APIs
          shops, // Keep for backward compatibility
          canCreateMore,
          total: shops.length,
          pagination: {
            page: 1,
            limit,
            total: shops.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        });
      } catch (error: any) {
        console.error("Error fetching shops:", error);

        // Better error handling with details
        const errorMessage = error?.message || "Failed to fetch shops";
        const errorDetails = error?.details || error?.stack || "";

        console.error("Error details:", {
          message: errorMessage,
          details: errorDetails,
          code: error?.code,
        });

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            details:
              process.env.NODE_ENV === "development" ? errorDetails : undefined,
          },
          { status: 500 }
        );
      }
    },
    { ttl: 180 }
  );
}

// POST /api/shops - Create shop
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Check authentication
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Check role (seller or admin)
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers and admins can create shops",
        },
        { status: 403 }
      );
    }

    const userId = user.id;
    const userRole = user.role;

    // Check shop creation limit (1 for sellers, unlimited for admins)
    if (userRole === "seller") {
      const userShopsQuery = Collections.shops().where(
        "owner_id",
        "==",
        userId
      );
      const userShopsSnapshot = await userShopsQuery.get();

      if (userShopsSnapshot.size >= 1) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only create 1 shop. Please contact admin for more.",
          },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.slug || !data.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, slug, description",
        },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingShopQuery = Collections.shops().where(
      "slug",
      "==",
      data.slug
    );
    const existingShopSnapshot = await existingShopQuery.get();

    if (!existingShopSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop slug already exists. Please choose a different slug.",
        },
        { status: 400 }
      );
    }

    // Create shop object
    const shopData = {
      owner_id: userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      location: data.location || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      logo: null, // Will be uploaded in edit page
      banner: null, // Will be uploaded in edit page
      rating: 0,
      review_count: 0,
      product_count: 0,
      is_verified: false,
      is_featured: false,
      show_on_homepage: false,
      is_banned: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Save to Firestore
    const shopsRef = Collections.shops();
    const docRef = await shopsRef.add(shopData);

    const shop = {
      id: docRef.id,
      ...shopData,
    };

    return NextResponse.json({
      success: true,
      shop,
      message: "Shop created successfully. You can now upload logo and banner.",
    });
  } catch (error) {
    console.error("Error creating shop:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create shop",
      },
      { status: 500 }
    );
  }
}
