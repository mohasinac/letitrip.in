import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

// GET /api/auctions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await Collections.auctions().doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    }
    const data = { id: doc.id, ...doc.data() } as any;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auction" },
      { status: 500 },
    );
  }
}

// PATCH /api/auctions/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const role = user.role;
    const { id } = await params;
    const docRef = Collections.auctions().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    }

    const auction: any = { id: doc.id, ...doc.data() };
    if (role === "seller") {
      const ownsShop = await userOwnsShop(auction.shop_id, user.id);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const update: any = { ...body, updated_at: new Date().toISOString() };
    delete update.id;
    delete update.shop_id;
    delete update.created_at;

    await docRef.update(update);
    const updated = await docRef.get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update auction" },
      { status: 500 },
    );
  }
}

// DELETE /api/auctions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const role = user.role;
    const { id } = await params;
    const docRef = Collections.auctions().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    }

    const auction: any = { id: doc.id, ...doc.data() };
    if (role === "seller") {
      const ownsShop = await userOwnsShop(auction.shop_id, user.id);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    await docRef.delete();
    return NextResponse.json({ success: true, message: "Auction deleted" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete auction" },
      { status: 500 },
    );
  }
}
