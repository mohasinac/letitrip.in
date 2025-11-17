import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

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
    const shopId = searchParams.get("shop_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query: FirebaseFirestore.Query = Collections.orders();
    if (role === "admin") {
      if (shopId) query = query.where("shop_id", "==", shopId);
    } else if (role === "seller") {
      if (!shopId)
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
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
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // Get all orders for pagination
    const allSnap = await query.orderBy("created_at", "desc").get();
    const allOrders = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Calculate pagination
    const total = allOrders.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedOrders = allOrders.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
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
