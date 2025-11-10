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
    const { count = 5, userId, shopId } = body;

    if (!userId || !shopId) {
      return NextResponse.json(
        { success: false, error: "userId and shopId are required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { success: false, error: "count must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    // Product name templates
    const productNames = [
      "Premium Widget", "Deluxe Gadget", "Pro Tool", "Smart Device",
      "Advanced Kit", "Elite Package", "Ultimate Bundle", "Super Product"
    ];

    const categories = ["electronics", "fashion", "home", "sports", "books"];
    const createdIds: string[] = [];

    // Create products
    for (let i = 0; i < count; i++) {
      const productId = `TEST_PROD_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const name = productNames[Math.floor(Math.random() * productNames.length)];

      const productData = {
        id: productId,
        name: `TEST_${name} #${i + 1}`,
        description: `Test product for development. SKU: TEST_SKU_${Date.now()}_${i}`,
        price: Math.floor(Math.random() * 90000 + 10000) / 100, // $10-$900
        compareAtPrice: Math.floor(Math.random() * 120000 + 15000) / 100,
        stock: Math.floor(Math.random() * 91) + 10, // 10-100
        sku: `TEST_SKU_${Date.now()}_${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        shopId,
        userId,
        status: Math.random() > 0.3 ? "published" : "draft",
        featured: Math.random() > 0.7,
        images: [],
        tags: ["test", "development"],
        rating: Math.floor(Math.random() * 3) + 3, // 3-5
        totalReviews: 0,
        totalSales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("products").doc(productId).set(productData);
      createdIds.push(productId);
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test products created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test products" },
      { status: 500 }
    );
  }
}
