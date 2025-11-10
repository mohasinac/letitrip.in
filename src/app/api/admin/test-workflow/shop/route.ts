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
    const {
      userId,
      ownerId,
      name,
      slug,
      description,
      email,
      phone,
      location,
      address,
      logo,
      banner,
      isActive,
      verified,
      featured,
    } = body;

    // Accept both userId and ownerId for flexibility
    const shopOwnerId = userId || ownerId;

    if (!shopOwnerId) {
      return NextResponse.json(
        { success: false, error: "userId or ownerId is required" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    // Generate random shop data or use provided data
    const shopId = `TEST_SHOP_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const shopData = {
      id: shopId,
      name:
        name ||
        `TEST_SHOP_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      slug: slug || `test-shop-${Date.now()}`,
      description:
        description || "Test shop for development and testing purposes",
      ownerId: shopOwnerId,
      userId: shopOwnerId, // Keep both for compatibility
      email: email || `test.shop.${Date.now()}@example.com`,
      phone: phone || "+919876543210",
      location: location || "Mumbai, Maharashtra, India",
      address: address || "123 Test Street, Test City, TC 12345",
      logo: logo || null,
      banner: banner || null,
      businessType: "retail",
      taxId: `TEST_TAX_${Date.now()}`,
      verified: verified !== undefined ? verified : Math.random() > 0.5,
      featured: featured !== undefined ? featured : Math.random() > 0.5,
      isActive: isActive !== undefined ? isActive : true,
      active: isActive !== undefined ? isActive : true, // Keep both for compatibility
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
      message: "Test shop created successfully",
    });
  } catch (error: any) {
    console.error("Error creating test shop:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test shop" },
      { status: 500 }
    );
  }
}
