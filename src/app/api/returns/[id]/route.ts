import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const awaitedParams = await params;
    id = awaitedParams.id;
    const doc = await Collections.returns().doc(id).get();
    if (!doc.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.returns.get",
      metadata: { returnId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load return" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await req.json();
    const allowed = ["status", "admin_notes"];
    const payload: any = { updated_at: new Date().toISOString() };
    for (const k of allowed) if (k in body) payload[k] = body[k];

    await ref.update(payload);
    const updated = await ref.get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    logError(error as Error, {
      component: "API.returns.update",
      metadata: { returnId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to update return" },
      { status: 500 }
    );
  }
}
