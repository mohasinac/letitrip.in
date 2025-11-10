import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const role = user.role;
    if (!(role === "seller" || role === "admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const ref = Collections.returns().doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    const ret = snap.data() as any;

    if (role === "seller") {
      const owns = await userOwnsShop(ret.shop_id, user.id);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
    }

    const { refundAmount, refundMethod, refundTransactionId } =
      await req.json();
    if (typeof refundAmount !== "number" || refundAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid refund amount" },
        { status: 400 },
      );
    }

    const refund = {
      refund_amount: refundAmount,
      refund_method: refundMethod || "manual",
      refund_transaction_id: refundTransactionId || null,
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    };

    await ref.update({
      status: "refunded",
      refund,
      updated_at: new Date().toISOString(),
    });
    const updated = await ref.get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    console.error("Return refund error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process refund" },
      { status: 500 },
    );
  }
}
