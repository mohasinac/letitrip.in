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

    // Pagination params
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

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
            limit,
            hasNextPage: false,
            nextCursor: null,
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
          limit,
          hasNextPage: false,
          nextCursor: null,
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

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await Collections.orders().doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const docs = snapshot.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    const orders = resultDocs.map((d) => ({ id: d.id, ...d.data() }));

    // Get next cursor
    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
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
