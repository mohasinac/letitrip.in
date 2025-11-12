import { NextRequest, NextResponse } from "next/server";
import { buildQueryFromFilters } from "@/lib/filter-helpers";
import { getCurrentUser } from "../lib/session";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getShopsQuery,
  UserRole,
  buildQuery,
} from "@/app/api/lib/firebase/queries";

/**
 * Unified Shops API with Firebase Integration
 * GET: List shops (filtered by role)
 * POST: Create shop (seller/admin only)
 */

// GET /api/shops - List shops
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const { searchParams } = new URL(request.url);

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
    if (!user || role === UserRole.USER) {
      if (filters.showOnHomepage === "true") {
        // Index: is_banned + show_on_homepage + created_at
        query = Collections.shops()
          .where("is_banned", "==", false)
          .where("show_on_homepage", "==", true)
          .orderBy("created_at", "desc")
          .limit(limit);
      } else if (filters.featured === "true") {
        // Index: is_featured + is_verified + created_at
        query = Collections.shops()
          .where("is_featured", "==", true)
          .where("is_verified", "==", true)
          .orderBy("created_at", "desc")
          .limit(limit);
      } else {
        // Index: is_banned + is_verified + created_at
        query = Collections.shops()
          .where("is_banned", "==", false)
          .where("is_verified", "==", true)
          .orderBy("created_at", "desc")
          .limit(limit);
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
      [...shops, ...publicShops].forEach((shop) => shopMap.set(shop.id, shop));
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

    return NextResponse.json({
      success: true,
      shops,
      canCreateMore,
      total: shops.length,
    });
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shops",
      },
      { status: 500 }
    );
  }
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
