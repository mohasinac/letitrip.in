import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";
import {
  parseSieveQuery,
  ordersSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

// Extended Sieve config with field mappings for orders
const ordersConfig = {
  ...ordersSieveConfig,
  fieldMappings: {
    userId: "user_id",
    shopId: "shop_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    paymentStatus: "payment_status",
    total: "total_amount",
  } as Record<string, string>,
};

/**
 * Transform order document to API response format
 */
function transformOrder(id: string, data: any) {
  return {
    id,
    ...data,
    userId: data.user_id,
    shopId: data.shop_id,
    paymentStatus: data.payment_status,
    totalAmount: data.total_amount,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/orders
 * List orders with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==pending
 *
 * Role-based filtering:
 * - User: Own orders only
 * - Seller: Orders for their shop(s)
 * - Admin: All orders
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
    } = parseSieveQuery(searchParams, ordersConfig);

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

    let query: FirebaseFirestore.Query = Collections.orders();

    // Legacy query params support (for backward compatibility)
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");
    const status = searchParams.get("status");
    const paymentStatus =
      searchParams.get("paymentStatus") || searchParams.get("payment_status");

    // Role-based filtering
    if (role === "admin") {
      if (shopId) query = query.where("shop_id", "==", shopId);
    } else if (role === "seller") {
      if (!shopId) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            pageSize: sieveQuery.pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }
      const owns = await userOwnsShop(shopId, user!.uid);
      if (!owns) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
      query = query.where("shop_id", "==", shopId);
    } else if (role === "user") {
      query = query.where("user_id", "==", user!.uid);
    } else {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: sieveQuery.pageSize,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Apply legacy filters (backward compatibility)
    if (status) {
      query = query.where("status", "==", status);
    }
    if (paymentStatus) {
      query = query.where("payment_status", "==", paymentStatus);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = ordersConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = ordersConfig.fieldMappings[sort.field] || sort.field;
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
    const data = snapshot.docs.map((doc) => transformOrder(doc.id, doc.data()));

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
    console.error("Orders list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list orders" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/orders
 * Create order (authenticated users only)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { shop_id, items, amount } = body;
    if (!shop_id || !Array.isArray(items) || !Number.isFinite(Number(amount))) {
      throw new ValidationError(
        "Invalid payload: shop_id, items array, and amount are required",
      );
    }
    const now = new Date().toISOString();
    const docRef = await Collections.orders().add({
      user_id: user.uid,
      shop_id,
      items,
      amount: Number(amount),
      status: "pending",
      created_at: now,
      updated_at: now,
    });
    const created = await docRef.get();
    return NextResponse.json(
      { success: true, data: { id: created.id, ...created.data() } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 },
    );
  }
}
