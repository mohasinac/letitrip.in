import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

/**
 * GET /api/orders
 * List orders with role-based filtering
 * - User: Own orders only
 * - Seller: Orders for their shop(s)
 * - Admin: All orders
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const role = user?.role || "guest";
    const { searchParams } = new URL(request.url);

    // Filter params
    const shopId = searchParams.get("shop_id");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    // Sort params
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    let query: FirebaseFirestore.Query = Collections.orders();

    // Role-based filtering
    if (role === "admin") {
      if (shopId) query = query.where("shop_id", "==", shopId);
    } else if (role === "seller") {
      if (!shopId)
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          pagination: {
            limit: 50,
            hasNextPage: false,
            nextCursor: null,
            count: 0,
          },
        });
      const owns = await userOwnsShop(shopId, user!.uid);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      query = query.where("shop_id", "==", shopId);
    } else if (role === "user") {
      query = query.where("user_id", "==", user!.uid);
    } else {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        },
      });
    }

    // Apply additional filters
    if (status) {
      query = query.where("status", "==", status);
    }
    if (paymentStatus) {
      query = query.where("payment_status", "==", paymentStatus);
    }

    // Add sorting
    const validSortFields = ["created_at", "updated_at", "total_amount"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    query = query.orderBy(sortField, sortOrder);

    // Execute paginated query
    const response = await executeCursorPaginatedQuery(
      query,
      searchParams,
      (id) => Collections.orders().doc(id).get(),
      (doc) => ({ id: doc.id, ...doc.data() }),
      50, // defaultLimit
      200 // maxLimit
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Orders list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list orders" },
      { status: 500 }
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
        "Invalid payload: shop_id, items array, and amount are required"
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
