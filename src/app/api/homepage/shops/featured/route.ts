import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shopLimit = parseInt(searchParams.get("shopLimit") || "4", 10);
    const itemsPerShop = parseInt(searchParams.get("itemsPerShop") || "10", 10);

    const db = getFirestoreAdmin();

    // Get featured shops
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("featured", "==", true)
      .orderBy("featured_order", "asc")
      .limit(shopLimit)
      .get();

    const shops = [];

    for (const doc of shopsSnapshot.docs) {
      const data = doc.data();
      
      // Get products for this shop
      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("shop_id", "==", doc.id)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();

      // Filter in-stock products only
      const inStockProducts = productsSnapshot.docs
        .filter(doc => {
          const product = doc.data();
          return product.stock > 0;
        })
        .slice(0, itemsPerShop);

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

      shops.push({
        shop: {
          id: doc.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          logo: data.logo,
          banner: data.banner,
          rating: data.rating || 0,
          reviewCount: data.review_count || 0,
        },
        items,
      });
    }

    return NextResponse.json({ data: shops });
  } catch (error) {
    console.error("Featured shops error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch featured shops" },
      { status: 500 }
    );
  }
}
