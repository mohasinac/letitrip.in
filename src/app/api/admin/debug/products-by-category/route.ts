import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/admin/debug/products-by-category
 * Debug endpoint to check products in categories
 */
export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      // Check specific category
      const productsSnap = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("category_id", "==", categoryId)
        .get();

      const products = productsSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        status: doc.data().status,
        is_deleted: doc.data().is_deleted,
        category_id: doc.data().category_id,
      }));

      const publishedCount = products.filter(
        (p) => p.status === "published" && p.is_deleted !== true
      ).length;

      return NextResponse.json({
        success: true,
        categoryId,
        totalProducts: products.length,
        publishedProducts: publishedCount,
        products,
      });
    }

    // Get all products grouped by category
    const productsSnap = await db.collection(COLLECTIONS.PRODUCTS).get();
    const products = productsSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      status: doc.data().status,
      is_deleted: doc.data().is_deleted,
      category_id: doc.data().category_id,
    }));

    const byCategory: Record<string, any> = {};
    products.forEach((product) => {
      const catId = product.category_id || "no_category";
      if (!byCategory[catId]) {
        byCategory[catId] = {
          total: 0,
          published: 0,
          products: [],
        };
      }
      byCategory[catId].total++;
      if (product.status === "published" && product.is_deleted !== true) {
        byCategory[catId].published++;
      }
      byCategory[catId].products.push(product);
    });

    // Get categories
    const categoriesSnap = await db.collection(COLLECTIONS.CATEGORIES).get();
    const categories = categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      product_count: doc.data().product_count,
      parent_ids: doc.data().parent_ids || [],
    }));

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      totalCategories: categories.length,
      productsByCategory: byCategory,
      categories,
      summary: {
        totalProducts: products.length,
        publishedProducts: products.filter(
          (p) => p.status === "published" && p.is_deleted !== true
        ).length,
        categoriesWithProducts: Object.keys(byCategory).length,
      },
    });
  } catch (error: any) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch debug info",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
