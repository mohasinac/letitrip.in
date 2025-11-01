import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

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
    const product = {
      id: doc.id,
      ...doc.data(),
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
