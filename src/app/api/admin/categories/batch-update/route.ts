import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyAdmin } from "@/lib/auth/firebase-api-auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const batch = db.batch();

    // Update each category
    for (const update of updates) {
      const { id, featured, isActive, sortOrder } = update;

      if (!id) {
        return NextResponse.json(
          { error: "Category ID is required for each update" },
          { status: 400 },
        );
      }

      const categoryRef = db.collection("categories").doc(id);

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (typeof featured === "boolean") {
        updateData.featured = featured;
      }

      if (typeof isActive === "boolean") {
        updateData.isActive = isActive;
      }

      if (typeof sortOrder === "number") {
        updateData.sortOrder = sortOrder;
      }

      batch.update(categoryRef, updateData);
    }

    // Commit all updates
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} categories`,
      updatedCount: updates.length,
    });
  } catch (error: any) {
    console.error("Batch update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update categories" },
      { status: 500 },
    );
  }
}
