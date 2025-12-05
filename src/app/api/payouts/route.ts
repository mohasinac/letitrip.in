import { Collections } from "@/app/api/lib/firebase/collections";
import { createPaginationMeta } from "@/app/api/lib/sieve/api";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { payoutsSieveConfig } from "@/app/api/lib/sieve/config";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for payouts
const payoutsConfig = {
  ...payoutsSieveConfig,
  fieldMappings: {
    sellerId: "seller_id",
    shopId: "shop_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    paymentMethod: "payment_method",
    netAmount: "net_amount",
    platformFee: "platform_fee",
    totalSales: "total_sales",
    orderCount: "order_count",
  } as Record<string, string>,
};

/**
 * Transform payout document to API response format
 */
function transformPayout(id: string, data: any) {
  return {
    id,
    ...data,
    sellerId: data.seller_id,
    shopId: data.shop_id,
    paymentMethod: data.payment_method,
    netAmount: data.net_amount,
    platformFee: data.platform_fee,
    totalSales: data.total_sales,
    orderCount: data.order_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/payouts
 * List payouts with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==pending
 *
 * Role-based filtering:
 * - Seller: Own payouts only
 * - Admin: All payouts
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, payoutsConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 },
      );
    }

    let query: FirebaseFirestore.Query = Collections.payouts();

    // Role-based filtering
    if (user.role === "seller") {
      query = query.where("seller_id", "==", user.uid);
    }
    // Admin sees all payouts (no filter)

    // Legacy query params support (for backward compatibility)
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (startDate) {
      query = query.where("created_at", ">=", new Date(startDate));
    }
    if (endDate) {
      query = query.where("created_at", "<=", new Date(endDate));
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = payoutsConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value,
        );
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = payoutsConfig.fieldMappings[sort.field] || sort.field;
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
      const lastDoc = skipSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) =>
      transformPayout(doc.id, doc.data()),
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
  } catch (error: any) {
    logError(error as Error, { component: "API.payouts.GET" });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch payouts",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Only sellers can create payout requests
    if (user.role !== "seller") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers can create payout requests",
        },
        { status: 403 },
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.amount || !data.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, paymentMethod",
        },
        { status: 400 },
      );
    }

    // Create payout request
    const payoutData = {
      seller_id: user.uid,
      shop_id: data.shopId || user.shopId,
      amount: data.amount,
      currency: data.currency || "INR",
      status: "pending",
      payment_method: data.paymentMethod,
      bank_details: data.bankDetails || null,
      upi_id: data.upiId || null,
      period: data.period || null,
      order_count: data.orderCount || 0,
      total_sales: data.totalSales || 0,
      platform_fee: data.platformFee || 0,
      net_amount: data.netAmount || data.amount,
      notes: data.notes || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const docRef = await Collections.payouts().add(payoutData);

    return NextResponse.json({
      success: true,
      payout: {
        id: docRef.id,
        ...payoutData,
      },
      message: "Payout request created successfully",
    });
  } catch (error: any) {
    logError(error as Error, { component: "API.payouts.POST" });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create payout",
      },
      { status: 500 },
    );
  }
}
