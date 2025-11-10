import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    // Generate random shop data
    const shopId = `TEST_SHOP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shopData = {
      id: shopId,
      name: `TEST_SHOP_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      description: "Test shop for development and testing purposes",
      userId,
      email: `test.shop.${Date.now()}@example.com`,
      phone: "+1234567890",
      address: "123 Test Street, Test City, TC 12345",
      businessType: "retail",
      taxId: `TEST_TAX_${Date.now()}`,
      verified: Math.random() > 0.5,
      featured: Math.random() > 0.5,
      active: true,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5
      totalReviews: 0,
      totalProducts: 0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    await db.collection("shops").doc(shopId).set(shopData);

    return NextResponse.json({
      success: true,
      data: { id: shopId },
      message: "Test shop created successfully"
    });
  } catch (error: any) {
    console.error("Error creating test shop:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test shop" },
      { status: 500 }
    );
  }
}
