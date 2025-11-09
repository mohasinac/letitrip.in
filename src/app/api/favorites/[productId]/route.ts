import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

// DELETE /api/favorites/[productId] - Remove from favorites
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { productId } = await params;

    // TODO: Get user_id from session
    const userId = req.headers.get("x-user-id") || "demo-user";

    // Find favorite
    const snapshot = await db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", userId)
      .where("product_id", "==", productId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 },
      );
    }

    // Delete favorite
    await snapshot.docs[0].ref.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
