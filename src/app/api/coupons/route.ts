import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { couponsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { NextRequest, NextResponse } from "next/server";
import { getUserShops } from "../lib/auth-helpers";

// Extended Sieve config with field mappings for coupons
const couponsConfig = {
  ...couponsSieveConfig,
  fieldMappings: {
    shopId: "shop_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    expiresAt: "end_date",
    discountValue: "discount_value",
    usageCount: "usage_count",
    usageLimit: "usage_limit",
    isActive: "is_active",
    startDate: "start_date",
    endDate: "end_date",
  } as Record<string, string>,
};

/**
 * Transform coupon document to API response format
 */
function transformCoupon(id: string, data: any) {
  return {
    id,
    ...data,
    shopId: data.shop_id,
    discountValue: data.discount_value,
    isActive: data.is_active,
    usageLimit: data.usage_limit,
    usageCount: data.usage_count,
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/coupons
 * List coupons with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==active
 *
 * Role-based filtering:
 * - Public: Active coupons only
 * - Seller: Own shop coupons (all statuses)
 * - Admin: All coupons
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const role = user?.role || "guest";
    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, couponsConfig);

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

    let query: FirebaseFirestore.Query = Collections.coupons();
    let shopId = searchParams.get("shop_id") || searchParams.get("shopId");

    if (role === "guest" || role === "user") {
      query = query.where("is_active", "==", true);
    } else if (role === "seller") {
      // If no shopId provided, get user's shops
      if (!shopId && user?.uid) {
        const userShops = await getUserShops(user.uid);
        if (userShops.length > 0) {
          shopId = userShops[0]; // Use primary shop
        }
      }

      if (shopId) {
        query = query.where("shop_id", "==", shopId);
      }
    } else if (role === "admin" && shopId) {
      query = query.where("shop_id", "==", shopId);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = couponsConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value
        );
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = couponsConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("created_at", "desc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      if (skipSnapshot.docs.length > 0) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) =>
      transformCoupon(doc.id, doc.data())
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      success: true,
      data,
      pagination,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error("Error listing coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list coupons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coupons
 * Create coupon (seller/admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only sellers and admins can create coupons" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const shopIdCamel = body.shopId; // support camelCase from frontend service
    const { shop_id: shopIdSnake, code } = body;
    const shop_id = shopIdSnake || shopIdCamel; // unify
    if (!shop_id || !code) {
      return NextResponse.json(
        { success: false, error: "shop_id/shopId and code required" },
        { status: 400 }
      );
    }

    if (role === "seller") {
      const ownsShop = await userOwnsShop(shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Cannot create coupon for this shop" },
          { status: 403 }
        );
      }
    }

    // Enforce unique code per shop
    const existing = await Collections.coupons()
      .where("shop_id", "==", shop_id)
      .where("code", "==", code)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists for this shop" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const docRef = await Collections.coupons().add({
      shop_id,
      code,
      name: body.name || code,
      description: body.description || "",
      type: body.type || "percentage",
      discount_value: body.discount_value || body.discountValue || 0,
      is_active: body.is_active !== false && body.isActive !== false,
      usage_limit: body.usage_limit || body.usageLimit || null,
      start_date: body.start_date || body.startDate || now,
      end_date: body.end_date || body.endDate || null,
      created_at: now,
      updated_at: now,
    });
    const created = await docRef.get();
    return NextResponse.json(
      { success: true, data: { id: created.id, ...created.data() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
