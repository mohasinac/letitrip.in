import { Collections } from "@/app/api/lib/firebase/collections";
import { executeOffsetPaginatedQuery } from "@/app/api/lib/utils/pagination";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { safeToISOString } from "@/lib/date-utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payments
 * List payments
 * - Admin: Can view all payments
 * - Seller: Can view shop payments
 * - User: Can view own payments
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const gateway = searchParams.get("gateway");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const orderId = searchParams.get("orderId");
    const shopId = searchParams.get("shopId");

    let query = Collections.payments().orderBy("created_at", "desc");

    // Role-based filtering
    if (user.role === "seller") {
      // Seller can only see their shop's payments
      if (!user.shopId) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          pagination: {
            page: 1,
            limit: 20,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }
      query = query.where("shop_id", "==", user.shopId) as any;
    } else if (user.role === "user") {
      // User can only see their own payments
      query = query.where("user_id", "==", user.uid) as any;
    }
    // Admin sees all payments (no additional filter)

    // Apply filters
    if (status) {
      query = query.where("status", "==", status) as any;
    }
    if (gateway) {
      query = query.where("gateway", "==", gateway) as any;
    }
    if (orderId) {
      query = query.where("order_id", "==", orderId) as any;
    }
    if (shopId && user.role === "admin") {
      query = query.where("shop_id", "==", shopId) as any;
    }

    // Date filters
    if (startDate) {
      const startIso = safeToISOString(new Date(startDate));
      if (startIso) {
        query = query.where("created_at", ">=", startIso) as any;
      }
    }
    if (endDate) {
      const endIso = safeToISOString(new Date(endDate));
      if (endIso) {
        query = query.where("created_at", "<=", endIso) as any;
      }
    }

    // Execute paginated query
    const response = await executeOffsetPaginatedQuery(
      query,
      searchParams,
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      }),
      20, // defaultLimit
      100 // maxLimit
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Create a payment record (system/admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const {
      order_id,
      user_id,
      shop_id,
      amount,
      currency = "INR",
      gateway,
      gateway_payment_id,
      status = "pending",
    } = body;

    // Validation
    if (!order_id || !user_id || !amount || !gateway) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: order_id, user_id, amount, gateway",
        },
        { status: 400 }
      );
    }

    const payment = {
      order_id,
      user_id,
      shop_id: shop_id || null,
      amount,
      currency,
      gateway,
      gateway_payment_id: gateway_payment_id || null,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await Collections.payments().add(payment);

    return NextResponse.json(
      {
        success: true,
        message: "Payment created successfully",
        data: { id: docRef.id, ...payment },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
