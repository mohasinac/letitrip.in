import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryLimit = parseInt(searchParams.get("categoryLimit") || "6", 10);
    const itemsPerCategory = parseInt(searchParams.get("itemsPerCategory") || "10", 10);

    const db = getFirestoreAdmin();

    // Get featured categories
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("isActive", "==", true)
      .where("featured", "==", true)
      .orderBy("featured_order", "asc")
      .limit(categoryLimit)
      .get();

    const categories = [];

    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data();
      
      // Get products for this category
      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("category_id", "==", doc.id)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();

      // Filter in-stock products only
      const inStockProducts = productsSnapshot.docs
        .filter(doc => {
          const product = doc.data();
          return product.stock > 0;
        })
        .slice(0, itemsPerCategory);

      const items = inStockProducts.map((productDoc) => {
        const product = productDoc.data();
        return {
          id: productDoc.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images || [],
          rating: product.rating || 0,
          reviewCount: product.review_count || 0,
          inStock: true,
          shopId: product.shop_id,
          shopName: product.shop_name,
        };
      });

      categories.push({
        category: {
          id: doc.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          image: data.image,
          icon: data.icon,
        },
        items,
      });
    }

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Featured categories error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch featured categories" },
      { status: 500 }
    );
  }
}
