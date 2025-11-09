import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { getReturnsQuery, UserRole } from "@/app/api/lib/firebase/queries";
import { Query } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const role = (user?.role as UserRole) || UserRole.USER;

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shop_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const reason = searchParams.get("reason") || undefined;
    const requiresAdminIntervention = searchParams.get(
      "requires_admin_intervention",
    );
    const startDate = searchParams.get("start_date") || undefined;
    const endDate = searchParams.get("end_date") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let query: Query = getReturnsQuery(role, user?.id, shopId);

    if (status) query = query.where("status", "==", status);
    if (reason) query = query.where("reason", "==", reason);
    if (
      requiresAdminIntervention !== null &&
      requiresAdminIntervention !== undefined
    ) {
      const val = requiresAdminIntervention === "true";
      query = query.where("requires_admin_intervention", "==", val);
    }
    if (startDate) query = query.where("created_at", ">=", startDate);
    if (endDate) query = query.where("created_at", "<=", endDate);

    query = query.orderBy("created_at", "desc").limit(limit);

    const snap = await query.get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Returns list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load returns" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body = await req.json();
    const { orderId, orderItemId, reason, description, media, shopId } = body;

    if (!orderId || !orderItemId || !reason || !shopId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const payload = {
      order_id: orderId,
      order_item_id: orderItemId,
      user_id: user.id,
      shop_id: shopId,
      reason,
      description: description || "",
      media: Array.isArray(media) ? media : [],
      status: "pending",
      requires_admin_intervention: false,
      created_at: now,
      updated_at: now,
    };

    const ref = await Collections.returns().add(payload as any);
    const doc = await ref.get();
    return NextResponse.json(
      { success: true, data: { id: doc.id, ...doc.data() } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Return create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate return" },
      { status: 500 },
    );
  }
}
