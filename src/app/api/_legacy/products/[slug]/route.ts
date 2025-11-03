import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

// Helper functions to handle both nested and flattened data structures
const getProductQuantity = (product: any): number => {
  return product.inventory?.quantity ?? product.quantity ?? 0;
};

const getProductPrice = (product: any): number => {
  return product.pricing?.price ?? product.price ?? 0;
};

const getProductCompareAtPrice = (product: any): number | undefined => {
  return product.pricing?.compareAtPrice ?? product.compareAtPrice;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Product slug is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Query product by slug
    const productsRef = db.collection("products");
    const querySnapshot = await productsRef
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const doc = querySnapshot.docs[0];
    const productData = doc.data();
    
    // Transform product to ensure consistent structure
    const product = {
      id: doc.id,
      ...productData,
      // Ensure flattened fields are available for backward compatibility
      price: getProductPrice(productData),
      compareAtPrice: getProductCompareAtPrice(productData),
      quantity: getProductQuantity(productData),
      sku: productData.inventory?.sku ?? productData.sku,
      lowStockThreshold: productData.inventory?.lowStockThreshold ?? productData.lowStockThreshold ?? 1,
    };

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product", error: error.message },
      { status: 500 }
    );
  }
}
