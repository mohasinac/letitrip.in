import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { getAdminDb } from "@/lib/firebase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isFeatured } = await request.json();

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: "isFeatured must be a boolean" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Check if user exists and is a seller or admin
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData?.role !== 'seller' && userData?.role !== 'admin') {
      return NextResponse.json(
        { error: "User is not a seller or admin" },
        { status: 400 }
      );
    }

    // Update or create seller document with featured status
    await db.collection('sellers').doc(id).set({
      isFeatured,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Store ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
    });
  } catch (error) {
    console.error("Error updating featured status:", error);
    return NextResponse.json(
      { error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}
