import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    const role = user.role;
    if (!(role === "seller" || role === "admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const ref = Collections.returns().doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    const ret = snap.data() as any;

    if (role === "seller") {
      const owns = await userOwnsShop(ret.shop_id, user.id);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
    }

    const { approved, notes } = await req.json();
    const status = approved ? "approved" : "rejected";

    await ref.update({
      status,
      admin_notes: notes || "",
      updated_at: new Date().toISOString(),
    });
    const updated = await ref.get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.returns.approve",
      metadata: { returnId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to approve return" },
      { status: 500 }
    );
  }
}
