import { NextRequest, NextResponse } from "next/server";
import { buildQueryFromFilters } from "@/lib/filter-helpers";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
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
        const user = await getUserFromRequest(req);

        const { searchParams } = new URL(req.url);

        // Extract filters from query params
        const filters: Record<string, any> = {};
        searchParams.forEach((value, key) => {
          if (value) filters[key] = value;
        });

        const role = user?.role ? (user.role as UserRole) : UserRole.USER;
        const userId = user?.uid;

        // Pagination params
        const startAfter = searchParams.get("startAfter");
        const limit = filters.limit ? parseInt(filters.limit) : 20;

        // Sort params
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = (searchParams.get("sortOrder") || "desc") as
          | "asc"
          | "desc";

        // Build role-based query with filters
        let query: FirebaseFirestore.Query;

        if (!user || role === UserRole.USER) {
          // Public users see only verified, non-banned shops
          if (
            filters.featured === "true" ||
            filters.showOnHomepage === "true"
          ) {
            query = Collections.shops()
              .where("is_featured", "==", true)
              .where("is_verified", "==", true);
          } else {
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("is_verified", "==", true);
          }
        } else if (role === UserRole.SELLER) {
          // Sellers see own shops + verified public shops
          if (userId) {
            query = Collections.shops().where("owner_id", "==", userId);
          } else {
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("is_verified", "==", true);
          }
        } else {
          // Admin sees all shops
          query = Collections.shops();
          if (filters.featured === "true") {
            query = query.where("is_featured", "==", true);
          }
        }

        // Add sorting
        const validSortFields = [
          "created_at",
          "name",
          "product_count",
          "rating",
        ];
        const sortField = validSortFields.includes(sortBy)
          ? sortBy
          : "created_at";
        query = query.orderBy(sortField, sortOrder);

        // Apply cursor pagination
        if (startAfter) {
          const startDoc = await Collections.shops().doc(startAfter).get();
          if (startDoc.exists) {
            query = query.startAfter(startDoc);
          }
        }

        // Fetch limit + 1 to check if there's a next page
        query = query.limit(limit + 1);
        const snapshot = await query.get();

        if (snapshot.empty) {
          console.log("[Shops API] No shops found for the given filters");
        }

        // Check if there's a next page
        const docs = snapshot.docs;
        const hasNextPage = docs.length > limit;
        const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

        let shops = resultDocs.map((doc) => {
          const data: any = doc.data();
          return {
            id: doc.id,
            ...data,
            // Add camelCase aliases
            ownerId: data.owner_id,
            isVerified: data.is_verified,
            featured: data.is_featured,
            isBanned: data.is_banned,
            showOnHomepage: data.show_on_homepage,
            totalProducts: data.total_products || data.product_count || 0,
            reviewCount: data.review_count || 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        });

        // Get next cursor
        const nextCursor =
          hasNextPage && resultDocs.length > 0
            ? resultDocs[resultDocs.length - 1].id
            : null;

        // Check if user can create more shops
        let canCreateMore = false;
        if (role === UserRole.ADMIN) {
          canCreateMore = true; // Admins can create unlimited shops
        } else if (role === UserRole.SELLER && userId) {
          // Count user's existing shops
          const userShopsQuery = Collections.shops().where(
            "owner_id",
            "==",
            userId,
          );
          const userShopsSnapshot = await userShopsQuery.get();
          canCreateMore = userShopsSnapshot.size === 0; // Max 1 shop for sellers
        }

        // Return consistent response format
        return NextResponse.json({
          success: true,
          data: shops,
          shops, // Keep for backward compatibility
          count: shops.length,
          canCreateMore,
          pagination: {
            limit,
            hasNextPage,
            nextCursor,
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
          { status: 500 },
        );
      }
    },
    { ttl: 180 },
  );
}

// POST /api/shops - Create shop
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Check role (seller or admin)
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers and admins can create shops",
        },
        { status: 403 },
      );
    }

    const userId = user.uid;
    const userRole = user.role;

    // Check shop creation limit (1 for sellers, unlimited for admins)
    if (userRole === "seller") {
      const userShopsQuery = Collections.shops().where(
        "owner_id",
        "==",
        userId,
      );
      const userShopsSnapshot = await userShopsQuery.get();

      if (userShopsSnapshot.size >= 1) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only create 1 shop. Please contact admin for more.",
          },
          { status: 403 },
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
        { status: 400 },
      );
    }

    // Check if slug is unique
    const existingShopQuery = Collections.shops().where(
      "slug",
      "==",
      data.slug,
    );
    const existingShopSnapshot = await existingShopQuery.get();

    if (!existingShopSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop slug already exists. Please choose a different slug.",
        },
        { status: 400 },
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
      { status: 500 },
    );
  }
}
