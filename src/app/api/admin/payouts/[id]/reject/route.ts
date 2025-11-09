import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthError } from "../../../../lib/auth-helpers";
import { getFirestoreAdmin } from "../../../../lib/firebase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ["admin"]);

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const payoutRef = db.collection("payouts").doc(id);
    const payoutDoc = await payoutRef.get();

    if (!payoutDoc.exists) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    const payout = payoutDoc.data();

    if (payout?.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending payouts can be rejected" },
        { status: 400 }
      );
    }

    // Update payout status
    await payoutRef.update({
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: user.id,
      rejectionReason: reason,
      updatedAt: new Date(),
    });

    const updatedPayout = {
      id: payoutDoc.id,
      ...payout,
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: user.id,
      rejectionReason: reason,
      updatedAt: new Date(),
    };

    return NextResponse.json(updatedPayout);
  } catch (error: any) {
    return handleAuthError(error);
  }
}
