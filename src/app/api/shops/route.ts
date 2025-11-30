import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { UserRole } from "@/app/api/lib/firebase/queries";
import { withCache } from "@/app/api/middleware/cache";
import {
  parseSieveQuery,
  shopsSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

// Extended Sieve config with field mappings for shops
const shopsConfig = {
  ...shopsSieveConfig,
  fieldMappings: {
    ownerId: "owner_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    productCount: "product_count",
    reviewCount: "review_count",
    isVerified: "is_verified",
    isBanned: "is_banned",
    featured: "is_featured",
    showOnHomepage: "show_on_homepage",
  },
};

/**
 * Transform shop document to API response format
 */
function transformShop(id: string, data: any) {
  return {
    id,
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
}

/**
 * GET /api/shops
 * List shops with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=verified==true
 *
 * Role-based filtering:
 * - Public: Verified, non-banned shops only
 * - Seller: Own shops
 * - Admin: All shops
 */
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async (req: NextRequest) => {
      try {
        const user = await getUserFromRequest(req);
        const { searchParams } = new URL(req.url);

        // Parse Sieve query
        const { query: sieveQuery, errors, warnings } = parseSieveQuery(
          searchParams,
          shopsConfig
        );

        if (errors.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid query parameters",
              details: errors,
            },
            { status: 400 }
          );
        }

        const role = user?.role ? (user.role as UserRole) : UserRole.USER;
        const userId = user?.uid;

        // Legacy params for backward compatibility
        const featured = searchParams.get("featured");
        const showOnHomepage = searchParams.get("showOnHomepage");

        // Build role-based query
        let query: FirebaseFirestore.Query;

        if (!user || role === UserRole.USER) {
          // Public users see only verified, non-banned shops
          if (featured === "true" || showOnHomepage === "true") {
            query = Collections.shops()
              .where("is_featured", "==", true)
              .where("is_verified", "==", true);
          } else {
            query = Collections.shops()
              .where("is_banned", "==", false)
              .where("is_verified", "==", true);
          }
        } else if (role === UserRole.SELLER) {
          // Sellers see own shops
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
          if (featured === "true") {
            query = query.where("is_featured", "==", true);
          }
        }

        // Apply Sieve filters
        for (const filter of sieveQuery.filters) {
          const dbField = shopsConfig.fieldMappings[filter.field] || filter.field;
          if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
            query = query.where(dbField, filter.operator as FirebaseFirestore.WhereFilterOp, filter.value);
          }
        }

        // Apply sorting
        if (sieveQuery.sorts.length > 0) {
          for (const sort of sieveQuery.sorts) {
            const dbField = shopsConfig.fieldMappings[sort.field] || sort.field;
            query = query.orderBy(dbField, sort.direction);
          }
        } else {
          // Default sort
          query = query.orderBy("created_at", "desc");
        }

        // Get total count
        const countSnapshot = await query.count().get();
        const totalCount = countSnapshot.data().count;

        // Apply pagination
        const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
        if (offset > 0) {
          const skipSnapshot = await query.limit(offset).get();
          const lastDoc = skipSnapshot.docs.at(-1);
          if (lastDoc) {
            query = query.startAfter(lastDoc);
          }
        }
        query = query.limit(sieveQuery.pageSize);

        // Execute query
        const snapshot = await query.get();
        const shops = snapshot.docs.map((doc) => transformShop(doc.id, doc.data()));

        // Check if user can create more shops
        let canCreateMore = false;
        if (role === UserRole.ADMIN) {
          canCreateMore = true;
        } else if (role === UserRole.SELLER && userId) {
          const userShopsQuery = Collections.shops().where("owner_id", "==", userId);
          const userShopsSnapshot = await userShopsQuery.get();
          canCreateMore = userShopsSnapshot.size === 0;
        }

        // Build Sieve pagination meta
        const pagination = createPaginationMeta(totalCount, sieveQuery);

        return NextResponse.json({
          success: true,
          data: shops,
          shops, // Backward compatibility
          count: shops.length,
          canCreateMore,
          pagination,
          meta: {
            appliedFilters: sieveQuery.filters,
            appliedSorts: sieveQuery.sorts,
            warnings: warnings.length > 0 ? warnings : undefined,
          },
        });
      } catch (error: any) {
        console.error("Error fetching shops:", error);

        const errorMessage = error?.message || "Failed to fetch shops";
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
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
