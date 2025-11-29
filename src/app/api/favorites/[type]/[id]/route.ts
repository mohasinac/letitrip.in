import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const VALID_TYPES = ["product", "shop", "category", "auction"];

// POST /api/favorites/[type]/[id] - Add to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const key = `${user.id}_${type}_${id}`;
    const doc = await Collections.favorites().doc(key).get();

    if (doc.exists) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 400 },
      );
    }

    await Collections.favorites().doc(key).set({
      user_id: user.id,
      item_id: id,
      item_type: type,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 },
    );
  }
}

// DELETE /api/favorites/[type]/[id] - Remove from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const key = `${user.id}_${type}_${id}`;
    const doc = await Collections.favorites().doc(key).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Not in favorites" }, { status: 404 });
    }

    await Collections.favorites().doc(key).delete();

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 },
    );
  }
}

// GET /api/favorites/[type]/[id] - Check if in favorites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ isFavorite: false });
    }

    const { type, id } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const key = `${user.id}_${type}_${id}`;
    const doc = await Collections.favorites().doc(key).get();

    return NextResponse.json({
      isFavorite: doc.exists,
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    return NextResponse.json({ isFavorite: false });
  }
}
