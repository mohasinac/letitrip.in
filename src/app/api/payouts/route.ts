import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
  requireAdmin,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * Unified Payouts API with RBAC
 * GET: List payouts (seller: own, admin: all)
 * POST: Create payout request (seller only)
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
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query: any = Collections.payouts();

    // Role-based filtering
    if (user.role === "seller") {
      // Sellers only see their own payouts
      query = query.where("seller_id", "==", user.uid);
    }
    // Admin sees all payouts (no filter)

    // Apply additional filters
    if (status) {
      query = query.where("status", "==", status);
    }
    if (startDate) {
      query = query.where("created_at", ">=", new Date(startDate));
    }
    if (endDate) {
      query = query.where("created_at", "<=", new Date(endDate));
    }

    // Add ordering
    query = query.orderBy("created_at", "desc");

    // Get total count
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const snapshot = await query.limit(limit).offset(offset).get();

    const payouts = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching payouts:", error);
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
    console.error("Error creating payout:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create payout",
      },
      { status: 500 },
    );
  }
}
